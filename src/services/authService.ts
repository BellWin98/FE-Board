import apiClient from './api';
import type { LoginRequest, RegisterRequest, User } from '../types/models';

// 사용자 인증 관련 API 서비스
export const authService = {
  // 로그인
  async login(credentials: LoginRequest): Promise<{ accessToken: string; user: User }> {
    const response = await apiClient.post<{ accessToken: string; user: User }>(
      '/auth/login',
      credentials
    );
    
    // 응답에서 토큰과 사용자 정보를 추출하여 로컬 스토리지에 저장
    const { accessToken, user } = response.data;
    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },
  
  // 회원가입
  async register(userData: RegisterRequest): Promise<User> {
    const response = await apiClient.post<User>('/auth/register', userData);
    return response.data;
  },
  
  // 로그아웃
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
  
  // 현재 사용자 정보 조회
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
  
  // 비밀번호 변경
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const response = await apiClient.post<void>('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
  
  // 프로필 업데이트
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/auth/profile', userData);
    return response.data;
  },
  
  // 인증 여부 확인
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },
  
  // 현재 사용자 정보 반환 (로컬 스토리지)
  getUser(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },
  
  // 관리자 여부 확인
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'ADMIN';
  },
};

export default authService;