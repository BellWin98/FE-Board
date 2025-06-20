
import apiClient from './api';
import type { Friend, FriendRequest, User, PageResponse } from '../types/models';

export const friendService = {
  // 친구 목록 조회
  async getFriends(page: number = 0, size: number = 20): Promise<PageResponse<Friend>> {
    const response = await apiClient.get<PageResponse<Friend>>('/friends', {
      params: { page, size }
    });
    return response.data;
  },

  // 친구 요청 보내기
  async sendFriendRequest(request: FriendRequest): Promise<Friend> {
    const response = await apiClient.post<Friend>('/friends/request', request);
    return response.data;
  },

  // 받은 친구 요청 목록
  async getReceivedRequests(page: number = 0, size: number = 20): Promise<PageResponse<Friend>> {
    const response = await apiClient.get<PageResponse<Friend>>('/friends/requests/received', {
      params: { page, size }
    });
    return response.data;
  },

  // 보낸 친구 요청 목록
  async getSentRequests(page: number = 0, size: number = 20): Promise<PageResponse<Friend>> {
    const response = await apiClient.get<PageResponse<Friend>>('/friends/requests/sent', {
      params: { page, size }
    });
    return response.data;
  },

  // 친구 요청 수락
  async acceptFriendRequest(requestId: number): Promise<Friend> {
    const response = await apiClient.put<Friend>(`/friends/requests/${requestId}/accept`);
    return response.data;
  },

  // 친구 요청 거절
  async rejectFriendRequest(requestId: number): Promise<void> {
    await apiClient.put(`/friends/requests/${requestId}/reject`);
  },

  // 친구 삭제
  async removeFriend(friendId: number): Promise<void> {
    await apiClient.delete(`/friends/${friendId}`);
  },

  // 사용자 검색 (이메일로)
  async searchUserByEmail(email: string): Promise<User | null> {
    try {
      const response = await apiClient.get<User>(`/users/search`, {
        params: { email }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
};

export default friendService;
