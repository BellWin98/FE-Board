// 주식 도메인 타입 정의

// 기본 주식 정보
export interface Stock {
    id: string;
    symbol: string; // 종목코드 (예: 005930)
    name: string; // 종목명 (예: 삼성전자)
    market: 'KOSPI' | 'KOSDAQ' | 'KONEX';
    industry: string; // 산업 분류
    sector?: string; // 섹터 분류
}

// 실시간 주가 정보
export interface StockPrice {
    symbol: string;
    currentPrice: number; // 현재가
    previousClose: number; // 전일 종가
    dailyChange: number; // 일일 변동금액
    dailyChangeRate: number; // 일일 변동률 (%)
    dailyHigh: number; // 일일 최고가
    dailyLow: number; // 일일 최저가
    volume: number; // 거래량
    week52High: number; // 52주 최고가
    week52Low: number; // 52주 최저가
    week52HighDate: string; // 52주 최고가 달성일
    week52LowDate: string; // 52주 최저가 달성일
    marketCap?: number; // 시가총액
    timestamp: string; // 데이터 업데이트 시간
}

// 포트폴리오 홀딩 정보
export interface Holding {
    id: string;
    userId: string;
    stock: Stock;
    quantity: number; // 보유 수량
    averagePrice: number; // 평균 매수가
    totalInvestment: number; // 총 투자금액
    purchaseDate: string; // 최초 매수일
    lastTransactionDate: string; // 최근 거래일
    createdAt: string;
    updatedAt: string;
}

// 포트폴리오 상세 정보 (홀딩 + 실시간 가격)
export interface PortfolioItem {
    holding: Holding;
    currentPrice: StockPrice;
    currentValue: number; // 현재 평가금액
    unrealizedGain: number; // 미실현 손익
    unrealizedGainRate: number; // 미실현 손익률
    realizedGain?: number; // 실현 손익 (매도한 경우)
    profitPerShare: number; // 1주당 수익
    week52HighDropRate: number; // 52주 최고가 대비 하락률
}

// 거래 기록
export interface Transaction {
    id: string;
    userId: string;
    symbol: string;
    type: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    totalAmount: number;
    fee: number; // 수수료
    tax?: number; // 세금
    transactionDate: string;
    note?: string;
    createdAt: string;
}

// 포트폴리오 요약 통계
export interface PortfolioSummary {
    totalInvestment: number; // 총 투자금액
    totalCurrentValue: number; // 총 현재가치
    totalUnrealizedGain: number; // 총 미실현 손익
    totalUnrealizedGainRate: number; // 총 미실현 손익률
    totalRealizedGain: number; // 총 실현 손익
    dailyChange: number; // 일일 변동금액
    dailyChangeRate: number; // 일일 변동률
    holdingCount: number; // 보유 종목 수
    lastUpdated: string;
}

// 산업별 분석 데이터
export interface IndustryAnalysis {
    industry: string;
    totalValue: number;
    totalInvestment: number;
    gainLoss: number;
    gainLossRate: number;
    holdingCount: number;
    weightPercent: number; // 포트폴리오 내 비중
    topHolding?: PortfolioItem; // 최대 보유 종목
}

// 실시간 데이터 웹소켓 메시지
export interface RealtimeMessage {
    type: 'PRICE_UPDATE' | 'MARKET_STATUS' | 'NEWS' | 'ALERT';
    timestamp: string;
    data: any;
}

export interface PriceUpdateMessage extends RealtimeMessage {
    type: 'PRICE_UPDATE';
    data: {
        symbol: string;
        price: Partial<StockPrice>;
    };
}

// API 요청/응답 타입
export interface AddHoldingRequest {
    symbol: string;
    quantity: number;
    averagePrice: number;
    purchaseDate: string;
    note?: string;
}

export interface UpdateHoldingRequest {
    quantity?: number;
    averagePrice?: number;
    note?: string;
}

export interface AddTransactionRequest {
    symbol: string;
    type: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    transactionDate: string;
    fee?: number;
    tax?: number;
    note?: string;
}

// 검색 및 필터링
export interface StockSearchResult {
    symbol: string;
    name: string;
    market: string;
    industry: string;
    currentPrice?: number;
}

export interface PortfolioFilters {
    industries?: string[];
    gainLossType?: 'GAIN' | 'LOSS' | 'ALL';
    sortBy?: 'name' | 'gainRate' | 'currentValue' | 'dailyChange';
    sortOrder?: 'asc' | 'desc';
    searchQuery?: string;
}

// 알림 설정
export interface AlertSetting {
    id: string;
    userId: string;
    symbol: string;
    type: 'PRICE_TARGET' | 'GAIN_LOSS_RATE' | 'VOLUME_SPIKE' | 'NEWS';
    condition: 'ABOVE' | 'BELOW' | 'EQUAL';
    targetValue: number;
    isActive: boolean;
    message?: string;
    createdAt: string;
}

// 차트 데이터
export interface ChartDataPoint {
    date: string;
    value: number;
    volume?: number;
}

export interface PortfolioChartData {
    period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
    data: ChartDataPoint[];
    startValue: number;
    endValue: number;
    gainLoss: number;
    gainLossRate: number;
}

// 시장 상태
export interface MarketStatus {
    isOpen: boolean;
    nextOpenTime?: string;
    nextCloseTime?: string;
    timezone: string;
    lastUpdated: string;
}

// 뉴스 정보
export interface StockNews {
    id: string;
    title: string;
    summary: string;
    url: string;
    publishedAt: string;
    source: string;
    relatedSymbols: string[];
    sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

// 주식 추천 정보
export interface StockRecommendation {
    symbol: string;
    recommendationType: 'BUY' | 'SELL' | 'HOLD';
    targetPrice: number;
    confidence: number; // 0-100
    reasoning: string;
    analyst?: string;
    updatedAt: string;
}