import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { z } from 'zod';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import TextArea from '../../components/ui/TextArea';
import { useAuth } from '../../contexts/AuthContext';
import commentService from '../../services/commentService';
import postService from '../../services/postService';
import type { Comment, CreateCommentRequest, Post } from '../../types/models';

// 글로벌 동기화 시스템
const useGlobalViewSync = () => {
  const queryClient = useQueryClient();

  const syncViewCountGlobally = (postId: string, newViewCount: number) => {
    console.log(`🔄 글로벌 조회수 동기화: 게시글 ${postId} → ${newViewCount}`);

    // 1. 게시글 상세 캐시 업데이트
    queryClient.setQueryData(['post', postId], (oldData: Post | undefined) => {
      if (!oldData) return oldData;
      return { ...oldData, viewCount: newViewCount };
    });

    // 2. 모든 게시글 목록에서 해당 게시글 조회수 업데이트
    const updatePostInList = (queryKey: any[]) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.content) return oldData;
        
        return {
          ...oldData,
          content: oldData.content.map((post: Post) => 
            post.id.toString() === postId 
              ? { ...post, viewCount: newViewCount }
              : post
          )
        };
      });
    };

    // 3. 모든 관련 쿼리 찾기 및 업데이트
    const queryCache = queryClient.getQueryCache();
    
    queryCache.getAll().forEach(query => {
      const queryKey = query.queryKey;
      
      if (Array.isArray(queryKey)) {
        // HomePage의 최신/인기 게시글
        if (queryKey[0] === 'latestPosts' || queryKey[0] === 'popularPosts') {
          updatePostInList(queryKey);
        }
        
        // BoardsPage와 BoardDetailPage의 게시글 목록
        if (queryKey[0] === 'posts') {
          updatePostInList(queryKey);
        }
        
        // 기타 관련 목록들
        if (queryKey[0] === 'myPosts' || queryKey[0] === 'bookmarkedPosts') {
          updatePostInList(queryKey);
        }
      }
    });

    // 4. 다른 탭에도 알림 (브라우저 탭 간 동기화)
    try {
      localStorage.setItem(`view_sync_${postId}`, JSON.stringify({
        postId,
        viewCount: newViewCount,
        timestamp: Date.now()
      }));
      
      setTimeout(() => {
        localStorage.removeItem(`view_sync_${postId}`);
      }, 1000);
    } catch (error) {
      console.warn('탭 간 동기화 실패:', error);
    }

    console.log(`✅ 글로벌 조회수 동기화 완료`);
  };

  return { syncViewCountGlobally };
};

// 조회수 최적화 훅 - 글로벌 동기화 통합
const useViewCountOptimization = (postId: string, enabled: boolean = true) => {
  const queryClient = useQueryClient();
  const { syncViewCountGlobally } = useGlobalViewSync();
  const [hasIncremented, setHasIncremented] = useState(false);
  const [localViewCount, setLocalViewCount] = useState<number | null>(null);
  
  const getStorageKey = (id: string) => `post_view_${id}`;

  const shouldIncrementView = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const stored = localStorage.getItem(getStorageKey(postId));
      if (stored) {
        const { lastViewTime } = JSON.parse(stored);
        const now = Date.now();
        const cooldownPeriod = 24 * 60 * 60 * 1000; // 24시간
        
        if (lastViewTime && (now - lastViewTime) < cooldownPeriod) {
          return false;
        }
      }
    } catch (error) {
      console.warn('조회 기록 확인 실패:', error);
    }
    
    return true;
  };

  const executeViewIncrement = () => {
    if (!enabled || hasIncremented || !shouldIncrementView()) return;

    const queryKey = ['post', postId];
    const previousPost = queryClient.getQueryData<Post>(queryKey);
    
    if (!previousPost) return;

    const newViewCount = previousPost.viewCount + 1;
    
    // 1. 로컬 상태 즉시 업데이트
    queryClient.setQueryData<Post>(queryKey, {
      ...previousPost,
      viewCount: newViewCount
    });

    setLocalViewCount(newViewCount);
    setHasIncremented(true);

    // 2. 글로벌 동기화 실행 (다른 페이지들도 업데이트)
    syncViewCountGlobally(postId, newViewCount);

    // 3. 로컬 스토리지에 조회 기록 저장
    try {
      localStorage.setItem(getStorageKey(postId), JSON.stringify({
        lastViewTime: Date.now(),
        viewCount: newViewCount
      }));
    } catch (error) {
      console.warn('조회 기록 저장 실패:', error);
    }

    // 4. 서버에 조회수 증가 요청 (백그라운드)
    postService.incrementViews(Number(postId))
      .then(() => {
        console.log('✅ 조회수 서버 동기화 완료');
        // 최종적으로 서버 데이터로 검증
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey });
        }, 2000);
      })
      .catch((error) => {
        console.error('❌ 조회수 증가 실패:', error);
        // 실패 시 롤백
        queryClient.setQueryData(queryKey, previousPost);
        setLocalViewCount(previousPost.viewCount);
        setHasIncremented(false);
        
        // 글로벌 롤백
        syncViewCountGlobally(postId, previousPost.viewCount);
        
        try {
          localStorage.removeItem(getStorageKey(postId));
        } catch (storageError) {
          console.warn('조회 기록 롤백 실패:', storageError);
        }
      });
  };

  return {
    executeViewIncrement,
    hasIncremented,
    localViewCount
  };
};

