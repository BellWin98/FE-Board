import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import type { LoginRequest, RegisterRequest, User } from '../types/models';

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  getRedirectPath: () => string; // 역할별 리디렉션 경로 반환
}

// 기본값으로 컨텍스트 생성
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isAdmin: false,
  isUser: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  updateUserProfile: async () => false,
  deleteAccount: async () => false,
  getRedirectPath: () => '/',
});

// 컨텍스트 프로바이더 컴포넌트
export const AuthProvider = ({ children }: PropsWithChildren) => {
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
              const currentUser = await authService.getCurrentUser();
              setUser(currentUser);
            } catch (error) {
              console.error(error);
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
        console.error(err);
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
      setUser(response.user);
      // toast.success('로그인되었습니다.');
      return true;
    } catch (err) {
      console.error(err);
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
      console.error(err);
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
      setUser(response);
      toast.success('프로필이 업데이트되었습니다.');
      
      // 로컬 스토리지의 사용자 정보 업데이트
      localStorage.setItem('user', JSON.stringify(response));
      
      return true;
    } catch (err) {
      console.error(err);
      setError('프로필 업데이트에 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 회원탈퇴 함수
  const deleteAccount = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await authService.deleteAccount();
      setUser(null);
      toast.success('계정이 성공적으로 삭제되었습니다.');
      
      return true;
    } catch (err) {
      console.error(err);
      setError('계정 삭제에 실패했습니다.');

      return false;
    } finally {
      setLoading(false);
    }
  }

  // 역할별 리디렉션 경로 결정
  const getRedirectPath = (): string => {
    if (!user) {
      return '/';
    }

    // 관리자는 대시보드로
    if (user.role === 'ADMIN') {
      return '/admin/categories';
    }

    // 일반 유저는 메인 페이지로
    return '/';
  };

  // 계산된 속성들
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isUser = user?.role === 'USER';

  // 컨텍스트 값 정의
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isUser,
    login,
    register,
    logout,
    updateUserProfile,
    deleteAccount,
    getRedirectPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 커스텀 훅 - 인증 컨텍스트 사용을 위한 편의 함수
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}


export default AuthContext;