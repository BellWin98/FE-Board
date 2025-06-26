import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import stockService from '../services/stockService';
import { useAuth } from './AuthContext';
import type {
  PortfolioItem,
  PortfolioSummary,
  IndustryAnalysis,
  StockPrice,
  PortfolioFilters,
  RealtimeMessage,
  PriceUpdateMessage,
  MarketStatus
} from '../types/stock';

// WebSocket 연결 상태
type WebSocketStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

// 포트폴리오 컨텍스트 타입 정의
interface PortfolioContextType {
  // 데이터 상태
  portfolio: PortfolioItem[];
  summary: PortfolioSummary | null;
  industryAnalysis: IndustryAnalysis[];
  marketStatus: MarketStatus | null;
  
  // UI 상태
  loading: boolean;
  error: string | null;
  filters: PortfolioFilters;
  
  // 실시간 상태
  wsStatus: WebSocketStatus;
  lastUpdated: string | null;
  
  // 액션 함수들
  refreshPortfolio: () => Promise<void>;
  updateFilters: (newFilters: Partial<PortfolioFilters>) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  
  // 계산된 값들
  filteredPortfolio: PortfolioItem[];
  totalGainLoss: number;
  totalGainLossRate: number;
  bestPerformer: PortfolioItem | null;
  worstPerformer: PortfolioItem | null;
}

// 기본값으로 컨텍스트 생성
const PortfolioContext = createContext<PortfolioContextType | null>(null);

// WebSocket URL 구성
const getWebSocketUrl = (): string => {
  const baseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080';
  return `${baseUrl}/ws/portfolio`;
};

