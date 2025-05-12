import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../ui/Spinner';

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * 인증되지 않은 사용자(게스트)만 접근할 수 있는 라우트 컴포넌트
 * 로그인한 사용자는 홈 페이지로 리디렉션
 * @param children 자식 컴포넌트
 */
const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // 인증 정보 로딩 중일 때 로딩 스피너 표시
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // 이미 인증된 사용자는 홈 페이지로 리디렉션
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 인증되지 않은 사용자인 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
};

export default GuestRoute;