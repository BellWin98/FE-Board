// utils/redirectUtils.ts
import type { User } from '../types/models';

/**
 * 사용자 역할에 따른 기본 리디렉션 경로를 반환합니다.
 */
export const getDefaultRedirectPath = (user: User | null): string => {
  if (!user) return '/';
  
  switch (user.role) {
    case 'ADMIN':
      return '/admin/board';
    case 'USER':
      return '/';
    default:
      return '/';
  }
};

/**
 * 로그인 페이지로 리디렉션할 때 현재 경로를 보존합니다.
 */
export const createLoginRedirectUrl = (currentPath: string): string => {
  // 이미 로그인 페이지인 경우 그대로 반환
  if (currentPath === '/login' || currentPath === '/register') {
    return '/login';
  }
  
  // 현재 경로를 쿼리 파라미터로 추가
  const encodedPath = encodeURIComponent(currentPath);
  return `/login?redirect=${encodedPath}`;
};

/**
 * 관리자 전용 페이지 접근 시 권한 확인 및 리디렉션 처리
 */
export const handleAdminPageAccess = (user: User | null, targetPath: string): string => {
  if (!user) {
    // 로그인하지 않은 경우
    return createLoginRedirectUrl(targetPath);
  }
  
  if (user.role !== 'ADMIN') {
    // 관리자가 아닌 경우 홈으로 리디렉션
    return '/';
  }
  
  // 관리자인 경우 접근 허용
  return targetPath;
};

/**
 * 로그인 성공 후 적절한 리디렉션 경로를 결정합니다.
 */
export const resolvePostLoginRedirect = (
  user: User,
  urlRedirect?: string,
  stateRedirect?: string
): string => {
  // 1. URL 쿼리 파라미터 우선
  if (urlRedirect) {
    const decodedPath = decodeURIComponent(urlRedirect);
    
    // 관리자 페이지 접근 권한 확인
    if (decodedPath.startsWith('/admin')) {
      return handleAdminPageAccess(user, decodedPath);
    }
    
    return decodedPath;
  }
  
  // 2. 라우터 state 확인
  if (stateRedirect && stateRedirect !== '/login') {
    if (stateRedirect.startsWith('/admin')) {
      return handleAdminPageAccess(user, stateRedirect);
    }
    
    return stateRedirect;
  }
  
  // 3. 기본 역할별 경로
  return getDefaultRedirectPath(user);
};

/**
 * 보호된 라우트 접근 시 사용할 수 있는 헬퍼 함수
 */
export const createProtectedRouteHandler = (requiredRole?: 'ADMIN' | 'USER') => {
  return (user: User | null, currentPath: string): { allowed: boolean; redirectTo?: string } => {
    // 로그인하지 않은 경우
    if (!user) {
      return {
        allowed: false,
        redirectTo: createLoginRedirectUrl(currentPath),
      };
    }
    
    // 특정 역할이 필요한 경우
    if (requiredRole && user.role !== requiredRole) {
      return {
        allowed: false,
        redirectTo: '/',
      };
    }
    
    return { allowed: true };
  };
};

/**
 * 사용자 친화적인 환영 메시지 생성
 */
export const createWelcomeMessage = (user: User, targetPath: string): string => {
  const isAdmin = user.role === 'ADMIN';
  const isAdminPath = targetPath.startsWith('/admin');
  
  if (isAdmin && isAdminPath) {
    return '관리자로 로그인되었습니다. 관리 대시보드로 이동합니다.';
  }
  
  if (isAdmin && !isAdminPath) {
    return '관리자로 로그인되었습니다.';
  }
  
  return `안녕하세요, ${user.nickname}님! 로그인되었습니다.`;
};

/**
 * 라우트 경로의 유효성을 검사합니다.
 */
export const isValidRedirectPath = (path: string): boolean => {
  // 외부 URL 방지
  if (path.startsWith('http') || path.startsWith('//')) {
    return false;
  }
  
  // 상대 경로가 아닌 절대 경로만 허용
  if (!path.startsWith('/')) {
    return false;
  }
  
  // 잘못된 문자 포함 여부 확인
  if (path.includes('<') || path.includes('>') || path.includes('"')) {
    return false;
  }
  
  return true;
};