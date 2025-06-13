import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  fallbackPath?: string; // 접근 거부 시 리디렉션할 경로
}

/**
 * 인증된 사용자만 접근할 수 있는 보호된 라우트 컴포넌트
 * 
 * @param children 자식 컴포넌트
 * @param adminOnly 관리자만 접근 가능 여부
 * @param fallbackPath 접근 거부 시 리디렉션할 경로 (기본값: '/')
 */

const ProtectedRoute = ({ children, adminOnly = false, fallbackPath = '/'}: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();
  const location = useLocation();

  // 인증 정보 로딩 중일 때 로딩 스피너 표시
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // 🔐 인증되지 않은 사용자는 로그인 페이지로 리디렉션
  if (!isAuthenticated) {
    // 현재 경로를 쿼리 파라미터로 포함하여 로그인 후 돌아올 수 있도록 함
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  // 🛡️ 관리자 전용 라우트인 경우 권한 확인
  if (adminOnly && !isAdmin) {
    // 관리자가 아닌 경우 지정된 경로 또는 홈으로 리디렉션
    return <Navigate to={fallbackPath} replace />;
  }

  // ✅ 모든 조건을 만족하는 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
};

/**
 * 역할별 다중 보호 라우트 컴포넌트
 * 더 세밀한 권한 제어가 필요한 경우 사용
 */
interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('ADMIN' | 'USER')[];
  fallbackPath?: string;
}

export const RoleBasedRoute = ({children, allowedRoles, fallbackPath = '/'}: RoleBasedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

/**
 * 조건부 라우트 보호 컴포넌트
 * 커스텀 조건에 따른 접근 제어
 */
interface ConditionalRouteProps {
  children: React.ReactNode;
  condition: (user: any) => boolean;
  fallbackPath?: string;
  loadingComponent?: React.ReactNode;
}

export const ConditionalRoute = ({  children, condition, fallbackPath = '/', loadingComponent}: ConditionalRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return loadingComponent || (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  if (!condition(user)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;