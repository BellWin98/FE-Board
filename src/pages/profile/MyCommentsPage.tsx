import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Comment } from '../../types/models';
import commentService from '../../services/commentService';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';

const MyCommentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL 쿼리 파라미터 가져오기
  const initialPage = parseInt(searchParams.get('page') || '0');
  
  // 상태 초기화
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const PAGE_SIZE = 10;
  
  // 내 댓글 목록 조회
  const {
    data: commentsData,
    isLoading: isCommentsLoading,
    error: commentsError,
  } = useQuery({
    queryKey: ['myComments', currentPage],
    queryFn: () => commentService.getMyComments(currentPage, PAGE_SIZE),
    enabled: isAuthenticated,
  });

  // 댓글 삭제 뮤테이션
  const { mutate: deleteComment, isLoading: isDeleting } = useMutation({
    mutationFn: (commentId: number) => commentService.deleteComment(commentId),
    onSuccess: () => {
      toast.success('댓글이 삭제되었습니다.');
      queryClient.invalidateQueries(['myComments', currentPage]);
    },
    onError: () => {
      toast.error('댓글 삭제에 실패했습니다.');
    },
  });

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchParams({ page: page.toString() });
    window.scrollTo(0, 0);
  };

  // 댓글 삭제 핸들러
  const handleDeleteComment = (commentId: number) => {
    if (window.confirm('정말로 댓글을 삭제하시겠습니까?')) {
      deleteComment(commentId);
    }
  };

  // 날짜 포매팅 함수
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

  // 텍스트 내용 잘라내기 함수
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // 사용자가 로그인하지 않은 경우 로그인 페이지로 리디렉션
  if (!isAuthenticated) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold mb-4">로그인이 필요한 페이지입니다</h2>
        <Button
          variant="primary"
          onClick={() => navigate('/login', { state: { from: { pathname: '/my-comments' } } })}
        >
          로그인
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">내가 작성한 댓글</h1>

      {/* 댓글 목록 */}
      <div>
        {isCommentsLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : commentsError ? (
          <div className="text-center py-10 text-red-500">
            댓글을 불러오는 중 오류가 발생했습니다.
          </div>
        ) : commentsData?.data?.content?.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              작성한 댓글이 없습니다.
            </div>
            <Button variant="primary" onClick={() => navigate('/boards')}>
              게시판으로 이동하기
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {commentsData?.data?.content.map((comment: Comment) => (
              <Card key={comment.id} className="p-6">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                      <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/posts/${comment.postId}`)}
                      >
                        게시글 보기
                      </Button>
                    </div>
                    
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={isDeleting}
                    >
                      삭제
                    </Button>
                  </div>
                  
                  <div className="border-l-4 border-gray-200 dark:border-gray-700 pl-4 py-2">
                    <p className="whitespace-pre-wrap">{comment.content}</p>
                  </div>
                  
                  {comment.parentId && (
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>대댓글</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {commentsData?.data?.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={commentsData.data.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default MyCommentsPage;