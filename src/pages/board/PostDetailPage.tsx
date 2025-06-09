import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Post, Comment, CreateCommentRequest } from '../../types/models';
import postService from '../../services/postService';
import commentService from '../../services/commentService';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import TextArea from '../../components/ui/TextArea';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';

// 댓글 작성 폼 유효성 검사 스키마
const commentSchema = z.object({
  content: z.string().min(2, '댓글은 최소 2자 이상이어야 합니다.').max(1000, '댓글은 최대 1000자까지 입력할 수 있습니다.'),
});

// 댓글 작성 폼 타입
type CommentFormValues = z.infer<typeof commentSchema>;

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [replyTo, setReplyTo] = useState<{ id: number; nickname: string } | null>(null);

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

  // 게시글 상세 조회
  const {
    data: postData,
    isLoading: isPostLoading,
    error: postError,
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const result = await postService.getPost(Number(postId));
      // 조회수 증가 API 호출
      postService.incrementViews(Number(postId));
      return result;
    },
    enabled: !!postId,
  });

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

  // 댓글 작성 뮤테이션
  const { mutate: createComment } = useMutation({
    mutationFn: (data: CreateCommentRequest) => commentService.createComment(data),
    onSuccess: () => {
      toast.success('댓글이 작성되었습니다.');
      reset();
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: () => {
      toast.error('댓글 작성에 실패했습니다.');
    },
  });

  // 댓글 삭제 뮤테이션
  const { mutate: deleteComment } = useMutation({
    mutationFn: (commentId: number) => commentService.deleteComment(commentId),
    onSuccess: () => {
      toast.success('댓글이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: () => {
      toast.error('댓글 삭제에 실패했습니다.');
    },
  });

  // 게시글 삭제 뮤테이션
  const { mutate: deletePost, isLoading: isDeleting } = useMutation({
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
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  {post.viewCount}
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
        <h2 className="text-xl font-bold mb-4">댓글 {post.commentCount}</h2>

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