// 사용자 모델
export interface User {
    id: number;
    email: string;
    username: string;
    profileImage?: string;
    role: 'USER' | 'ADMIN';
    createdAt: string;
    updatedAt: string;
  }
  
  // 로그인 요청 모델
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  // 회원가입 요청 모델
  export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }
  
  // 카테고리 모델
  export interface Category {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // 게시글 모델
  export interface Post {
    id: number;
    title: string;
    content: string;
    views: number;
    categoryId: number;
    category: Category;
    author: User;
    authorId: number;
    comments: Comment[];
    commentCount: number;
    bookmarked: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  // 게시글 목록 요청 매개변수
  export interface PostListParams {
    page: number;
    size: number;
    categoryId?: number;
    sort?: 'newest' | 'popular';
    search?: string;
  }
  
  // 게시글 작성 요청 모델
  export interface CreatePostRequest {
    title: string;
    content: string;
    categoryId: number;
  }
  
  // 게시글 수정 요청 모델
  export interface UpdatePostRequest {
    title: string;
    content: string;
    categoryId: number;
  }
  
  // 댓글 모델
  export interface Comment {
    id: number;
    content: string;
    postId: number;
    author: User;
    authorId: number;
    parentId: number | null;
    children: Comment[];
    createdAt: string;
    updatedAt: string;
  }
  
  // 댓글 작성 요청 모델
  export interface CreateCommentRequest {
    content: string;
    postId: number;
    parentId?: number;
  }
  
  // 댓글 수정 요청 모델
  export interface UpdateCommentRequest {
    content: string;
  }
  
  // 페이지네이션 응답 모델
  export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  }
  
  // API 응답 모델
  export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
  }
  
  // 북마크 모델
  export interface Bookmark {
    id: number;
    postId: number;
    userId: number;
    post: Post;
    createdAt: string;
  }