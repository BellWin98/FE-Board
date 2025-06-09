import apiClient from './api';
import type {
    Post,
    CreatePostRequest,
    UpdatePostRequest,
    PostListParams,
    PageResponse
} from '../types/models';

// 게시글 관련 API 서비스
export const postService = {
  // 게시글 목록 조회
  async getPosts(params: PostListParams): Promise<PageResponse<Post>> {
    const response = await apiClient.get<PageResponse<Post>>('/posts', {
      params: {
        page: params.page,
        size: params.size,
        categoryId: params.categoryId,
        sort: params.sort,
        search: params.search,
      },
    });
    return response.data;
  },

  // 게시글 상세 조회
  async getPost(id: number): Promise<Post> {
    const response = await apiClient.get<Post>(`/posts/${id}`);
    return response.data;
  },

  // 게시글 작성
  async createPost(postData: CreatePostRequest): Promise<Post> {
    const response = await apiClient.post<Post>('/posts', postData);
    return response.data;
  },

  // 게시글 수정
  async updatePost(id: number, postData: UpdatePostRequest): Promise<Post> {
    const response = await apiClient.put<Post>(`/posts/${id}`, postData);
    return response.data;
  },

  // 게시글 삭제
  async deletePost(id: number): Promise<void> {
    const response = await apiClient.delete<void>(`/posts/${id}`);
    return response.data;
  },

  // 게시글 조회수 증가
  async incrementViews(id: number): Promise<void> {
    const response = await apiClient.post<void>(`/posts/${id}/views`);
    return response.data;
  },

  // 내가 작성한 게시글 목록 조회
  async getMyPosts(params: Omit<PostListParams, 'categoryId' | 'search'>): Promise<PageResponse<Post>> {
    const response = await apiClient.get<PageResponse<Post>>('/posts/me', {
      params: {
        page: params.page,
        size: params.size,
        sort: params.sort,
      },
    });
    return response.data;
  },

  // 게시글 북마크 추가
  async addBookmark(postId: number): Promise<void> {
    const response = await apiClient.post<void>(`/posts/${postId}/bookmark`);
    return response.data;
  },

  // 게시글 북마크 제거
  async removeBookmark(postId: number): Promise<void> {
    const response = await apiClient.delete<void>(`/posts/${postId}/bookmark`);
    return response.data;
  },

  // 북마크한 게시글 목록 조회
  async getBookmarkedPosts(params: Omit<PostListParams, 'categoryId' | 'search'>): Promise<PageResponse<Post>> {
    const response = await apiClient.get<PageResponse<Post>>('/posts/bookmarks', {
      params: {
        page: params.page,
        size: params.size,
        sort: params.sort,
      },
    });
    return response.data;
  },
};

export default postService;