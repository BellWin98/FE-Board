import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

/**
 * 인증된 사용자만 접근할 수 있는 보호된 라우트 컴포넌트
 * @param children 자식 컴포넌트
 * @param adminOnly 관리자만 접근 가능 여부
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // 인증 정보 로딩 중일 때 로딩 스피너 표시
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // 인증되지 않은 사용자는 로그인 페이지로 리디렉션
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 관리자 전용 라우트인 경우 관리자가 아니면 홈으로 리디렉션
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 인증된 사용자인 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
};

export default ProtectedRoute;