import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../ui/Button';

const Header = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 메뉴 토글 핸들러
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  // 🎯 스마트 프로필 네비게이션: 역할별 다른 기본 페이지
  const handleProfileClick = () => {
    if (isAdmin) {
      // 관리자는 관리 대시보드로
      navigate('/admin/categories');
    } else {
      // 일반 사용자는 프로필 페이지로
      navigate('/profile');
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 로고 및 데스크톱 네비게이션 */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">
                게시판
              </Link>
            </div>
            
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                홈
              </Link>
              <Link
                to="/boards"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                게시판
              </Link>
              {/* 🔐 관리자 전용 네비게이션 */}
              {isAdmin && (
                <Link
                  to="/admin/categories"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-purple-600 hover:border-purple-300 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  관리자
                </Link>
              )}
            </nav>
          </div>

          {/* 우측 버튼 영역 */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {/* 다크 모드 토글 버튼 */}
            <button
              type="button"
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {theme === 'dark' ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* 인증 상태에 따른 버튼 표시 */}
            {isAuthenticated ? (
              <>
                {/* 🎭 역할별 다른 라벨과 아이콘 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleProfileClick}
                >
                  {isAdmin ? (
                    <>
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      관리 대시보드
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      내 프로필
                    </>
                  )}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleLogout}
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  로그인
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  회원가입
                </Button>
              </>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">메뉴 열기</span>
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            onClick={() => setIsMenuOpen(false)}
          >
            홈
          </Link>
          <Link
            to="/boards"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            onClick={() => setIsMenuOpen(false)}
          >
            게시판
          </Link>
          {/* 🔐 모바일 관리자 메뉴 */}
          {isAdmin && (
            <Link
              to="/admin/categories"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-purple-600 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20 dark:hover:text-purple-300"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                관리자 대시보드
              </div>
            </Link>
          )}
        </div>

        <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center">
              {/* 다크 모드 토글 버튼 */}
              <button
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
              >
                {theme === 'dark' ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>
              
              {/* 사용자 정보 표시 */}
              {isAuthenticated && user && (
                <div className="ml-3">
                  <div className="flex items-center">
                    <div className="text-base font-medium text-gray-800 dark:text-white">
                      {user.nickname}
                    </div>
                    {/* 🎭 역할 배지 */}
                    {isAdmin && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        관리자
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {user.email}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-1 px-2">
            {isAuthenticated ? (
              <>
                <button
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  onClick={handleProfileClick}
                >
                  <div className="flex items-center">
                    {isAdmin ? (
                      <>
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        관리 대시보드
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        내 프로필
                      </>
                    )}
                  </div>
                </button>
                <button
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  onClick={handleLogout}
                >
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    로그아웃
                  </div>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    로그인
                  </div>
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                    회원가입
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

// import React, { useState, useRef, useEffect } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import { useTheme } from '../../contexts/ThemeContext';
// import { usePortfolio } from '../../contexts/PortfolioContext';
// import Button from '../ui/Button';

// /**
//  * StockTracker 헤더 컴포넌트
//  * 
//  * 이 헤더는 단순한 네비게이션을 넘어서 사용자의 투자 상태를 실시간으로 반영하는
//  * 인텔리전트 인터페이스입니다. 사용자의 인증 상태, 포트폴리오 성과, 시장 상황에 따라
//  * 동적으로 정보를 표시하고 상호작용을 제공합니다.
//  * 
//  * 핵심 설계 원칙:
//  * 1. 맥락적 정보 표시: 현재 포트폴리오 성과를 헤더에서 즉시 확인
//  * 2. 상태 기반 네비게이션: 사용자 역할과 상태에 따른 적응형 메뉴
//  * 3. 시각적 피드백: 실시간 데이터 연결 상태와 성과를 색상으로 표현
//  * 4. 접근성 우선: 키보드 네비게이션과 스크린 리더 지원
//  */
// const Header: React.FC = () => {
//   const { isAuthenticated, user, logout, isAdmin } = useAuth();
//   const { theme, toggleTheme } = useTheme();
//   const { wsStatus, summary, lastUpdated } = usePortfolio();
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   // 상태 관리
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
//   const [showQuickStats, setShowQuickStats] = useState(true);
  
//   // Refs for accessibility and click outside detection
//   const profileMenuRef = useRef<HTMLDivElement>(null);
//   const mobileMenuRef = useRef<HTMLDivElement>(null);

//   // 외부 클릭 감지를 통한 메뉴 자동 닫기
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
//         setIsProfileMenuOpen(false);
//       }
//       if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
//         setIsMenuOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // ESC 키로 메뉴 닫기
//   useEffect(() => {
//     const handleEscapeKey = (event: KeyboardEvent) => {
//       if (event.key === 'Escape') {
//         setIsMenuOpen(false);
//         setIsProfileMenuOpen(false);
//       }
//     };

//     document.addEventListener('keydown', handleEscapeKey);
//     return () => document.removeEventListener('keydown', handleEscapeKey);
//   }, []);

//   // 로그아웃 핸들러
//   const handleLogout = async () => {
//     try {
//       await logout();
//       navigate('/');
//       setIsMenuOpen(false);
//       setIsProfileMenuOpen(false);
//     } catch (error) {
//       console.error('로그아웃 실패:', error);
//     }
//   };

//   // 네비게이션 링크 활성 상태 확인
//   const isActivePath = (path: string): boolean => {
//     if (path === '/') {
//       return location.pathname === '/';
//     }
//     return location.pathname.startsWith(path);
//   };

//   // 동적 링크 스타일 생성
//   const getLinkClassName = (path: string): string => {
//     const baseClasses = "relative inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md group";
//     const activeClasses = "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20";
//     const inactiveClasses = "text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20";
    
//     return `${baseClasses} ${isActivePath(path) ? activeClasses : inactiveClasses}`;
//   };

//   // 스마트 프로필 네비게이션: 역할별 기본 페이지 연결
//   const handleProfileClick = () => {
//     const targetPath = isAdmin ? '/admin/categories' : '/profile';
//     navigate(targetPath);
//     setIsProfileMenuOpen(false);
//     setIsMenuOpen(false);
//   };

//   // 실시간 성과 지표 포맷팅
//   const formatCompactCurrency = (amount: number): string => {
//     if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억`;
//     if (amount >= 10000) return `${(amount / 10000).toFixed(0)}만`;
//     if (amount >= 1000) return `${(amount / 1000).toFixed(0)}천`;
//     return amount.toString();
//   };

//   // 성과 기반 색상 결정
//   const getPerformanceColor = (value: number) => {
//     if (value > 0) return 'text-green-600 dark:text-green-400';
//     if (value < 0) return 'text-red-600 dark:text-red-400';
//     return 'text-gray-600 dark:text-gray-400';
//   };

//   // WebSocket 연결 상태 표시기
//   const ConnectionStatusIndicator: React.FC = () => {
//     const statusConfig = {
//       'CONNECTED': { color: 'bg-green-500', label: '실시간 연결', pulse: true },
//       'CONNECTING': { color: 'bg-yellow-500', label: '연결 중', pulse: true },
//       'DISCONNECTED': { color: 'bg-red-500', label: '연결 끊김', pulse: false },
//       'ERROR': { color: 'bg-red-600', label: '연결 오류', pulse: false }
//     };

//     const config = statusConfig[wsStatus] || statusConfig['DISCONNECTED'];

//     return (
//       <div className="flex items-center gap-2" title={config.label}>
//         <div className={`w-2 h-2 rounded-full ${config.color} ${config.pulse ? 'animate-pulse' : ''}`} />
//         <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
//           {config.label}
//         </span>
//       </div>
//     );
//   };

//   // 포트폴리오 퀵 스탯 컴포넌트
//   const PortfolioQuickStats: React.FC = () => {
//     if (!isAuthenticated || !summary || !showQuickStats) return null;

//     return (
//       <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50">
//         <div className="text-center">
//           <p className="text-xs font-medium text-gray-500 dark:text-gray-400">총 자산</p>
//           <p className="text-sm font-bold text-gray-900 dark:text-white">
//             ₩{formatCompactCurrency(summary.totalCurrentValue)}
//           </p>
//         </div>
        
//         <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
        
//         <div className="text-center">
//           <p className="text-xs font-medium text-gray-500 dark:text-gray-400">수익률</p>
//           <p className={`text-sm font-bold ${getPerformanceColor(summary.totalUnrealizedGainRate)}`}>
//             {summary.totalUnrealizedGainRate >= 0 ? '+' : ''}{summary.totalUnrealizedGainRate.toFixed(1)}%
//           </p>
//         </div>
        
//         <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
        
//         <div className="text-center">
//           <p className="text-xs font-medium text-gray-500 dark:text-gray-400">일간 변동</p>
//           <p className={`text-sm font-bold ${getPerformanceColor(summary.dailyChange)}`}>
//             {summary.dailyChange >= 0 ? '+' : ''}₩{formatCompactCurrency(Math.abs(summary.dailyChange))}
//           </p>
//         </div>

//         <button
//           onClick={() => setShowQuickStats(false)}
//           className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
//           aria-label="통계 숨기기"
//         >
//           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//           </svg>
//         </button>
//       </div>
//     );
//   };

//   return (
//     <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/20 shadow-sm">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
          
//           {/* 로고 및 브랜딩 */}
//           <div className="flex items-center">
//             <Link to="/" className="flex items-center gap-3 group">
//               <div className="relative">
//                 <div className="w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
//                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//                   </svg>
//                 </div>
//                 {wsStatus === 'CONNECTED' && (
//                   <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
//                 )}
//               </div>
//               <div className="hidden sm:block">
//                 <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
//                   StockTracker
//                 </h1>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
//                   Smart Portfolio Management
//                 </p>
//               </div>
//             </Link>
//           </div>

//           {/* 데스크톱 네비게이션 */}
//           <nav className="hidden md:flex items-center space-x-1">
//             <Link to="/" className={getLinkClassName('/')}>
//               <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
//               </svg>
//               홈
//             </Link>

//             {isAuthenticated && (
//               <>
//                 <Link to="/portfolio" className={getLinkClassName('/portfolio')}>
//                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                   </svg>
//                   포트폴리오
//                   {wsStatus === 'CONNECTED' && (
//                     <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
//                   )}
//                 </Link>

//                 <Link to="/portfolio/analysis" className={getLinkClassName('/portfolio/analysis')}>
//                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                   </svg>
//                   분석
//                 </Link>
//               </>
//             )}

//             {isAdmin && (
//               <Link to="/admin/categories" className={getLinkClassName('/admin')}>
//                 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                 </svg>
//                 관리자
//               </Link>
//             )}
//           </nav>

//           {/* 포트폴리오 퀵 스탯 */}
//           <PortfolioQuickStats />

//           {/* 우측 액션 영역 */}
//           <div className="flex items-center gap-2">
//             {/* 연결 상태 표시기 */}
//             {isAuthenticated && <ConnectionStatusIndicator />}

//             {/* 다크 모드 토글 */}
//             <button
//               onClick={toggleTheme}
//               className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
//               aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
//             >
//               {theme === 'dark' ? (
//                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
//                 </svg>
//               ) : (
//                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
//                 </svg>
//               )}
//             </button>

//             {/* 인증 상태별 UI */}
//             {isAuthenticated ? (
//               <>
//                 {/* 빠른 액션 버튼들 */}
//                 <div className="hidden sm:flex items-center gap-1">
//                   <Link
//                     to="/portfolio/add"
//                     className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
//                     title="종목 추가"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                     </svg>
//                   </Link>

//                   <Link
//                     to="/portfolio/alerts"
//                     className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
//                     title="알림 설정"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.343 4.343l7.071 7.071m0 0l7.071 7.071M11.414 11.414l7.071-7.071M4.343 4.343L11.414 11.414" />
//                     </svg>
//                   </Link>
//                 </div>

//                 {/* 프로필 드롭다운 */}
//                 <div className="relative" ref={profileMenuRef}>
//                   <button
//                     onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
//                     className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
//                     aria-expanded={isProfileMenuOpen}
//                     aria-haspopup="true"
//                   >
//                     <div className="relative">
//                       <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium text-sm">
//                         {user?.nickname?.charAt(0).toUpperCase()}
//                       </div>
//                       {isAdmin && (
//                         <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white dark:border-gray-900" />
//                       )}
//                     </div>
//                     <div className="hidden sm:block text-left">
//                       <p className="text-sm font-medium text-gray-900 dark:text-white">
//                         {user?.nickname}
//                       </p>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">
//                         {isAdmin ? '관리자' : '투자자'}
//                       </p>
//                     </div>
//                     <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                     </svg>
//                   </button>

//                   {/* 프로필 드롭다운 메뉴 */}
//                   {isProfileMenuOpen && (
//                     <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
//                       {/* 사용자 정보 헤더 */}
//                       <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
//                         <div className="flex items-center gap-3">
//                           <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
//                             {user?.nickname?.charAt(0).toUpperCase()}
//                           </div>
//                           <div>
//                             <p className="font-medium text-gray-900 dark:text-white">{user?.nickname}</p>
//                             <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
//                             {isAdmin && (
//                               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 mt-1">
//                                 관리자
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </div>

//                       {/* 메뉴 아이템들 */}
//                       <div className="py-1">
//                         <button
//                           onClick={handleProfileClick}
//                           className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
//                         >
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                           </svg>
//                           {isAdmin ? '관리 대시보드' : '내 프로필'}
//                         </button>

//                         <Link
//                           to="/portfolio/transactions"
//                           className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
//                           onClick={() => setIsProfileMenuOpen(false)}
//                         >
//                           <div className="flex items-center gap-3">
//                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                             </svg>
//                             거래 내역
//                           </div>
//                         </Link>

//                         <Link
//                           to="/portfolio/alerts"
//                           className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
//                           onClick={() => setIsProfileMenuOpen(false)}
//                         >
//                           <div className="flex items-center gap-3">
//                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.343 4.343l7.071 7.071m0 0l7.071 7.071M11.414 11.414l7.071-7.071M4.343 4.343L11.414 11.414" />
//                             </svg>
//                             알림 설정
//                           </div>
//                         </Link>

//                         {lastUpdated && (
//                           <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-1">
//                             마지막 업데이트: {new Date(lastUpdated).toLocaleTimeString('ko-KR')}
//                           </div>
//                         )}

//                         <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
//                           <button
//                             onClick={handleLogout}
//                             className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
//                           >
//                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                             </svg>
//                             로그아웃
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </>
//             ) : (
//               <div className="hidden sm:flex items-center gap-2">
//                 <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
//                   로그인
//                 </Button>
//                 <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
//                   회원가입
//                 </Button>
//               </div>
//             )}

//             {/* 모바일 메뉴 버튼 */}
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
//               aria-expanded={isMenuOpen}
//               aria-label="메뉴 열기"
//             >
//               {isMenuOpen ? (
//                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               ) : (
//                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                 </svg>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* 모바일 메뉴 패널 */}
//       {isMenuOpen && (
//         <div 
//           ref={mobileMenuRef}
//           className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg"
//         >
//           {/* 모바일 포트폴리오 요약 */}
//           {isAuthenticated && summary && (
//             <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
//               <div className="grid grid-cols-3 gap-4 text-center">
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 dark:text-gray-400">총 자산</p>
//                   <p className="text-sm font-bold text-gray-900 dark:text-white">
//                     ₩{formatCompactCurrency(summary.totalCurrentValue)}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 dark:text-gray-400">수익률</p>
//                   <p className={`text-sm font-bold ${getPerformanceColor(summary.totalUnrealizedGainRate)}`}>
//                     {summary.totalUnrealizedGainRate >= 0 ? '+' : ''}{summary.totalUnrealizedGainRate.toFixed(1)}%
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 dark:text-gray-400">일간 변동</p>
//                   <p className={`text-sm font-bold ${getPerformanceColor(summary.dailyChange)}`}>
//                     {summary.dailyChange >= 0 ? '+' : ''}₩{formatCompactCurrency(Math.abs(summary.dailyChange))}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* 네비게이션 링크들 */}
//           <div className="px-4 py-3 space-y-1">
//             <Link
//               to="/"
//               className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
//                 isActivePath('/') 
//                   ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
//                   : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
//               }`}
//               onClick={() => setIsMenuOpen(false)}
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
//               </svg>
//               홈
//             </Link>

//             {isAuthenticated && (
//               <>
//                 <Link
//                   to="/portfolio"
//                   className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
//                     isActivePath('/portfolio') 
//                       ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
//                       : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
//                   }`}
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   <div className="relative">
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                     </svg>
//                     {wsStatus === 'CONNECTED' && (
//                       <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
//                     )}
//                   </div>
//                   포트폴리오
//                 </Link>

//                 <Link
//                   to="/portfolio/add"
//                   className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                   </svg>
//                   종목 추가
//                 </Link>

//                 <Link
//                   to="/portfolio/analysis"
//                   className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
//                     isActivePath('/portfolio/analysis') 
//                       ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
//                       : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
//                   }`}
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                   </svg>
//                   포트폴리오 분석
//                 </Link>

//                 <Link
//                   to="/portfolio/alerts"
//                   className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.343 4.343l7.071 7.071m0 0l7.071 7.071M11.414 11.414l7.071-7.071M4.343 4.343L11.414 11.414" />
//                   </svg>
//                   알림 설정
//                 </Link>
//               </>
//             )}

//             {isAdmin && (
//               <Link
//                 to="/admin/categories"
//                 className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
//                   isActivePath('/admin') 
//                     ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
//                     : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
//                 }`}
//                 onClick={() => setIsMenuOpen(false)}
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                 </svg>
//                 관리자 대시보드
//               </Link>
//             )}
//           </div>

//           {/* 사용자 정보 및 액션 섹션 */}
//           <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
//             {isAuthenticated ? (
//               <>
//                 {/* 사용자 정보 표시 */}
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="relative">
//                     <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
//                       {user?.nickname?.charAt(0).toUpperCase()}
//                     </div>
//                     {isAdmin && (
//                       <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
//                         <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
//                         </svg>
//                       </div>
//                     )}
//                   </div>
//                   <div className="flex-1">
//                     <p className="font-medium text-gray-900 dark:text-white">{user?.nickname}</p>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
//                     {isAdmin && (
//                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 mt-1">
//                         관리자
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {/* 추가 액션 버튼들 */}
//                 <div className="space-y-2">
//                   <button
//                     onClick={handleProfileClick}
//                     className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                     </svg>
//                     {isAdmin ? '관리 대시보드' : '내 프로필'}
//                   </button>

//                   <Link
//                     to="/portfolio/transactions"
//                     className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                     </svg>
//                     거래 내역
//                   </Link>

//                   {/* 연결 상태 정보 */}
//                   <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
//                     <div className="flex items-center gap-2">
//                       <ConnectionStatusIndicator />
//                     </div>
//                     {lastUpdated && (
//                       <span className="text-xs text-gray-500 dark:text-gray-400">
//                         {new Date(lastUpdated).toLocaleTimeString('ko-KR')}
//                       </span>
//                     )}
//                   </div>

//                   <button
//                     onClick={handleLogout}
//                     className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                     </svg>
//                     로그아웃
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <div className="space-y-2">
//                 <Button
//                   variant="outline"
//                   fullWidth
//                   onClick={() => {
//                     navigate('/login');
//                     setIsMenuOpen(false);
//                   }}
//                 >
//                   로그인
//                 </Button>
//                 <Button
//                   variant="primary"
//                   fullWidth
//                   onClick={() => {
//                     navigate('/register');
//                     setIsMenuOpen(false);
//                   }}
//                 >
//                   회원가입
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </header>
//   );
// };

// export default Header;