// 댓글 작성 폼 유효성 검사 스키마
const commentSchema = z.object({
  content: z.string().min(2, '댓글은 최소 2자 이상이어야 합니다.').max(1000, '댓글은 최대 1000자까지 입력할 수 있습니다.'),
});

// 댓글 작성 폼 타입
type CommentFormValues = z.infer<typeof commentSchema>;

const PostDetailPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [replyTo, setReplyTo] = useState<{ id: number; nickname: string } | null>(null);

  // 글로벌 동기화 및 조회수 최적화 훅 사용
  const { executeViewIncrement, hasIncremented, localViewCount } = useViewCountOptimization(postId || '', !!postId);

  // 브라우저 탭 간 동기화 리스너
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('view_sync_') && e.key.includes(postId || '')) {
        try {
          const data = JSON.parse(e.newValue || '{}');
          if (data.postId === postId && data.viewCount) {
            // 다른 탭에서 조회수가 변경되었을 때 현재 탭도 업데이트
            queryClient.setQueryData(['post', postId], (oldData: Post | undefined) => {
              if (!oldData) return oldData;
              return { ...oldData, viewCount: data.viewCount };
            });
          }
        } catch (error) {
          console.warn('탭 간 동기화 처리 실패:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [postId, queryClient]);

  // React Hook Form 초기화
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: '',
    },
  });

  // 게시글 상세 조회 - 조회수 최적화 통합
  const {
    data: postData,
    isLoading: isPostLoading,
    error: postError,
  } = useQuery<Post>({
    queryKey: ['post', postId],
    queryFn: async () => {
      const result = await postService.getPost(Number(postId));
      return result;
    },
    enabled: !!postId,
  });

  // 게시글 로드 후 조회수 증가 (useEffect 방식)
  useEffect(() => {
    if (postData && !hasIncremented && isAuthenticated) {
      executeViewIncrement();
    }
  }, [postData, hasIncremented, isAuthenticated, executeViewIncrement]);

  // 댓글 목록 조회
  const {
    data: commentsData,
    isLoading: isCommentsLoading,
    error: commentsError,
  } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentService.getComments(Number(postId)),
    enabled: !!postId,
  });

  // 북마크 추가 뮤테이션
  const { mutate: addBookmark } = useMutation({
    mutationFn: () => postService.addBookmark(Number(postId)),
    onSuccess: () => {
      toast.success('북마크가 추가되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
    onError: () => {
      toast.error('북마크 추가에 실패했습니다.');
    },
  });

  // 북마크 제거 뮤테이션
  const { mutate: removeBookmark } = useMutation({
    mutationFn: () => postService.removeBookmark(Number(postId)),
    onSuccess: () => {
      toast.success('북마크가 제거되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
    onError: () => {
      toast.error('북마크 제거에 실패했습니다.');
    },
  });

  // 댓글 작성 뮤테이션 - 최적화된 업데이트 로직
  const { mutate: createComment } = useMutation({
    mutationFn: (data: CreateCommentRequest) => commentService.createComment(data),
    onMutate: async (newComment) => {
      // Optimistic Update: 댓글 작성 즉시 UI 업데이트
      
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      await queryClient.cancelQueries({ queryKey: ['comments', postId] });

      // 현재 데이터 백업
      const previousPost = queryClient.getQueryData(['post', postId]);
      const previousComments = queryClient.getQueryData(['comments', postId]);

      // 게시글 댓글 수 즉시 증가
      queryClient.setQueryData(['post', postId], (old: Post | undefined) => {
        if (!old) return old;
        return {
          ...old,
          commentCount: old.commentCount + 1
        };
      });

      // 임시 댓글 ID 생성 (실제 서버 응답에서 교체됨)
      const tempCommentId = Date.now();
      const tempComment: Comment = {
        id: tempCommentId,
        content: newComment.content,
        postId: Number(postId),
        author: user!,
        authorId: user!.id,
        parentId: newComment.parentId || null,
        children: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 댓글 목록에 새 댓글 즉시 추가
      queryClient.setQueryData(['comments', postId], (old: any) => {
        if (!old) return old;
        
        // 댓글이 답글인 경우
        if (newComment.parentId) {
          return {
            ...old,
            content: old.content.map((comment: Comment) => {
              if (comment.id === newComment.parentId) {
                return {
                  ...comment,
                  children: [...comment.children, tempComment]
                };
              }
              return comment;
            })
          };
        }
        
        // 일반 댓글인 경우
        return {
          ...old,
          content: [tempComment, ...old.content]
        };
      });

      // 백업 데이터 반환 (롤백용)
      return { previousPost, previousComments };
    },
    onSuccess: (createdComment) => {
      toast.success('댓글이 작성되었습니다.');
      reset();
      setReplyTo(null);
      console.log(createdComment);
      
      // 서버에서 받은 실제 댓글로 교체
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
    onError: (error, newComment, context) => {
      toast.error('댓글 작성에 실패했습니다.');
      console.error(error);
      console.log(newComment);
      
      // 실패 시 이전 상태로 롤백
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', postId], context.previousComments);
      }
    },
    onSettled: () => {
      // 최종적으로 서버 데이터와 동기화
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  // 댓글 삭제 뮤테이션 - 댓글 수 감소 포함
  const { mutate: deleteComment } = useMutation({
    mutationFn: (commentId: number) => commentService.deleteComment(commentId),
    onMutate: async (commentId) => {
      // 댓글 삭제 시에도 Optimistic Update 적용
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      console.log(commentId);
      
      const previousPost = queryClient.getQueryData(['post', postId]);
      
      // 댓글 수 즉시 감소
      queryClient.setQueryData(['post', postId], (old: Post | undefined) => {
        if (!old) return old;
        return {
          ...old,
          commentCount: Math.max(0, old.commentCount - 1)
        };
      });

      return { previousPost };
    },
    onSuccess: () => {
      toast.success('댓글이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
    onError: (error, commentId, context) => {
      toast.error('댓글 삭제에 실패했습니다.');
      console.error(error);
      console.log(commentId);
      
      // 실패 시 롤백
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
    },
  });

  // 게시글 삭제 뮤테이션
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: () => postService.deletePost(Number(postId)),
    onSuccess: () => {
      toast.success('게시글이 삭제되었습니다.');
      navigate('/boards');
    },
    onError: () => {
      toast.error('게시글 삭제에 실패했습니다.');
    },
  });

  // 북마크 토글 핸들러
  const handleToggleBookmark = () => {
    if (!isAuthenticated) {
      toast.info('로그인이 필요한 기능입니다.');
      navigate('/login', { state: { from: { pathname: `/posts/${postId}` } } });
      return;
    }

    const post = postData;
    if (post?.bookmarked) {
      removeBookmark();
    } else {
      addBookmark();
    }
  };

  // 댓글 작성 핸들러
  const onSubmitComment = (data: CommentFormValues) => {
    if (!isAuthenticated) {
      toast.info('로그인이 필요한 기능입니다.');
      navigate('/login', { state: { from: { pathname: `/posts/${postId}` } } });
      return;
    }

    const commentData: CreateCommentRequest = {
      content: data.content,
      postId: Number(postId),
      parentId: replyTo?.id,
    };

    createComment(commentData);
  };

  // 게시글 삭제 핸들러
  const handleDeletePost = () => {
    if (window.confirm('정말로 게시글을 삭제하시겠습니까?')) {
      deletePost();
    }
  };

  // 답글 작성 모드 토글 핸들러
  const toggleReplyMode = (comment: Comment) => {
    if (replyTo?.id === comment.id) {
      setReplyTo(null);
    } else {
      setReplyTo({
        id: comment.id,
        nickname: comment.author.nickname,
      });
      // 답글 폼으로 스크롤
      setTimeout(() => {
        const commentForm = document.getElementById('comment-form');
        if (commentForm) {
          commentForm.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // 댓글 삭제 핸들러
  const handleDeleteComment = (commentId: number) => {
    if (window.confirm('정말로 댓글을 삭제하시겠습니까?')) {
      deleteComment(commentId);
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // 게시글 로딩 중이거나 에러 발생 시 처리
  if (isPostLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (postError) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
          게시글을 불러오는 중 오류가 발생했습니다.
        </h2>
        <Button variant="primary" onClick={() => navigate('/boards')}>
          게시판으로 돌아가기
        </Button>
      </div>
    );
  }

  const post = postData;

  if (!post) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold mb-2">존재하지 않는 게시글입니다.</h2>
        <Button variant="primary" onClick={() => navigate('/boards')}>
          게시판으로 돌아가기
        </Button>
      </div>
    );
  }

  // 현재 사용자가 게시글 작성자인지 확인
  const isAuthor = user?.id === post.authorId;

  // 댓글 렌더링 함수
  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`py-4 ${isReply ? 'pl-8 border-l-2 border-gray-200 dark:border-gray-700' : 'border-t border-gray-200 dark:border-gray-700'}`}
    >
      <div className="flex justify-between">
        <div className="flex items-center mb-2">
          <div className="font-medium">{comment.author.nickname}</div>
          <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            {formatDate(comment.createdAt)}
          </div>
        </div>
        <div className="flex space-x-2">
          {isAuthenticated && (
            <button
              className="text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
              onClick={() => toggleReplyMode(comment)}
            >
              {replyTo?.id === comment.id ? '취소' : '답글'}
            </button>
          )}
          {(isAuthor || user?.id === comment.authorId) && (
            <button
              className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 text-sm"
              onClick={() => handleDeleteComment(comment.id)}
            >
              삭제
            </button>
          )}
        </div>
      </div>
      <div className="mt-1 whitespace-pre-wrap">{comment.content}</div>

      {/* 대댓글 목록 */}
      {comment.children && comment.children.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.children.map((child) => renderComment(child, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* 게시글 헤더 */}
      <div className="mb-6">
        <Link to="/boards" className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-4">
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          게시판으로 돌아가기
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded text-xs">
                  {post.category.name}
                </span>
              </div>
              
              {(isAuthor || user?.role === 'ADMIN') && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/post/edit/${post.id}`)}
                  >
                    수정
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDeletePost}
                    isLoading={isDeleting}
                  >
                    삭제
                  </Button>
                </div>
              )}
            </div>

            <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <span className="font-medium">{post.author.nickname}</span>
                <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
                <span className="text-gray-500 dark:text-gray-400">{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                {/* 지능형 조회수 표시 */}
                <div className="flex items-center group">
                  <svg className={`h-5 w-5 mr-1 transition-all duration-300 ${
                    hasIncremented 
                      ? 'text-primary-500 scale-110' 
                      : 'text-gray-500 group-hover:text-primary-500'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span className={`transition-all duration-300 font-medium ${
                    hasIncremented 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {localViewCount !== null ? localViewCount.toLocaleString() : post.viewCount.toLocaleString()}
                  </span>
                  {hasIncremented && (
                    <div className="flex items-center ml-1 animate-pulse">
                      <span className="text-xs text-green-500 dark:text-green-400 font-bold">
                        +1
                      </span>
                      <svg className="w-3 h-3 ml-0.5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {post.commentCount}
                </div>
                <button
                  className={`flex items-center ${
                    post.bookmarked
                      ? 'text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300'
                      : 'hover:text-yellow-500 dark:hover:text-yellow-400'
                  }`}
                  onClick={handleToggleBookmark}
                >
                  <svg className="h-5 w-5 mr-1" fill={post.bookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  {post.bookmarked ? '북마크 취소' : '북마크'}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="mt-8">
        {/* 실시간 갱신되는 댓글 수 헤더 - 개선된 시각적 피드백 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <span>댓글</span>
            <span 
              className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                isSubmitting 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 animate-pulse'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {post.commentCount}
              {isSubmitting && (
                <svg className="ml-1 w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </span>
          </h2>
          
          {/* 댓글 작성 상태 표시 */}
          {isSubmitting && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>댓글 작성 중...</span>
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1 h-1 bg-primary-500 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Card>
          {/* 댓글 작성 폼 */}
          <div id="comment-form">
            <form onSubmit={handleSubmit(onSubmitComment)} className="mb-6">
              {replyTo && (
                <div className="mb-2 flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <span>
                    <span className="font-medium">{replyTo.nickname}</span>님에게 답글 작성 중
                  </span>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={() => setReplyTo(null)}
                  >
                    취소
                  </button>
                </div>
              )}

              <TextArea
                placeholder={isAuthenticated ? '댓글을 작성하세요' : '로그인 후 댓글을 작성할 수 있습니다'}
                rows={4}
                {...register('content')}
                error={errors.content?.message}
                disabled={!isAuthenticated || isSubmitting}
              />

              <div className="flex justify-end mt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!isAuthenticated}
                  isLoading={isSubmitting}
                >
                  {replyTo ? '답글 작성' : '댓글 작성'}
                </Button>
              </div>
            </form>
          </div>

          {/* 댓글 목록 */}
          {isCommentsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : commentsError ? (
            <div className="text-center py-8 text-red-500">
              댓글을 불러오는 중 오류가 발생했습니다.
            </div>
          ) : commentsData?.content?.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
            </div>
          ) : (
            <div className="space-y-2">
              {commentsData?.content
                ?.filter((comment: Comment) => !comment.parentId) // 루트 댓글만 필터링
                .map((comment: Comment) => renderComment(comment))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PostDetailPage;