import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { User, LoginRequest, RegisterRequest } from '../types/models';
import authService from '../services/authService';
import { toast } from 'react-toastify';

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => Promise<boolean>;
}

// 기본값으로 컨텍스트 생성
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  updateUserProfile: async () => false,
});

// 컨텍스트 프로바이더 컴포넌트
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 초기 로딩시 로컬 스토리지에서 사용자 정보 로드
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // 토큰이 있는지 확인
        if (authService.isAuthenticated()) {
          // 로컬 스토리지에서 사용자 정보 가져오기
          const storedUser = authService.getUser();
          
          if (storedUser) {
            // 세션 유효성 검증 (선택적)
            try {
              const { data } = await authService.getCurrentUser();
              setUser(data);
            } catch (error) {
              // 토큰이 유효하지 않으면 로그아웃
              authService.logout();
              setUser(null);
            }
          } else {
            // 유저 정보가 없으면 로그아웃
            authService.logout();
          }
        }
      } catch (err) {
        setError('인증 초기화 중 오류가 발생했습니다.');
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 로그인 함수
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      setUser(response.data.user);
      toast.success('로그인되었습니다.');
      return true;
    } catch (err) {
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 함수
  const register = async (userData: RegisterRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await authService.register(userData);
      toast.success('회원가입이 완료되었습니다. 로그인해주세요.');
      return true;
    } catch (err) {
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = () => {
    authService.logout();
    setUser(null);
    toast.info('로그아웃되었습니다.');
  };

  // 사용자 프로필 업데이트 함수
  const updateUserProfile = async (userData: Partial<User>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updateProfile(userData);
      setUser(response.data);
      toast.success('프로필이 업데이트되었습니다.');
      
      // 로컬 스토리지의 사용자 정보 업데이트
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return true;
    } catch (err) {
      setError('프로필 업데이트에 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 컨텍스트 값 정의
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 커스텀 훅 - 인증 컨텍스트 사용을 위한 편의 함수
export const useAuth = () => useContext(AuthContext);

export default AuthContext;