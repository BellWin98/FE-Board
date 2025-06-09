import apiClient from './api';
import type {
    Comment,
    CreateCommentRequest,
    UpdateCommentRequest,
    PageResponse
} from '../types/models';

// 댓글 관련 API 서비스
export const commentService = {
  // 게시글의 댓글 목록 조회
  async getComments(postId: number, page: number = 0, size: number = 20): Promise<PageResponse<Comment>> {
    const response = await apiClient.get<PageResponse<Comment>>(`/posts/${postId}/comments`, {
      params: {
        page,
        size,
      },
    });
    return response.data;
  },

  // 댓글 작성
  async createComment(commentData: CreateCommentRequest): Promise<Comment> {
    const response = await apiClient.post<Comment>('/comments', commentData);
    return response.data;
  },

  // 댓글 수정
  async updateComment(id: number, commentData: UpdateCommentRequest): Promise<Comment> {
    const response = await apiClient.put<Comment>(`/comments/${id}`, commentData);
    return response.data;
  },

  // 댓글 삭제
  async deleteComment(id: number): Promise<void> {
    const response = await apiClient.delete<void>(`/comments/${id}`);
    return response.data;
  },

  // 대댓글 작성
  async createReply(parentId: number, commentData: Omit<CreateCommentRequest, 'parentId'>): Promise<Comment> {
    const data: CreateCommentRequest = {
      ...commentData,
      parentId,
    };
    const response = await apiClient.post<Comment>('/comments', data);
    return response.data;
  },

  // 내가 작성한 댓글 목록 조회
  async getMyComments(page: number = 0, size: number = 20): Promise<PageResponse<Comment>> {
    const response = await apiClient.get<PageResponse<Comment>>('/comments/me', {
      params: {
        page,
        size,
      },
    });
    return response.data;
  },
};

export default commentService;