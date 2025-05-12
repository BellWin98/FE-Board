import apiClient from './api';
import type { LoginRequest, RegisterRequest, User, ApiResponse } from '../types/models';

// 사용자 인증 관련 API 서비스
export const authService = {
  // 로그인
  async login(credentials: LoginRequest): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await apiClient.post<ApiResponse<{ token: string; user: User }>>(
      '/auth/login',
      credentials
    );
    
    // 응답에서 토큰과 사용자 정보를 추출하여 로컬 스토리지에 저장
    const { token, user } = response.data.data;
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },
  
  // 회원가입
  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>('/auth/register', userData);
    return response.data;
  },
  
  // 로그아웃
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
  
  // 현재 사용자 정보 조회
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },
  
  // 비밀번호 변경
  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
  
  // 프로필 업데이트
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile', userData);
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