// 사용자 모델
export interface User {
    id: number;
    email: string;
    nickname: string;
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
    nickname: string;
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
    viewCount: number;
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
  
  // 북마크 모델
  export interface Bookmark {
    id: number;
    postId: number;
    userId: number;
    post: Post;
    createdAt: string;
  }

  // 친구 관계 모델
  export interface Friend {
    id: number;
    requester: User;
    requesterId: number;
    addressee: User;
    addresseeId: number;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
    updatedAt: string;
  }

  // 친구 요청 모델
  export interface FriendRequest {
    email: string;
    message?: string;
  }

  // 챌린지 모델
  export interface Challenge {
    id: number;
    title: string;
    description: string;
    category: string;
    goalAmount: number;
    betAmount: number;
    startDate: string;
    endDate: string;
    status: 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    verificationMethod: 'PHOTO' | 'TEXT' | 'MUTUAL' | 'ADMIN';
    maxParticipants: number;
    creator: User;
    creatorId: number;
    participants: ChallengeParticipant[];
    totalPot: number;
    successRate: number;
    createdAt: string;
    updatedAt: string;
  }

  // 챌린지 참가자 모델
  export interface ChallengeParticipant {
    id: number;
    challengeId: number;
    user: User;
    userId: number;
    betAmount: number;
    status: 'ACTIVE' | 'SUCCESS' | 'FAILED' | 'PENDING_VERIFICATION';
    joinedAt: string;
    progress: ChallengeProgress[];
  }

  // 챌린지 진행상황 모델
  export interface ChallengeProgress {
    id: number;
    participantId: number;
    participant: ChallengeParticipant;
    date: string;
    completed: boolean;
    proof?: string; // 인증 사진 URL 또는 텍스트
    verifiedBy?: User;
    verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
    createdAt: string;
  }

  // 챌린지 생성 요청 모델
  export interface CreateChallengeRequest {
    title: string;
    description: string;
    category: string;
    goalAmount: number;
    betAmount: number;
    startDate: string;
    endDate: string;
    verificationMethod: 'PHOTO' | 'TEXT' | 'MUTUAL' | 'ADMIN';
    maxParticipants: number;
    invitedFriends: number[];
  }

  // 챌린지 참가 요청 모델
  export interface JoinChallengeRequest {
    challengeId: number;
    betAmount: number;
  }

  // 챌린지 진행상황 제출 모델
  export interface SubmitProgressRequest {
    challengeId: number;
    completed: boolean;
    proof?: string;
  }

  // 진행상황 검증 요청 모델
  export interface VerifyProgressRequest {
    progressId: number;
    verified: boolean;
    comment?: string;
  }