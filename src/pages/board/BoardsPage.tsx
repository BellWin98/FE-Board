import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Post, Category } from '../../types/models';
import postService from '../../services/postService';
import categoryService from '../../services/categoryService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../contexts/AuthContext';

const BoardsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL 쿼리 파라미터 가져오기
  const initialPage = parseInt(searchParams.get('page') || '0');
  const initialCategory = searchParams.get('category') ? parseInt(searchParams.get('category') || '0') : null;
  const initialSort = (searchParams.get('sort') || 'newest') as 'newest' | 'popular';
  const initialSearch = searchParams.get('search') || '';
  
  // 상태 초기화
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(initialCategory);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>(initialSort);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [searchInput, setSearchInput] = useState<string>(initialSearch);
  
  const PAGE_SIZE = 10;
  
  // URL 업데이트 함수
  useEffect(() => {
    const params: { [key: string]: string } = {
      page: currentPage.toString(),
    };
    
    if (selectedCategory !== null) {
      params.category = selectedCategory.toString();
    }
    
    if (sortBy !== 'newest') {
      params.sort = sortBy;
    }
    
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    setSearchParams(params);
  }, [currentPage, selectedCategory, sortBy, searchTerm]);

  // 게시글 목록 조회
  const {
    data: postsData,
    isLoading: isPostsLoading,
    error: postsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ['posts', currentPage, selectedCategory, sortBy, searchTerm],
    queryFn: () =>
      postService.getPosts({
        page: currentPage,
        size: PAGE_SIZE,
        categoryId: selectedCategory ?? undefined,
        sort: sortBy,
        search: searchTerm || undefined,
      }),
    keepPreviousData: true,
  });

  // 카테고리 목록 조회
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(0);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">게시판</h1>
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

      {/* 필터 및 검색 영역 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                selectedCategory === null
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
              onClick={() => handleCategoryChange(null)}
            >
              전체
            </button>
            {isCategoriesLoading ? (
              <Spinner size="sm" />
            ) : (
              categoriesData?.data.map((category: Category) => (
                <button
                  key={category.id}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </button>
              ))
            )}
          </div>

          <div className="flex-grow"></div>

          {/* 정렬 및 검색 */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="w-40">
              <Select
                options={[
                  { value: 'newest', label: '최신순' },
                  { value: 'popular', label: '인기순' },
                ]}
                value={sortBy}
                onChange={handleSortChange}
              />
            </div>
            <form onSubmit={handleSearchSubmit} className="flex">
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
        ) : postsData?.data?.content?.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            게시글이 없습니다.
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
                      카테고리
                    </th>
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
                  {postsData?.data?.content.map((post: Post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                      onClick={() => navigate(`/posts/${post.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded text-xs">
                          {post.category.name}
                        </span>
                      </td>
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
                          {post.author.username}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(post.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {post.views}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {postsData?.data?.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={postsData.data.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BoardsPage;