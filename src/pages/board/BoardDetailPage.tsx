import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Post, Category, PageResponse } from '../../types/models';
import postService from '../../services/postService';
import categoryService from '../../services/categoryService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';

const BoardDetailPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL 쿼리 파라미터 가져오기
  const initialPage = parseInt(searchParams.get('page') || '0');
  const initialSort = (searchParams.get('sort') || 'newest') as 'newest' | 'popular';
  const initialSearch = searchParams.get('search') || '';
  
  // 상태 초기화
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>(initialSort);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [searchInput, setSearchInput] = useState<string>(initialSearch);
  
  const PAGE_SIZE = 10;
  
  // URL 업데이트 함수
  useEffect(() => {
    const params: { [key: string]: string } = {
      page: currentPage.toString(),
    };
    
    if (sortBy !== 'newest') {
      params.sort = sortBy;
    }
    
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    setSearchParams(params);
  }, [currentPage, sortBy, searchTerm]);

  // 카테고리 정보 조회
  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    error: categoryError,
  } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => categoryService.getCategory(Number(categoryId)),
    enabled: !!categoryId,
  });

  // 게시글 목록 조회
  const {
    data: postsData,
    isLoading: isPostsLoading,
    error: postsError,
  } = useQuery<PageResponse<Post>>({
    queryKey: ['posts', categoryId, currentPage, sortBy, searchTerm],
    queryFn: () =>
      postService.getPosts({
        page: currentPage,
        size: PAGE_SIZE,
        categoryId: Number(categoryId),
        sort: sortBy,
        search: searchTerm || undefined,
      }),
    placeholderData: (previousData) => previousData,
    enabled: !!categoryId,
  });

  // 카테고리별 게시글 수 조회
  const {
    data: postCountData,
    isLoading: isPostCountLoading,
  } = useQuery({
    queryKey: ['category-post-count', categoryId],
    queryFn: () => categoryService.getCategoryPostCount(Number(categoryId)),
    enabled: !!categoryId,
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

  // 검색 제출 핸들러
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(0);
  };

  // 게시글 작성 버튼 클릭 핸들러
  const handleWritePost = () => {
    if (isAuthenticated) {
      navigate('/post/create');
    } else {
      navigate('/login', { state: { from: { pathname: '/post/create' } } });
    }
  };

  // 날짜 포매팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // 카테고리 로딩 중이거나 에러 발생 시 처리
  if (isCategoryLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (categoryError) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
          카테고리를 불러오는 중 오류가 발생했습니다.
        </h2>
        <Button variant="primary" onClick={() => navigate('/boards')}>
          게시판으로 돌아가기
        </Button>
      </div>
    );
  }

  const category = categoryData;

  return (
    <div className="space-y-6">
      {/* 카테고리 헤더 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{category?.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{category?.description}</p>
            {!isPostCountLoading && postCountData && (
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                총 게시글 수: {postCountData.count}개
              </div>
            )}
          </div>
          <Button variant="primary" onClick={handleWritePost}>
            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            게시글 작성
          </Button>
        </div>
      </div>

      {/* 정렬 및 검색 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
          <div>
            <Select
              options={[
                { value: 'newest', label: '최신순' },
                { value: 'popular', label: '인기순' },
              ]}
              value={sortBy}
              onChange={handleSortChange}
              className="w-40"
            />
          </div>
          <form onSubmit={handleSearchSubmit} className="flex w-full sm:w-auto">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="검색어를 입력하세요"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pr-10"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 게시글 목록 */}
      <div>
        {isPostsLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : postsError ? (
          <div className="text-center py-10 text-red-500">
            게시글을 불러오는 중 오류가 발생했습니다.
          </div>
        ) : postsData?.content?.length === 0 ? (
          <div className="text-center py-16">
            <Card className="py-8">
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-4">게시글이 없습니다</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">이 카테고리에 첫 게시글을 작성해보세요!</p>
              <Button variant="primary" onClick={handleWritePost}>
                게시글 작성하기
              </Button>
            </Card>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      제목
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      작성자
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      작성일
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      조회
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {postsData?.content.map((post: Post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                      onClick={() => navigate(`/posts/${post.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                            {post.title}
                          </div>
                          {post.commentCount > 0 && (
                            <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
                              {post.commentCount}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {post.author.nickname}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(post.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {post.viewCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {postsData?.totalPages && postsData.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={postsData.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BoardDetailPage;