import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { useTheme } from '../../contexts/ThemeContext';
import stockService from '../../services/stockService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

// 차트 색상 팔레트
const CHART_COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#84cc16'];

const PortfolioDashboard: React.FC = () => {
  const { theme } = useTheme();
  const {
    portfolio,
    summary,
    industryAnalysis,
    marketStatus,
    loading,
    error,
    filters,
    wsStatus,
    lastUpdated,
    filteredPortfolio,
    totalGainLoss,
    totalGainLossRate,
    bestPerformer,
    worstPerformer,
    updateFilters,
    refreshPortfolio
  } = usePortfolio();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // 검색 핸들러
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    updateFilters({ searchQuery: value });
  };

  // 정렬 옵션
  const sortOptions = [
    { value: 'gainRate', label: '수익률' },
    { value: 'currentValue', label: '현재가치' },
    { value: 'dailyChange', label: '일일변동' },
    { value: 'name', label: '종목명' }
  ];

  // 업종 필터 옵션
  const industryOptions = useMemo(() => {
    const industries = [...new Set(portfolio.map(item => item.holding.stock.industry))];
    return [
      { value: '', label: '전체 업종' },
      ...industries.map(industry => ({ value: industry, label: industry }))
    ];
  }, [portfolio]);

  // 포트폴리오 성과 차트 데이터 (모의 데이터)
  const performanceChartData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const variation = Math.sin(i * 0.2) * 50000 + Math.random() * 20000;
      data.push({
        date: date.toISOString().split('T')[0],
        value: (summary?.totalCurrentValue || 1000000) + variation,
        benchmark: 1000000 + variation * 0.8
      });
    }
    return data;
  }, [summary]);

  // 산업별 분포 차트 데이터
  const industryChartData = useMemo(() => {
    return industryAnalysis.map((item, index) => ({
      ...item,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }));
  }, [industryAnalysis]);

  // 로딩 상태
  if (loading && portfolio.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={refreshPortfolio}>다시 시도</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* 헤더 섹션 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">포트폴리오 대시보드</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                wsStatus === 'CONNECTED' ? 'bg-green-500' : 
                wsStatus === 'CONNECTING' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {wsStatus === 'CONNECTED' ? '실시간 연결됨' : 
                 wsStatus === 'CONNECTING' ? '연결 중...' : '연결 끊김'}
              </span>
            </div>
            {lastUpdated && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                마지막 업데이트: {stockService.format.formatRelativeTime(lastUpdated)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={refreshPortfolio} 
            variant="outline"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          >
            새로고침
          </Button>
          <Link to="/portfolio/add">
            <Button variant="primary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              종목 추가
            </Button>
          </Link>
        </div>
      </div>

      {/* 시장 상태 알림 */}
      {marketStatus && (
        <Card className={`border-l-4 ${marketStatus.isOpen ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20' : 'border-l-red-500 bg-red-50 dark:bg-red-900/20'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${marketStatus.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="font-medium">
              {marketStatus.isOpen ? '🟢 장중 (실시간 업데이트)' : '🔴 장마감'}
            </span>
            {!marketStatus.isOpen && marketStatus.nextOpenTime && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                다음 개장: {stockService.format.formatTime(marketStatus.nextOpenTime)}
              </span>
            )}
          </div>
        </Card>
      )}

      {/* 요약 통계 카드 */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400">총 자산가치</p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {stockService.format.formatCurrency(summary.totalCurrentValue)}
                </p>
              </div>
              <div className="p-3 bg-primary-500 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-sm font-medium ${summary.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.dailyChange >= 0 ? '↗' : '↘'} {stockService.format.formatCurrency(Math.abs(summary.dailyChange))}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">오늘</span>
            </div>
          </Card>

          <Card className={`${totalGainLoss >= 0 ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700' : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${totalGainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  총 손익
                </p>
                <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                  {stockService.format.formatCurrency(totalGainLoss)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${totalGainLoss >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={totalGainLoss >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <span className={`text-sm font-medium ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stockService.format.formatPercent(totalGainLossRate)}
              </span>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">투자금액</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stockService.format.formatCurrency(summary.totalInvestment)}
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {summary.holdingCount}개 종목
              </span>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">수익률</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {stockService.format.formatPercent(summary.totalUnrealizedGainRate)}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                연환산 기준
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 포트폴리오 성과 차트 */}
        <Card className="xl:col-span-2" title="포트폴리오 성과" hover={false}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="date" 
                  stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                  tickFormatter={(value) => stockService.format.formatCurrency(value, false)}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    color: theme === 'dark' ? '#f9fafb' : '#111827'
                  }}
                  formatter={(value: number, name: string) => [
                    stockService.format.formatCurrency(value),
                    name === 'value' ? '포트폴리오' : '벤치마크'
                  ]}
                  labelFormatter={(label) => `날짜: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#ec4899" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: '#ec4899' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 산업별 분포 차트 */}
        <Card title="산업별 분포" hover={false}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={industryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="totalValue"
                >
                  {industryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    color: theme === 'dark' ? '#f9fafb' : '#111827'
                  }}
                  formatter={(value: number) => [stockService.format.formatCurrency(value), '투자금액']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {industryChartData.slice(0, 5).map((industry, index) => (
              <div key={industry.industry} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: industry.color }} />
                  <span className="font-medium">{industry.industry}</span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {stockService.format.formatPercent(industry.weightPercent, 1)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 베스트/워스트 퍼포머 */}
      {(bestPerformer || worstPerformer) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bestPerformer && (
            <Card title="🏆 최고 수익 종목" className="border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {bestPerformer.holding.stock.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {bestPerformer.holding.stock.symbol} • {bestPerformer.holding.stock.industry}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">
                    {stockService.format.formatPercent(bestPerformer.unrealizedGainRate)}
                  </p>
                  <p className="text-sm text-green-600">
                    {stockService.format.formatCurrency(bestPerformer.unrealizedGain)}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">매수가</span>
                  <p className="font-medium">{stockService.format.formatCurrency(bestPerformer.holding.averagePrice)}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">현재가</span>
                  <p className="font-medium">{stockService.format.formatCurrency(bestPerformer.currentPrice.currentPrice)}</p>
                </div>
              </div>
            </Card>
          )}

          {worstPerformer && (
            <Card title="📉 최저 수익 종목" className="border-red-200 dark:border-red-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {worstPerformer.holding.stock.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {worstPerformer.holding.stock.symbol} • {worstPerformer.holding.stock.industry}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-red-600">
                    {stockService.format.formatPercent(worstPerformer.unrealizedGainRate)}
                  </p>
                  <p className="text-sm text-red-600">
                    {stockService.format.formatCurrency(worstPerformer.unrealizedGain)}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">매수가</span>
                  <p className="font-medium">{stockService.format.formatCurrency(worstPerformer.holding.averagePrice)}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">현재가</span>
                  <p className="font-medium">{stockService.format.formatCurrency(worstPerformer.currentPrice.currentPrice)}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 필터 및 검색 */}
      <Card title="보유 종목" hover={false}>
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="종목명 또는 코드로 검색..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              icon={
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          <div className="flex gap-4">
            <Select
              options={industryOptions}
              value={filters.industries?.[0] || ''}
              onChange={(value) => updateFilters({ industries: value ? [value] : undefined })}
              className="min-w-40"
            />
            <Select
              options={sortOptions}
              value={filters.sortBy || 'gainRate'}
              onChange={(value) => updateFilters({ sortBy: value as any })}
              className="min-w-32"
            />
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md">
              <button
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setViewMode('grid')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 dark:border-gray-600 ${
                  viewMode === 'list' 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setViewMode('list')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 포트폴리오 목록 */}
        {filteredPortfolio.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              포트폴리오가 비어있습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              첫 번째 종목을 추가하여 포트폴리오를 시작해보세요.
            </p>
            <Link to="/portfolio/add">
              <Button variant="primary">종목 추가하기</Button>
            </Link>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
            {filteredPortfolio.map((item) => (
              <PortfolioItemCard 
                key={item.holding.id} 
                item={item} 
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

// 포트폴리오 아이템 카드 컴포넌트
interface PortfolioItemCardProps {
  item: PortfolioItem;
  viewMode: 'grid' | 'list';
}

const PortfolioItemCard: React.FC<PortfolioItemCardProps> = ({ item, viewMode }) => {
  const isPositive = item.unrealizedGain >= 0;
  const dailyChangeIsPositive = item.currentPrice.dailyChange >= 0;

  if (viewMode === 'list') {
    return (
      <Link 
        to={`/portfolio/detail/${item.holding.id}`}
        className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {item.holding.stock.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.holding.stock.symbol} • {item.holding.stock.industry}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-right">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {stockService.format.formatCurrency(item.currentPrice.currentPrice)}
              </p>
              <p className={`text-sm ${dailyChangeIsPositive ? 'text-green-600' : 'text-red-600'}`}>
                {dailyChangeIsPositive ? '+' : ''}{stockService.format.formatCurrency(item.currentPrice.dailyChange)}
              </p>
            </div>
            
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {stockService.format.formatCurrency(item.currentValue)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.holding.quantity}주
              </p>
            </div>
            
            <div>
              <p className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stockService.format.formatPercent(item.unrealizedGainRate)}
              </p>
              <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stockService.format.formatCurrency(item.unrealizedGain)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/portfolio/detail/${item.holding.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">
              {item.holding.stock.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {item.holding.stock.symbol}
            </p>
            <span className="inline-block px-2 py-1 mt-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
              {item.holding.stock.industry}
            </span>
          </div>
          <div className={`p-2 rounded-full ${isPositive ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
            <svg className={`w-4 h-4 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isPositive ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
            </svg>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">현재가</span>
            <div className="text-right">
              <p className="font-medium text-gray-900 dark:text-white">
                {stockService.format.formatCurrency(item.currentPrice.currentPrice)}
              </p>
              <p className={`text-xs ${dailyChangeIsPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stockService.format.formatPercent(item.currentPrice.dailyChangeRate)}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">평가금액</span>
            <p className="font-medium text-gray-900 dark:text-white">
              {stockService.format.formatCurrency(item.currentValue)}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">손익</span>
            <div className="text-right">
              <p className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stockService.format.formatPercent(item.unrealizedGainRate)}
              </p>
              <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stockService.format.formatCurrency(item.unrealizedGain)}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>보유: {item.holding.quantity}주</span>
              <span>평단: {stockService.format.formatCurrency(item.holding.averagePrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PortfolioDashboard;