// 컨텍스트 프로바이더 컴포넌트
export const PortfolioProvider = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, user } = useAuth();
  
  // 기본 상태
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [industryAnalysis, setIndustryAnalysis] = useState<IndustryAnalysis[]>([]);
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  
  // UI 상태
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PortfolioFilters>({
    sortBy: 'gainRate',
    sortOrder: 'desc'
  });
  
  // 실시간 상태
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>('DISCONNECTED');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // WebSocket 관련 ref
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttempts = useRef<number>(0);
  const maxReconnectAttempts = 5;
  
  // 초기 데이터 로딩
  const loadInitialData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 병렬로 데이터 로딩
      const [portfolioData, summaryData, industryData, marketData] = await Promise.all([
        stockService.portfolio.getPortfolio(filters),
        stockService.portfolio.getPortfolioSummary(),
        stockService.portfolio.getIndustryAnalysis(),
        stockService.stock.getMarketStatus()
      ]);
      
      setPortfolio(portfolioData);
      setSummary(summaryData);
      setIndustryAnalysis(industryData);
      setMarketStatus(marketData);
      setLastUpdated(new Date().toISOString());
      
    } catch (err) {
      console.error('포트폴리오 데이터 로딩 실패:', err);
      setError('포트폴리오 데이터를 불러오는데 실패했습니다.');
      toast.error('포트폴리오 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filters]);

  // 개별 주식 가격 업데이트
  const updateStockPrice = useCallback((symbol: string, priceUpdate: Partial<StockPrice>) => {
    setPortfolio(prevPortfolio => 
      prevPortfolio.map(item => {
        if (item.holding.stock.symbol === symbol) {
          const updatedPrice = { ...item.currentPrice, ...priceUpdate };
          const currentValue = updatedPrice.currentPrice * item.holding.quantity;
          const unrealizedGain = currentValue - item.holding.totalInvestment;
          const unrealizedGainRate = (unrealizedGain / item.holding.totalInvestment) * 100;
          const profitPerShare = updatedPrice.currentPrice - item.holding.averagePrice;
          const week52HighDropRate = stockService.calculation.calculateWeek52HighDropRate(
            updatedPrice.currentPrice,
            updatedPrice.week52High
          );
          
          return {
            ...item,
            currentPrice: updatedPrice,
            currentValue,
            unrealizedGain,
            unrealizedGainRate,
            profitPerShare,
            week52HighDropRate
          };
        }
        return item;
      })
    );

    // 요약 정보도 업데이트
    setSummary(prevSummary => {
      if (!prevSummary) return null;
      
      // 업데이트된 포트폴리오를 기반으로 새로운 요약 계산
      // 실제로는 더 정교한 계산이 필요하지만, 여기서는 간소화
      return {
        ...prevSummary,
        lastUpdated: new Date().toISOString()
      };
    });
  }, []);  

  // 실시간 메시지 처리
  const handleRealtimeMessage = useCallback((message: RealtimeMessage) => {
    switch (message.type) {
      case 'PRICE_UPDATE': {
        const priceUpdate = message as PriceUpdateMessage;
        updateStockPrice(priceUpdate.data.symbol, priceUpdate.data.price);
        break;
      }
        
      case 'MARKET_STATUS':
        setMarketStatus(message.data);
        break;
        
      case 'ALERT':
        toast.info(message.data.message, {
          position: "top-right",
          autoClose: 5000,
        });
        break;
        
      default:
        console.log('알 수 없는 메시지 타입:', message.type);
    }
    
    setLastUpdated(message.timestamp);
  }, [updateStockPrice]);

// WebSocket 연결 설정
const connectWebSocket = useCallback(() => {
    if (!isAuthenticated || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setWsStatus('CONNECTING');
      const token = localStorage.getItem('authToken');
      const wsUrl = `${getWebSocketUrl()}?token=${encodeURIComponent(token || '')}`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket 연결 성공');
        setWsStatus('CONNECTED');
        reconnectAttempts.current = 0;
        
        // 포트폴리오 종목들 구독 요청
        if (portfolio.length > 0) {
          const symbols = portfolio.map(item => item.holding.stock.symbol);
          wsRef.current?.send(JSON.stringify({
            type: 'SUBSCRIBE',
            symbols
          }));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);
          handleRealtimeMessage(message);
        } catch (err) {
          console.error('WebSocket 메시지 파싱 실패:', err);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket 연결 종료:', event.code, event.reason);
        setWsStatus('DISCONNECTED');
        
        // 자동 재연결 시도 (지수 백오프)
        if (reconnectAttempts.current < maxReconnectAttempts && isAuthenticated) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectWebSocket();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket 에러:', error);
        setWsStatus('ERROR');
      };

    } catch (err) {
      console.error('WebSocket 연결 실패:', err);
      setWsStatus('ERROR');
    }
  }, [isAuthenticated, portfolio, handleRealtimeMessage]);  

  // 포트폴리오 새로고침
  const refreshPortfolio = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  // 필터 업데이트
  const updateFilters = useCallback((newFilters: Partial<PortfolioFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // 관심종목 추가/제거 (WebSocket 구독 관리)
  const addToWatchlist = useCallback((symbol: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'SUBSCRIBE',
        symbols: [symbol]
      }));
    }
  }, []);

  const removeFromWatchlist = useCallback((symbol: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'UNSUBSCRIBE',
        symbols: [symbol]
      }));
    }
  }, []);

  // 필터링된 포트폴리오 계산
  const filteredPortfolio = useMemo(() => {
    let filtered = [...portfolio];

    // 산업 필터
    if (filters.industries?.length) {
      filtered = filtered.filter(item => 
        filters.industries!.includes(item.holding.stock.industry)
      );
    }

    // 손익 타입 필터
    if (filters.gainLossType && filters.gainLossType !== 'ALL') {
      filtered = filtered.filter(item => {
        const isGain = item.unrealizedGain > 0;
        return filters.gainLossType === 'GAIN' ? isGain : !isGain;
      });
    }

    // 검색 쿼리 필터
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.holding.stock.name.toLowerCase().includes(query) ||
        item.holding.stock.symbol.toLowerCase().includes(query)
      );
    }

    // 정렬
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: number, bValue: number;
        
        switch (filters.sortBy) {
          case 'name':
            return filters.sortOrder === 'asc' 
              ? a.holding.stock.name.localeCompare(b.holding.stock.name)
              : b.holding.stock.name.localeCompare(a.holding.stock.name);
          case 'gainRate':
            aValue = a.unrealizedGainRate;
            bValue = b.unrealizedGainRate;
            break;
          case 'currentValue':
            aValue = a.currentValue;
            bValue = b.currentValue;
            break;
          case 'dailyChange':
            aValue = a.currentPrice.dailyChangeRate;
            bValue = b.currentPrice.dailyChangeRate;
            break;
          default:
            return 0;
        }
        
        return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    return filtered;
  }, [portfolio, filters]);

  // 계산된 성과 지표들
  const totalGainLoss = useMemo(() => {
    return filteredPortfolio.reduce((sum, item) => sum + item.unrealizedGain, 0);
  }, [filteredPortfolio]);

  const totalGainLossRate = useMemo(() => {
    const totalInvestment = filteredPortfolio.reduce((sum, item) => sum + item.holding.totalInvestment, 0);
    return totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;
  }, [filteredPortfolio, totalGainLoss]);

  const bestPerformer = useMemo(() => {
    return filteredPortfolio.reduce((best, current) => 
      !best || current.unrealizedGainRate > best.unrealizedGainRate ? current : best
    , null as PortfolioItem | null);
  }, [filteredPortfolio]);

  const worstPerformer = useMemo(() => {
    return filteredPortfolio.reduce((worst, current) => 
      !worst || current.unrealizedGainRate < worst.unrealizedGainRate ? current : worst
    , null as PortfolioItem | null);
  }, [filteredPortfolio]);

  // 이펙트: 인증 상태 변경 시 데이터 로딩
  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
      connectWebSocket();
    } else {
      // 로그아웃 시 상태 초기화
      setPortfolio([]);
      setSummary(null);
      setIndustryAnalysis([]);
      setMarketStatus(null);
      setError(null);
      
      // WebSocket 연결 해제
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    }
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, loadInitialData, connectWebSocket]);

  // 이펙트: 필터 변경 시 데이터 다시 로딩
  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [filters.industries, filters.gainLossType, loadInitialData]);

  // 이펙트: 포트폴리오 변경 시 WebSocket 구독 업데이트
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && portfolio.length > 0) {
      const symbols = portfolio.map(item => item.holding.stock.symbol);
      wsRef.current.send(JSON.stringify({
        type: 'SUBSCRIBE',
        symbols
      }));
    }
  }, [portfolio]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // 컨텍스트 값 구성
  const value: PortfolioContextType = {
    // 데이터 상태
    portfolio,
    summary,
    industryAnalysis,
    marketStatus,
    
    // UI 상태
    loading,
    error,
    filters,
    
    // 실시간 상태
    wsStatus,
    lastUpdated,
    
    // 액션 함수들
    refreshPortfolio,
    updateFilters,
    addToWatchlist,
    removeFromWatchlist,
    
    // 계산된 값들
    filteredPortfolio,
    totalGainLoss,
    totalGainLossRate,
    bestPerformer,
    worstPerformer
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

// 커스텀 훅 - 포트폴리오 컨텍스트 사용을 위한 편의 함수
export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

export default PortfolioContext;