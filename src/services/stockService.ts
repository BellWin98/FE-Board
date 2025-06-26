import apiClient from './api';
import type {
  Stock,
  StockPrice,
  Holding,
  PortfolioItem,
  PortfolioSummary,
  IndustryAnalysis,
  Transaction,
  AddHoldingRequest,
  UpdateHoldingRequest,
  AddTransactionRequest,
  StockSearchResult,
  PortfolioFilters,
  AlertSetting,
  PortfolioChartData,
  MarketStatus,
  StockNews,
  StockRecommendation
} from '../types/stock';

// 포트폴리오 관련 API 서비스
export const portfolioService = {
  // 포트폴리오 전체 조회
  async getPortfolio(filters?: PortfolioFilters): Promise<PortfolioItem[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.industries?.length) {
        params.append('industries', filters.industries.join(','));
      }
      if (filters.gainLossType) {
        params.append('gainLossType', filters.gainLossType);
      }
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters.sortOrder) {
        params.append('sortOrder', filters.sortOrder);
      }
      if (filters.searchQuery) {
        params.append('search', filters.searchQuery);
      }
    }

    const response = await apiClient.get<PortfolioItem[]>(
      `/portfolio?${params.toString()}`
    );
    return response.data;
  },

  // 포트폴리오 요약 정보 조회
  async getPortfolioSummary(): Promise<PortfolioSummary> {
    const response = await apiClient.get<PortfolioSummary>('/portfolio/summary');
    return response.data;
  },

  // 산업별 분석 데이터 조회
  async getIndustryAnalysis(): Promise<IndustryAnalysis[]> {
    const response = await apiClient.get<IndustryAnalysis[]>('/portfolio/industry-analysis');
    return response.data;
  },

  // 보유 종목 추가
  async addHolding(holding: AddHoldingRequest): Promise<Holding> {
    const response = await apiClient.post<Holding>('/portfolio/holdings', holding);
    return response.data;
  },

  // 보유 종목 수정
  async updateHolding(holdingId: string, updates: UpdateHoldingRequest): Promise<Holding> {
    const response = await apiClient.put<Holding>(`/portfolio/holdings/${holdingId}`, updates);
    return response.data;
  },

  // 보유 종목 삭제
  async deleteHolding(holdingId: string): Promise<void> {
    await apiClient.delete(`/portfolio/holdings/${holdingId}`);
  },

  // 포트폴리오 차트 데이터 조회
  async getPortfolioChart(period: string): Promise<PortfolioChartData> {
    const response = await apiClient.get<PortfolioChartData>(`/portfolio/chart?period=${period}`);
    return response.data;
  }
};

