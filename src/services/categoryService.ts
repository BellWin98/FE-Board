import apiClient from './api';
import type { Category } from '../types/models';

// 카테고리 관련 API 서비스
export const categoryService = {
  // 모든 카테고리 목록 조회
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  },

  // 카테고리 상세 조회
  async getCategory(id: number): Promise<Category> {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    return response.data;
  },

  // 카테고리 생성 (관리자 전용)
  async createCategory(categoryData: { name: string; description: string }): Promise<Category> {
    const response = await apiClient.post<Category>('/categories', categoryData);
    return response.data;
  },

  // 카테고리 수정 (관리자 전용)
  async updateCategory(id: number, categoryData: { name: string; description: string }): Promise<Category> {
    const response = await apiClient.put<Category>(`/categories/${id}`, categoryData);
    return response.data;
  },

  // 카테고리 삭제 (관리자 전용)
  async deleteCategory(id: number): Promise<void> {
    const response = await apiClient.delete<void>(`/categories/${id}`);
    return response.data;
  },
  
  // 특정 카테고리의 게시글 수 조회
  async getCategoryPostCount(id: number): Promise<{ count: number }> {
    const response = await apiClient.get<{ count: number }>(`/categories/${id}/post-count`);
    return response.data;
  }
};

export default categoryService;