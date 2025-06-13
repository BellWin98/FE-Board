import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import postService from '../../services/postService';
import type { Post } from '../../types/models';

const MyBookmarksPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL 쿼리 파라미터 가져오기
  const initialPage = parseInt(searchParams.get('page') || '0');
  const initialSort = (searchParams.get('sort') || 'newest') as 'newest' | 'popular';
  
  // 상태 초기화
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>(initialSort);
  
  const PAGE_SIZE = 10;
  
  // URL 업데이트 함수
  useEffect(() => {
    const params: { [key: string]: string } = {
      page: currentPage.toString(),
    };
    
    if (sortBy !== 'newest') {
      params.sort = sortBy;
    }
    
    setSearchParams(params);
  }, [currentPage, sortBy]);

  // 북마크한 게시글 목록 조회
  const {
    data: postsData,
    isLoading: isPostsLoading,
    error: postsError,
  } = useQuery({
    queryKey: ['bookmarkedPosts', currentPage, sortBy],
    queryFn: () =>
      postService.getBookmarkedPosts({
        page: currentPage,
        size: PAGE_SIZE,
        sort: sortBy,
      }),
    enabled: isAuthenticated,
  });

  // 북마크 제거 뮤테이션
  const { mutate: removeBookmark } = useMutation({
    mutationFn: (postId: number) => postService.removeBookmark(postId),
    onSuccess: () => {
      toast.success('북마크가 제거되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['bookmarkedPosts', currentPage, sortBy] });
    },
    onError: () => {
      toast.error('북마크 제거에 실패했습니다.');
    },
  });

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // 정렬 변경 핸들러
  const handleSortChange = (value: string) => {
    setSortBy(value as 'newest' | 'popular');
    setCurrentPage(0);
  };

  // 북마크 제거 핸들러
  const handleRemoveBookmark = (postId: number) => {
    if (window.confirm('정말로 북마크를 제거하시겠습니까?')) {
      removeBookmark(postId);
    }
  };

  // 날짜 포매팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
          onClick={() => navigate('/login', { state: { from: { pathname: '/my-bookmarks' } } })}
        >
          로그인
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">북마크한 게시글</h1>
        <Select
          options={[
            { value: 'newest', label: '최신순' },
            { value: 'popular', label: '인기순' },
          ]}
          value={sortBy}
          onChange={handleSortChange}
          className="w-32"
        />
      </div>

      {/* 북마크 목록 */}
      <div>
        {isPostsLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : postsError ? (
          <div className="text-center py-10 text-red-500">
            북마크 목록을 불러오는 중 오류가 발생했습니다.
          </div>
        ) : postsData?.content?.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              북마크한 게시글이 없습니다.
            </div>
            <Button variant="primary" onClick={() => navigate('/boards')}>
              게시판으로 이동하기
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {postsData?.content.map((post: Post) => (
              <Card key={post.id} className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center mb-1">
                      <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-0.5 rounded text-xs">
                        {post.category.name}
                      </span>
                      <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                    
                    <Link to={`/posts/${post.id}`} className="block">
                      <h2 className="text-xl font-semibold hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        {post.title}
                      </h2>
                    </Link>
                    
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {truncateText(post.content, 150)}
                    </div>
                    
                    <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center mr-4">
                        <span className="font-medium">{post.author.nickname}</span>
                      </div>
                      <div className="flex items-center mr-4">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        {post.commentCount}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/posts/${post.id}`)}
                    >
                      읽기
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveBookmark(post.id)}
                      className="text-yellow-500 border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    >
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                      북마크 제거
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {postsData?.totalPages && postsData.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={postsData.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default MyBookmarksPage;