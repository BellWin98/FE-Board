import apiClient from './api';
import type { Category, ApiResponse } from '../types/models';

// 카테고리 관련 API 서비스
export const categoryService = {
  // 모든 카테고리 목록 조회
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  },

  // 카테고리 상세 조회
  async getCategory(id: number): Promise<ApiResponse<Category>> {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  },

  // 카테고리 생성 (관리자 전용)
  async createCategory(categoryData: { name: string; description: string }): Promise<ApiResponse<Category>> {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', categoryData);
    return response.data;
  },

  // 카테고리 수정 (관리자 전용)
  async updateCategory(id: number, categoryData: { name: string; description: string }): Promise<ApiResponse<Category>> {
    const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, categoryData);
    return response.data;
  },

  // 카테고리 삭제 (관리자 전용)
  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/categories/${id}`);
    return response.data;
  },
  
  // 특정 카테고리의 게시글 수 조회
  async getCategoryPostCount(id: number): Promise<ApiResponse<{ count: number }>> {
    const response = await apiClient.get<ApiResponse<{ count: number }>>(`/categories/${id}/post-count`);
    return response.data;
  }
};

export default categoryService;