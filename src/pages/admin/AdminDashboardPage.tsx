import React, { useState } from 'react';
import { Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

// 관리자 대시보드 하위 페이지들
import CategoryManagement from './CategoryManagement';
import UserManagement from './UserManagement';
import PostManagement from './PostManagement';
import SiteStats from './SiteStats';

const AdminDashboardPage = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // 사용자가 로그인하지 않은 경우 로그인 페이지로 리디렉션
  if (!isAuthenticated) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold mb-4">로그인이 필요한 페이지입니다</h2>
        <Button
          variant="primary"
          onClick={() => navigate('/login', { state: { from: { pathname: '/admin' } } })}
        >
          로그인
        </Button>
      </div>
    );
  }

  // 관리자가 아닌 경우 접근 제한
  if (!isAdmin) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold mb-4">관리자만 접근할 수 있는 페이지입니다</h2>
        <Button
          variant="primary"
          onClick={() => navigate('/')}
        >
          홈으로 이동
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">관리자 대시보드</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* 사이드바 메뉴 */}
        <div className="w-full md:w-1/4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">관리자 메뉴</h2>
            <nav className="space-y-2">
              <NavItem 
                to="/admin" 
                exact
                currentPath={currentPath}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                }
              >
                사이트 통계
              </NavItem>
              <NavItem 
                to="/admin/categories" 
                currentPath={currentPath}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                }
              >
                카테고리 관리
              </NavItem>
              <NavItem 
                to="/admin/users" 
                currentPath={currentPath}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                }
              >
                사용자 관리
              </NavItem>
              <NavItem 
                to="/admin/posts" 
                currentPath={currentPath}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
              >
                게시글 관리
              </NavItem>
            </nav>
            
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => navigate('/')}
              >
                사이트로 돌아가기
              </Button>
            </div>
          </Card>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="w-full md:w-3/4">
          <Card className="p-6">
            <Routes>
              <Route path="/" element={<SiteStats />} />
              <Route path="/categories" element={<CategoryManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/posts" element={<PostManagement />} />
            </Routes>
          </Card>
        </div>
      </div>
    </div>
  );
};

// 네비게이션 아이템 컴포넌트
interface NavItemProps {
  to: string;
  children: React.ReactNode;
  currentPath: string;
  exact?: boolean;
  icon?: React.ReactNode;
}

const NavItem = ({ to, children, currentPath, exact = false, icon }: NavItemProps) => {
  const isActive = exact 
    ? currentPath === to
    : currentPath.startsWith(to);

  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 rounded-md transition-colors ${
        isActive
          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      {icon && <span className="mr-3">{icon}</span>}
      {children}
    </Link>
  );
};

export default AdminDashboardPage;