// 주식 정보 관련 API 서비스
export const stockService = {
  // 주식 검색
  async searchStocks(query: string, limit: number = 10): Promise<StockSearchResult[]> {
    const response = await apiClient.get<StockSearchResult[]>(
      `/stocks/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data;
  },

  // 특정 주식 정보 조회
  async getStockInfo(symbol: string): Promise<Stock> {
    const response = await apiClient.get<Stock>(`/stocks/${symbol}`);
    return response.data;
  },

  // 실시간 주가 정보 조회
  async getStockPrice(symbol: string): Promise<StockPrice> {
    const response = await apiClient.get<StockPrice>(`/stocks/${symbol}/price`);
    return response.data;
  },

  // 여러 종목의 실시간 주가 정보 일괄 조회
  async getMultipleStockPrices(symbols: string[]): Promise<StockPrice[]> {
    const response = await apiClient.post<StockPrice[]>('/stocks/prices', {
      symbols
    });
    return response.data;
  },

  // 시장 상태 조회
  async getMarketStatus(): Promise<MarketStatus> {
    const response = await apiClient.get<MarketStatus>('/market/status');
    return response.data;
  },

  // 인기 종목 조회
  async getPopularStocks(limit: number = 20): Promise<StockSearchResult[]> {
    const response = await apiClient.get<StockSearchResult[]>(`/stocks/popular?limit=${limit}`);
    return response.data;
  }
};

// 거래 기록 관련 API 서비스
export const transactionService = {
  // 거래 기록 조회
  async getTransactions(
    page: number = 0,
    size: number = 20,
    symbol?: string
  ): Promise<{ content: Transaction[]; totalElements: number; totalPages: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    
    if (symbol) {
      params.append('symbol', symbol);
    }

    const response = await apiClient.get(`/transactions?${params.toString()}`);
    return response.data;
  },

  // 거래 기록 추가
  async addTransaction(transaction: AddTransactionRequest): Promise<Transaction> {
    const response = await apiClient.post<Transaction>('/transactions', transaction);
    return response.data;
  },

  // 거래 기록 수정
  async updateTransaction(transactionId: string, updates: Partial<AddTransactionRequest>): Promise<Transaction> {
    const response = await apiClient.put<Transaction>(`/transactions/${transactionId}`, updates);
    return response.data;
  },

  // 거래 기록 삭제
  async deleteTransaction(transactionId: string): Promise<void> {
    await apiClient.delete(`/transactions/${transactionId}`);
  }
};

// 알림 관련 API 서비스
export const alertService = {
  // 알림 설정 조회
  async getAlerts(): Promise<AlertSetting[]> {
    const response = await apiClient.get<AlertSetting[]>('/alerts');
    return response.data;
  },

  // 알림 설정 추가
  async addAlert(alert: Omit<AlertSetting, 'id' | 'userId' | 'createdAt'>): Promise<AlertSetting> {
    const response = await apiClient.post<AlertSetting>('/alerts', alert);
    return response.data;
  },

  // 알림 설정 수정
  async updateAlert(alertId: string, updates: Partial<AlertSetting>): Promise<AlertSetting> {
    const response = await apiClient.put<AlertSetting>(`/alerts/${alertId}`, updates);
    return response.data;
  },

  // 알림 설정 삭제
  async deleteAlert(alertId: string): Promise<void> {
    await apiClient.delete(`/alerts/${alertId}`);
  },

  // 알림 활성화/비활성화
  async toggleAlert(alertId: string, isActive: boolean): Promise<AlertSetting> {
    const response = await apiClient.patch<AlertSetting>(`/alerts/${alertId}/toggle`, {
      isActive
    });
    return response.data;
  }
};

// 뉴스 관련 API 서비스
export const newsService = {
  // 종목 관련 뉴스 조회
  async getStockNews(symbol: string, limit: number = 10): Promise<StockNews[]> {
    const response = await apiClient.get<StockNews[]>(
      `/news/stocks/${symbol}?limit=${limit}`
    );
    return response.data;
  },

  // 일반 시장 뉴스 조회
  async getMarketNews(limit: number = 20): Promise<StockNews[]> {
    const response = await apiClient.get<StockNews[]>(`/news/market?limit=${limit}`);
    return response.data;
  },

  // 내 포트폴리오 관련 뉴스 조회
  async getPortfolioNews(limit: number = 15): Promise<StockNews[]> {
    const response = await apiClient.get<StockNews[]>(`/news/portfolio?limit=${limit}`);
    return response.data;
  }
};

// 추천 관련 API 서비스
export const recommendationService = {
  // 종목 추천 정보 조회
  async getStockRecommendations(symbol: string): Promise<StockRecommendation[]> {
    const response = await apiClient.get<StockRecommendation[]>(
      `/recommendations/stocks/${symbol}`
    );
    return response.data;
  },

  // 포트폴리오 기반 추천 종목 조회
  async getPortfolioBasedRecommendations(limit: number = 10): Promise<StockSearchResult[]> {
    const response = await apiClient.get<StockSearchResult[]>(
      `/recommendations/portfolio?limit=${limit}`
    );
    return response.data;
  }
};

// 계산 유틸리티 함수들
export const calculationUtils = {
  // 수익률 계산
  calculateGainRate: (currentPrice: number, averagePrice: number): number => {
    return ((currentPrice - averagePrice) / averagePrice) * 100;
  },

  // 52주 최고가 대비 하락률 계산
  calculateWeek52HighDropRate: (currentPrice: number, week52High: number): number => {
    return ((week52High - currentPrice) / week52High) * 100;
  },

  // 포트폴리오 비중 계산
  calculateWeight: (itemValue: number, totalValue: number): number => {
    return totalValue > 0 ? (itemValue / totalValue) * 100 : 0;
  },

  // 평균 매수가 계산 (추가 매수 시)
  calculateNewAveragePrice: (
    existingQuantity: number,
    existingAveragePrice: number,
    newQuantity: number,
    newPrice: number
  ): number => {
    const totalValue = existingQuantity * existingAveragePrice + newQuantity * newPrice;
    const totalQuantity = existingQuantity + newQuantity;
    return totalQuantity > 0 ? totalValue / totalQuantity : 0;
  },

  // 배당수익률 계산 (연간 배당금 / 현재 주가)
  calculateDividendYield: (annualDividend: number, currentPrice: number): number => {
    return currentPrice > 0 ? (annualDividend / currentPrice) * 100 : 0;
  },

  // PER (주가수익비율) 계산
  calculatePER: (currentPrice: number, earningsPerShare: number): number => {
    return earningsPerShare > 0 ? currentPrice / earningsPerShare : 0;
  },

  // 변동성 계산 (표준편차 기반)
  calculateVolatility: (prices: number[]): number => {
    if (prices.length < 2) return 0;
    
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    return Math.sqrt(variance);
  },

  // 위험 조정 수익률 (샤프 비율 간소화 버전)
  calculateRiskAdjustedReturn: (returnRate: number, volatility: number, riskFreeRate: number = 2.5): number => {
    return volatility > 0 ? (returnRate - riskFreeRate) / volatility : 0;
  }
};

// 포맷팅 유틸리티 함수들
export const formatUtils = {
  // 통화 포맷팅 (한국 원화)
  formatCurrency: (amount: number, showSymbol: boolean = true): string => {
    const formatted = new Intl.NumberFormat('ko-KR').format(Math.abs(amount));
    const symbol = showSymbol ? '₩' : '';
    return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
  },

  // 퍼센트 포맷팅
  formatPercent: (rate: number, decimalPlaces: number = 2): string => {
    const formatted = rate.toFixed(decimalPlaces);
    return `${rate >= 0 ? '+' : ''}${formatted}%`;
  },

  // 거래량 포맷팅 (천, 만, 억 단위)
  formatVolume: (volume: number): string => {
    if (volume >= 100000000) {
      return `${(volume / 100000000).toFixed(1)}억`;
    } else if (volume >= 10000) {
      return `${(volume / 10000).toFixed(1)}만`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}천`;
    }
    return volume.toString();
  },

  // 시간 포맷팅
  formatTime: (timestamp: string): string => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp));
  },

  // 상대 시간 포맷팅 (방금 전, 1분 전 등)
  formatRelativeTime: (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return '방금 전';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}분 전`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)}일 전`;
    }
  }
};

export default {
  portfolio: portfolioService,
  stock: stockService,
  transaction: transactionService,
  alert: alertService,
  news: newsService,
  recommendation: recommendationService,
  calculation: calculationUtils,
  format: formatUtils
};