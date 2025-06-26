import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar } from 'recharts';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { useTheme } from '../../contexts/ThemeContext';
import stockService from '../../services/stockService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import type { PortfolioItem, StockNews, Transaction, AlertSetting } from '../../types/stock';

const StockDetail = () => {
  const { holdingId } = useParams<{ holdingId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { portfolio, refreshPortfolio } = usePortfolio();
  
  // 상태 관리
  const [portfolioItem, setPortfolioItem] = useState<PortfolioItem | null>(null);
  const [news, setNews] = useState<StockNews[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<AlertSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<'1D' | '1W' | '1M' | '3M' | '6M' | '1Y'>('1M');
  
  // 모달 상태
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // 폼 상태
  const [transactionForm, setTransactionForm] = useState({
    type: 'BUY' as 'BUY' | 'SELL',
    quantity: '',
    price: '',
    transactionDate: new Date().toISOString().split('T')[0],
    fee: '',
    note: ''
  });

  const [alertForm, setAlertForm] = useState({
    type: 'PRICE_TARGET' as 'PRICE_TARGET' | 'GAIN_LOSS_RATE',
    condition: 'ABOVE' as 'ABOVE' | 'BELOW',
    targetValue: '',
    message: ''
  });

  // 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      if (!holdingId) return;
      
      setLoading(true);
      try {
        // 포트폴리오에서 해당 아이템 찾기
        const item = portfolio.find(p => p.holding.id === holdingId);
        if (!item) {
          navigate('/portfolio');
          return;
        }
        setPortfolioItem(item);

        // 병렬로 추가 데이터 로딩
        const [newsData, transactionsData, alertsData] = await Promise.all([
          stockService.news.getStockNews(item.holding.stock.symbol),
          stockService.transaction.getTransactions(0, 50, item.holding.stock.symbol),
          stockService.alert.getAlerts()
        ]);

        setNews(newsData);
        setTransactions(transactionsData.content);
        setAlerts(alertsData.filter(alert => alert.symbol === item.holding.stock.symbol));
        
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [holdingId, portfolio, navigate]);

  // 차트 데이터 생성 (모의 데이터)
  const chartData = useMemo(() => {
    if (!portfolioItem) return [];
    
    const data = [];
    const today = new Date();
    const days = chartPeriod === '1D' ? 1 : chartPeriod === '1W' ? 7 : chartPeriod === '1M' ? 30 : 
                 chartPeriod === '3M' ? 90 : chartPeriod === '6M' ? 180 : 365;
    
    const basePrice = portfolioItem.currentPrice.currentPrice;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const variation = (Math.sin(i * 0.1) + Math.random() * 0.4 - 0.2) * basePrice * 0.1;
      const price = basePrice + variation;
      const volume = Math.floor(Math.random() * 1000000) + 100000;
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.max(price, basePrice * 0.7),
        volume,
        averagePrice: portfolioItem.holding.averagePrice
      });
    }
    
    return data;
  }, [portfolioItem, chartPeriod]);

  // 거래 추가 핸들러
  const handleAddTransaction = async () => {
    if (!portfolioItem) return;
    
    try {
      await stockService.transaction.addTransaction({
        symbol: portfolioItem.holding.stock.symbol,
        type: transactionForm.type,
        quantity: parseInt(transactionForm.quantity),
        price: parseFloat(transactionForm.price),
        transactionDate: transactionForm.transactionDate,
        fee: transactionForm.fee ? parseFloat(transactionForm.fee) : undefined,
        note: transactionForm.note || undefined
      });
      
      setShowAddTransactionModal(false);
      setTransactionForm({
        type: 'BUY',
        quantity: '',
        price: '',
        transactionDate: new Date().toISOString().split('T')[0],
        fee: '',
        note: ''
      });
      
      // 데이터 새로고침
      refreshPortfolio();
      const transactionsData = await stockService.transaction.getTransactions(0, 50, portfolioItem.holding.stock.symbol);
      setTransactions(transactionsData.content);
      
    } catch (error) {
      console.error('거래 추가 실패:', error);
    }
  };

  // 알림 추가 핸들러
  const handleAddAlert = async () => {
    if (!portfolioItem) return;
    
    try {
      await stockService.alert.addAlert({
        symbol: portfolioItem.holding.stock.symbol,
        type: alertForm.type,
        condition: alertForm.condition,
        targetValue: parseFloat(alertForm.targetValue),
        isActive: true,
        message: alertForm.message || undefined
      });
      
      setShowAlertModal(false);
      setAlertForm({
        type: 'PRICE_TARGET',
        condition: 'ABOVE',
        targetValue: '',
        message: ''
      });
      
      // 알림 목록 새로고침
      const alertsData = await stockService.alert.getAlerts();
      setAlerts(alertsData.filter(alert => alert.symbol === portfolioItem.holding.stock.symbol));
      
    } catch (error) {
      console.error('알림 추가 실패:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!portfolioItem) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          종목을 찾을 수 없습니다
        </h2>
        <Link to="/portfolio">
          <Button variant="primary">포트폴리오로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  const { holding, currentPrice, unrealizedGain, unrealizedGainRate, currentValue, profitPerShare, week52HighDropRate } = portfolioItem;
  const isPositive = unrealizedGain >= 0;
  const dailyChangeIsPositive = currentPrice.dailyChange >= 0;

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/portfolio')}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            포트폴리오
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {holding.stock.name}
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-lg text-gray-600 dark:text-gray-400">
                {holding.stock.symbol}
              </span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
                {holding.stock.industry}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {holding.stock.market}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowAddTransactionModal(true)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            거래 추가
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowAlertModal(true)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.343 4.343l7.071 7.071m0 0l7.071 7.071M11.414 11.414l7.071-7.071M4.343 4.343L11.414 11.414" />
              </svg>
            }
          >
            알림 설정
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowEditModal(true)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          >
            정보 수정
          </Button>
        </div>
      </div>

      {/* 현재 상태 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">현재가</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {stockService.format.formatCurrency(currentPrice.currentPrice)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${dailyChangeIsPositive ? 'bg-green-500' : 'bg-red-500'}`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={dailyChangeIsPositive ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-sm font-medium ${dailyChangeIsPositive ? 'text-green-600' : 'text-red-600'}`}>
              {dailyChangeIsPositive ? '+' : ''}{stockService.format.formatCurrency(currentPrice.dailyChange)}
            </span>
            <span className={`text-sm ${dailyChangeIsPositive ? 'text-green-600' : 'text-red-600'}`}>
              ({stockService.format.formatPercent(currentPrice.dailyChangeRate)})
            </span>
          </div>
        </Card>

        <Card className={`${isPositive ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700' : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                평가손익
              </p>
              <p className={`text-2xl font-bold ${isPositive ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                {stockService.format.formatCurrency(unrealizedGain)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {stockService.format.formatPercent(unrealizedGainRate)}
            </span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">평가금액</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {stockService.format.formatCurrency(currentValue)}
              </p>
            </div>
            <div className="p-3 bg-purple-500 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {holding.quantity}주 보유
            </span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">1주당 손익</p>
              <p className={`text-2xl font-bold ${profitPerShare >= 0 ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                {stockService.format.formatCurrency(profitPerShare)}
              </p>
            </div>
            <div className="p-3 bg-orange-500 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              평단: {stockService.format.formatCurrency(holding.averagePrice)}
            </span>
          </div>
        </Card>
      </div>

      {/* 주가 차트 */}
      <Card title="주가 차트" hover={false}>
        <div className="mb-6 flex flex-wrap gap-2">
          {(['1D', '1W', '1M', '3M', '6M', '1Y'] as const).map(period => (
            <button
              key={period}
              onClick={() => setChartPeriod(period)}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                chartPeriod === period
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
        
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="date" 
                stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                fontSize={12}
              />
              <YAxis 
                yAxisId="price"
                orientation="left"
                stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                fontSize={12}
                tickFormatter={(value) => stockService.format.formatCurrency(value, false)}
              />
              <YAxis 
                yAxisId="volume"
                orientation="right"
                stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                fontSize={12}
                tickFormatter={(value) => stockService.format.formatVolume(value)}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  color: theme === 'dark' ? '#f9fafb' : '#111827'
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'volume') return [stockService.format.formatVolume(value), '거래량'];
                  return [stockService.format.formatCurrency(value), name === 'price' ? '주가' : '평균단가'];
                }}
                labelFormatter={(label) => `날짜: ${label}`}
              />
              <Area 
                yAxisId="price"
                type="monotone" 
                dataKey="price" 
                stroke="#ec4899" 
                fill="#ec4899"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Line 
                yAxisId="price"
                type="monotone" 
                dataKey="averagePrice" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <Bar 
                yAxisId="volume"
                dataKey="volume" 
                fill="#06b6d4"
                opacity={0.6}
                radius={[2, 2, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 상세 정보 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 종목 정보 */}
        <Card title="종목 정보" hover={false}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">52주 최고가</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {stockService.format.formatCurrency(currentPrice.week52High)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stockService.format.formatTime(currentPrice.week52HighDate)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">52주 최저가</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {stockService.format.formatCurrency(currentPrice.week52Low)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stockService.format.formatTime(currentPrice.week52LowDate)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">52주 최고가 대비 하락률</span>
                <span className="text-sm font-medium text-red-600">
                  -{stockService.format.formatPercent(week52HighDropRate)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(week52HighDropRate, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">일일 최고가</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {stockService.format.formatCurrency(currentPrice.dailyHigh)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">일일 최저가</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {stockService.format.formatCurrency(currentPrice.dailyLow)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">거래량</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {stockService.format.formatVolume(currentPrice.volume)}
                </span>
              </div>
            </div>

            {currentPrice.marketCap && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">시가총액</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {stockService.format.formatCurrency(currentPrice.marketCap)}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* 보유 정보 */}
        <Card title="보유 정보" hover={false}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">보유 수량</span>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {holding.quantity.toLocaleString()}주
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">평균 매수가</span>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stockService.format.formatCurrency(holding.averagePrice)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">총 투자금액</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {stockService.format.formatCurrency(holding.totalInvestment)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">현재 평가금액</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {stockService.format.formatCurrency(currentValue)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">포트폴리오 내 비중</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {/* 임시로 5% 고정, 실제로는 계산 필요 */}
                  5.2%
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>최초 매수일</span>
                <span>{stockService.format.formatTime(holding.purchaseDate)}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>최근 거래일</span>
                <span>{stockService.format.formatTime(holding.lastTransactionDate)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 거래 기록 및 뉴스 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 거래 기록 */}
        <Card title="최근 거래 기록" hover={false}>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">거래 기록이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${transaction.type === 'BUY' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-red-100 dark:bg-red-900'}`}>
                      <svg className={`w-4 h-4 ${transaction.type === 'BUY' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={transaction.type === 'BUY' ? "M12 4v16m8-8H4" : "M20 12H4"} />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.type === 'BUY' ? '매수' : '매도'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {transaction.quantity}주 @ {stockService.format.formatCurrency(transaction.price)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {stockService.format.formatCurrency(transaction.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stockService.format.formatTime(transaction.transactionDate)}
                    </p>
                  </div>
                </div>
              ))}
              
              {transactions.length > 5 && (
                <Link to={`/portfolio/transactions/${holding.stock.symbol}`}>
                  <Button variant="outline" size="sm" fullWidth>
                    모든 거래 보기 ({transactions.length})
                  </Button>
                </Link>
              )}
            </div>
          )}
        </Card>

        {/* 관련 뉴스 */}
        <Card title="관련 뉴스" hover={false}>
          {news.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">관련 뉴스가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {news.slice(0, 4).map((newsItem) => (
                <a
                  key={newsItem.id}
                  href={newsItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {newsItem.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {newsItem.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{newsItem.source}</span>
                    <span>{stockService.format.formatRelativeTime(newsItem.publishedAt)}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 설정된 알림 */}
      {alerts.length > 0 && (
        <Card title="설정된 알림" hover={false}>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {alert.type === 'PRICE_TARGET' ? '목표가 알림' : '수익률 알림'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {alert.condition === 'ABOVE' ? '이상' : alert.condition === 'BELOW' ? '이하' : '도달'}: {
                      alert.type === 'PRICE_TARGET' 
                        ? stockService.format.formatCurrency(alert.targetValue)
                        : stockService.format.formatPercent(alert.targetValue)
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${alert.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {alert.isActive ? '활성' : '비활성'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 거래 추가 모달 */}
      <Modal
        isOpen={showAddTransactionModal}
        onClose={() => setShowAddTransactionModal(false)}
        title="거래 추가"
      >
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={() => setTransactionForm(prev => ({ ...prev, type: 'BUY' }))}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                transactionForm.type === 'BUY'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              매수
            </button>
            <button
              onClick={() => setTransactionForm(prev => ({ ...prev, type: 'SELL' }))}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                transactionForm.type === 'SELL'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              매도
            </button>
          </div>

          <Input
            label="수량"
            type="number"
            value={transactionForm.quantity}
            onChange={(e) => setTransactionForm(prev => ({ ...prev, quantity: e.target.value }))}
            placeholder="주식 수량을 입력하세요"
          />

          <Input
            label="가격"
            type="number"
            step="0.01"
            value={transactionForm.price}
            onChange={(e) => setTransactionForm(prev => ({ ...prev, price: e.target.value }))}
            placeholder="주당 가격을 입력하세요"
          />

          <Input
            label="거래일"
            type="date"
            value={transactionForm.transactionDate}
            onChange={(e) => setTransactionForm(prev => ({ ...prev, transactionDate: e.target.value }))}
          />

          <Input
            label="수수료 (선택)"
            type="number"
            step="0.01"
            value={transactionForm.fee}
            onChange={(e) => setTransactionForm(prev => ({ ...prev, fee: e.target.value }))}
            placeholder="거래 수수료를 입력하세요"
          />

          <Input
            label="메모 (선택)"
            value={transactionForm.note}
            onChange={(e) => setTransactionForm(prev => ({ ...prev, note: e.target.value }))}
            placeholder="거래에 대한 메모를 입력하세요"
          />

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAddTransactionModal(false)}
              fullWidth
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleAddTransaction}
              fullWidth
              disabled={!transactionForm.quantity || !transactionForm.price}
            >
              거래 추가
            </Button>
          </div>
        </div>
      </Modal>

      {/* 알림 설정 모달 */}
      <Modal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title="알림 설정"
      >
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={() => setAlertForm(prev => ({ ...prev, type: 'PRICE_TARGET' }))}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                alertForm.type === 'PRICE_TARGET'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              목표가 알림
            </button>
            <button
              onClick={() => setAlertForm(prev => ({ ...prev, type: 'GAIN_LOSS_RATE' }))}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                alertForm.type === 'GAIN_LOSS_RATE'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              수익률 알림
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setAlertForm(prev => ({ ...prev, condition: 'ABOVE' }))}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                alertForm.condition === 'ABOVE'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              이상
            </button>
            <button
              onClick={() => setAlertForm(prev => ({ ...prev, condition: 'BELOW' }))}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                alertForm.condition === 'BELOW'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              이하
            </button>
          </div>

          <Input
            label={alertForm.type === 'PRICE_TARGET' ? '목표가' : '목표 수익률 (%)'}
            type="number"
            step={alertForm.type === 'PRICE_TARGET' ? '100' : '0.1'}
            value={alertForm.targetValue}
            onChange={(e) => setAlertForm(prev => ({ ...prev, targetValue: e.target.value }))}
            placeholder={alertForm.type === 'PRICE_TARGET' ? '목표 가격을 입력하세요' : '목표 수익률을 입력하세요'}
          />

          <Input
            label="알림 메시지 (선택)"
            value={alertForm.message}
            onChange={(e) => setAlertForm(prev => ({ ...prev, message: e.target.value }))}
            placeholder="사용자 정의 알림 메시지를 입력하세요"
          />

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAlertModal(false)}
              fullWidth
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleAddAlert}
              fullWidth
              disabled={!alertForm.targetValue}
            >
              알림 설정
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StockDetail;