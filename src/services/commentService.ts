import apiClient from './api';
import type {
    Comment,
    CreateCommentRequest,
    UpdateCommentRequest,
    ApiResponse,
    PageResponse
} from '../types/models';

// 댓글 관련 API 서비스
export const commentService = {
  // 게시글의 댓글 목록 조회
  async getComments(postId: number, page: number = 0, size: number = 20): Promise<ApiResponse<PageResponse<Comment>>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Comment>>>(`/posts/${postId}/comments`, {
      params: {
        page,
        size,
      },
    });
    return response.data;
  },

  // 댓글 작성
  async createComment(commentData: CreateCommentRequest): Promise<ApiResponse<Comment>> {
    const response = await apiClient.post<ApiResponse<Comment>>('/comments', commentData);
    return response.data;
  },

  // 댓글 수정
  async updateComment(id: number, commentData: UpdateCommentRequest): Promise<ApiResponse<Comment>> {
    const response = await apiClient.put<ApiResponse<Comment>>(`/comments/${id}`, commentData);
    return response.data;
  },

  // 댓글 삭제
  async deleteComment(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/comments/${id}`);
    return response.data;
  },

  // 대댓글 작성
  async createReply(parentId: number, commentData: Omit<CreateCommentRequest, 'parentId'>): Promise<ApiResponse<Comment>> {
    const data: CreateCommentRequest = {
      ...commentData,
      parentId,
    };
    const response = await apiClient.post<ApiResponse<Comment>>('/comments', data);
    return response.data;
  },

  // 내가 작성한 댓글 목록 조회
  async getMyComments(page: number = 0, size: number = 20): Promise<ApiResponse<PageResponse<Comment>>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Comment>>>('/comments/me', {
      params: {
        page,
        size,
      },
    });
    return response.data;
  },
};

export default commentService;