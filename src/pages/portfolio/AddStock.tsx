import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { usePortfolio } from '../../contexts/PortfolioContext';
import stockService from '../../services/stockService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import type { StockSearchResult, StockPrice } from '../../types/stock';

const AddStock: React.FC = () => {
  const navigate = useNavigate();
  const { refreshPortfolio } = usePortfolio();
  
  // 상태 관리
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null);
  const [stockPrice, setStockPrice] = useState<StockPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [step, setStep] = useState<'search' | 'details'>('search');
  
  // 폼 상태
  const [formData, setFormData] = useState({
    quantity: '',
    averagePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    note: ''
  });

  // 검색 디바운스를 위한 ref
  const searchTimeoutRef = useRef<number | null>(null);

  // 검색 함수
  const searchStocks = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await stockService.stock.searchStocks(query);
      setSearchResults(results);
    } catch (error) {
      console.error('주식 검색 실패:', error);
      toast.error('주식 검색에 실패했습니다.');
    } finally {
      setSearchLoading(false);
    }
  };

  // 검색 입력 핸들러 (디바운스 적용)
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchStocks(value);
    }, 300);
  };

  // 종목 선택 핸들러
  const handleStockSelect = async (stock: StockSearchResult) => {
    setSelectedStock(stock);
    setLoading(true);
    
    try {
      // 선택된 종목의 현재 가격 정보 가져오기
      const priceData = await stockService.stock.getStockPrice(stock.symbol);
      setStockPrice(priceData);
      
      // 현재가를 기본 매수가로 설정
      setFormData(prev => ({
        ...prev,
        averagePrice: priceData.currentPrice.toString()
      }));
      
      setStep('details');
    } catch (error) {
      console.error('주가 정보 로딩 실패:', error);
      toast.error('주가 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 포트폴리오에 추가
  const handleAddToPortfolio = async () => {
    if (!selectedStock || !formData.quantity || !formData.averagePrice) {
      toast.error('모든 필수 항목을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await stockService.portfolio.addHolding({
        symbol: selectedStock.symbol,
        quantity: parseInt(formData.quantity),
        averagePrice: parseFloat(formData.averagePrice),
        purchaseDate: formData.purchaseDate,
        note: formData.note || undefined
      });

      toast.success(`${selectedStock.name}이(가) 포트폴리오에 추가되었습니다.`);
      await refreshPortfolio();
      navigate('/portfolio');
      
    } catch (error) {
      console.error('종목 추가 실패:', error);
      toast.error('종목 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 계산된 값들
  const totalInvestment = formData.quantity && formData.averagePrice 
    ? parseInt(formData.quantity) * parseFloat(formData.averagePrice)
    : 0;

  const currentValue = formData.quantity && stockPrice
    ? parseInt(formData.quantity) * stockPrice.currentPrice
    : 0;

  const unrealizedGain = currentValue - totalInvestment;
  const unrealizedGainRate = totalInvestment > 0 ? (unrealizedGain / totalInvestment) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => step === 'search' ? navigate('/portfolio') : setStep('search')}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          }
        >
          {step === 'search' ? '포트폴리오' : '검색으로 돌아가기'}
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            종목 추가
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {step === 'search' ? '추가할 종목을 검색하세요' : '보유 정보를 입력하세요'}
          </p>
        </div>
      </div>

      {step === 'search' ? (
        /* 검색 단계 */
        <Card title="종목 검색" hover={false}>
          <div className="space-y-4">
            <Input
              placeholder="종목명 또는 종목코드를 입력하세요 (예: 삼성전자, 005930)"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              icon={
                searchLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )
              }
            />

            {/* 검색 결과 */}
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => handleStockSelect(stock)}
                    className="w-full p-4 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {stock.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {stock.symbol}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {stock.market}
                          </span>
                          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs">
                            {stock.industry}
                          </span>
                        </div>
                      </div>
                      {stock.currentPrice && (
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {stockService.format.formatCurrency(stock.currentPrice)}
                          </p>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && !searchLoading && (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">
                  검색 결과가 없습니다
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  다른 키워드로 검색해보세요
                </p>
              </div>
            )}

            {searchQuery.length < 2 && (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">
                  종목명 또는 종목코드를 입력하세요
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  최소 2글자 이상 입력해주세요
                </p>
              </div>
            )}
          </div>
        </Card>
      ) : (
        /* 상세 정보 입력 단계 */
        <div className="space-y-6">
          {/* 선택된 종목 정보 */}
          {selectedStock && stockPrice && (
            <Card title="선택된 종목" hover={false}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedStock.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {selectedStock.symbol}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
                      {selectedStock.industry}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stockService.format.formatCurrency(stockPrice.currentPrice)}
                  </p>
                  <p className={`text-sm ${stockPrice.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stockPrice.dailyChange >= 0 ? '+' : ''}{stockService.format.formatCurrency(stockPrice.dailyChange)}
                    ({stockService.format.formatPercent(stockPrice.dailyChangeRate)})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">일일 최고가</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {stockService.format.formatCurrency(stockPrice.dailyHigh)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">일일 최저가</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {stockService.format.formatCurrency(stockPrice.dailyLow)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">52주 최고가</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {stockService.format.formatCurrency(stockPrice.week52High)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">52주 최저가</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {stockService.format.formatCurrency(stockPrice.week52Low)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* 보유 정보 입력 */}
          <Card title="보유 정보 입력" hover={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="보유 수량 *"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="보유하고 있는 주식 수량을 입력하세요"
              />

              <Input
                label="평균 매수가 *"
                type="number"
                min="0"
                step="100"
                value={formData.averagePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, averagePrice: e.target.value }))}
                placeholder="주당 평균 매수가를 입력하세요"
              />

              <Input
                label="매수일"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
              />

              <Input
                label="메모 (선택)"
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                placeholder="투자 목적이나 기타 메모를 입력하세요"
              />
            </div>

            {/* 계산된 정보 미리보기 */}
            {formData.quantity && formData.averagePrice && stockPrice && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  투자 요약
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                      총 투자금액
                    </h5>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      {stockService.format.formatCurrency(totalInvestment)}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {formData.quantity}주 × {stockService.format.formatCurrency(parseFloat(formData.averagePrice))}
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h5 className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                      현재 평가금액
                    </h5>
                    <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      {stockService.format.formatCurrency(currentValue)}
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                      {formData.quantity}주 × {stockService.format.formatCurrency(stockPrice.currentPrice)}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    unrealizedGain >= 0 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <h5 className={`text-sm font-medium mb-1 ${
                      unrealizedGain >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      예상 손익
                    </h5>
                    <p className={`text-xl font-bold ${
                      unrealizedGain >= 0 
                        ? 'text-green-900 dark:text-green-100' 
                        : 'text-red-900 dark:text-red-100'
                    }`}>
                      {stockService.format.formatCurrency(unrealizedGain)}
                    </p>
                    <p className={`text-sm mt-1 ${
                      unrealizedGain >= 0 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {stockService.format.formatPercent(unrealizedGainRate)}
                    </p>
                  </div>
                </div>

                {/* 위험도 알림 */}
                {Math.abs(unrealizedGainRate) > 20 && (
                  <div className={`mt-4 p-4 rounded-lg border ${
                    unrealizedGainRate > 20
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                  }`}>
                    <div className="flex items-start gap-3">
                      <svg className={`w-5 h-5 mt-0.5 ${
                        unrealizedGainRate > 20 ? 'text-green-600' : 'text-red-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h6 className={`font-medium ${
                          unrealizedGainRate > 20 ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                        }`}>
                          {unrealizedGainRate > 20 ? '높은 수익률 감지' : '높은 손실률 감지'}
                        </h6>
                        <p className={`text-sm mt-1 ${
                          unrealizedGainRate > 20 
                            ? 'text-green-700 dark:text-green-300' 
                            : 'text-red-700 dark:text-red-300'
                        }`}>
                          {unrealizedGainRate > 20
                            ? '현재 시세가 매수가보다 상당히 높습니다. 매수가를 다시 확인해주세요.'
                            : '현재 시세가 매수가보다 상당히 낮습니다. 매수가를 다시 확인해주세요.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* 액션 버튼 */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setStep('search')}
              fullWidth
            >
              다른 종목 선택
            </Button>
            <Button
              variant="primary"
              onClick={handleAddToPortfolio}
              disabled={loading || !formData.quantity || !formData.averagePrice}
              isLoading={loading}
              fullWidth
            >
              포트폴리오에 추가
            </Button>
          </div>
        </div>
      )}

      {/* 인기 종목 추천 (검색 단계에서만 표시) */}
      {step === 'search' && searchQuery.length < 2 && (
        <Card title="인기 종목" hover={false}>
          <PopularStocks onStockSelect={handleStockSelect} />
        </Card>
      )}
    </div>
  );
};

// 인기 종목 컴포넌트
interface PopularStocksProps {
  onStockSelect: (stock: StockSearchResult) => void;
}

const PopularStocks: React.FC<PopularStocksProps> = ({ onStockSelect }) => {
  const [popularStocks, setPopularStocks] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPopularStocks = async () => {
      try {
        const stocks = await stockService.stock.getPopularStocks(10);
        setPopularStocks(stocks);
      } catch (error) {
        console.error('인기 종목 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPopularStocks();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (popularStocks.length === 0) {
    return (
      <p className="text-center py-8 text-gray-600 dark:text-gray-400">
        인기 종목 정보를 불러올 수 없습니다.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {popularStocks.map((stock) => (
        <button
          key={stock.symbol}
          onClick={() => onStockSelect(stock)}
          className="p-4 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <h4 className="font-medium text-gray-900 dark:text-white">
            {stock.name}
          </h4>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {stock.symbol}
            </span>
            {stock.currentPrice && (
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {stockService.format.formatCurrency(stock.currentPrice)}
              </span>
            )}
          </div>
          <div className="mt-1">
            <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
              {stock.industry}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default AddStock;