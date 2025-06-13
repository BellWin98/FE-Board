import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Post, Category } from '../../types/models';
import categoryService from '../../services/categoryService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// 가상의 관리자 게시글 관리 API 서비스
const adminPostService = {
  // 게시글 목록 조회
  getPosts: async (page = 0, size = 10, categoryId?: number, search?: string): Promise<{
    data: {
      content: Post[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
      first: boolean;
      last: boolean;
      empty: boolean;
    };
  }> => {
    // 실제 구현에서는 API 호출
    // 현재는 가상의 데이터 반환
    return new Promise((resolve) => {
      setTimeout(() => {
        // 가상의 게시글 데이터 생성
        const posts = Array.from({ length: 100 }, (_, i) => ({
          id: i + 1,
          title: `게시글 제목 ${i + 1}`,
          content: `이것은 게시글 ${i + 1}의 내용입니다. 여기에 게시글 본문이 들어갑니다.`,
          viewCount: Math.floor(Math.random() * 1000),
          categoryId: (i % 5) + 1,
          category: {
            id: (i % 5) + 1,
            name: `카테고리 ${(i % 5) + 1}`,
            description: `카테고리 ${(i % 5) + 1} 설명`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          authorId: (i % 20) + 1,
          author: {
            id: (i % 20) + 1,
            email: `user${(i % 20) + 1}@example.com`,
            nickname: `user${(i % 20) + 1}`,
            profileImage: undefined,
            role: (i % 20 < 2 ? 'ADMIN' : 'USER') as 'ADMIN' | 'USER',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          comments: [],
          commentCount: Math.floor(Math.random() * 20),
          bookmarked: false,
          createdAt: new Date(2025, 4, 12 - (i % 30)).toISOString(),
          updatedAt: new Date(2025, 4, 12 - (i % 30)).toISOString(),
        }));
        
        // 카테고리 필터링
        let filteredPosts = posts;
        if (categoryId) {
          filteredPosts = filteredPosts.filter((post) => post.categoryId === categoryId);
        }
        
        // 검색어 필터링
        if (search) {
          const searchLower = search.toLowerCase();
          filteredPosts = filteredPosts.filter(
            (post) =>
              post.title.toLowerCase().includes(searchLower) ||
              post.content.toLowerCase().includes(searchLower) ||
              post.author.nickname.toLowerCase().includes(searchLower)
          );
        }
        
        // 페이지네이션
        const paginatedPosts = filteredPosts.slice(page * size, (page + 1) * size);
        
        resolve({
          data: {
            content: paginatedPosts,
            totalElements: filteredPosts.length,
            totalPages: Math.ceil(filteredPosts.length / size),
            size,
            number: page,
            first: page === 0,
            last: page === Math.ceil(filteredPosts.length / size) - 1,
            empty: paginatedPosts.length === 0,
          },
        });
      }, 800);
    });
  },
  
  // 게시글 삭제
  deletePost: async (postId: number) => {
    // 실제 구현에서는 API 호출
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            message: `게시글 ID ${postId}가 삭제되었습니다.`,
          },
        });
      }, 500);
    });
  },
  
  // 게시글 가리기/보이기 토글
  togglePostVisibility: async (postId: number, visible: boolean) => {
    // 실제 구현에서는 API 호출
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            message: `게시글 ID ${postId}가 ${visible ? '표시' : '숨김'} 처리되었습니다.`,
          },
        });
      }, 500);
    });
  },
};

const PostManagement = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const PAGE_SIZE = 10;
  
  // 게시글 목록 조회
  const {
    data: postsData,
    isLoading: isPostsLoading,
    error: postsError,
  } = useQuery<{
    data: {
      content: Post[];
      totalElements: number;
      totalPages: number;
    };
  }>({
    queryKey: ['admin', 'posts', currentPage, selectedCategory, searchTerm],
    queryFn: () => adminPostService.getPosts(currentPage, PAGE_SIZE, selectedCategory, searchTerm),
  });
  
  // 카테고리 목록 조회
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });
  
  // 게시글 삭제 뮤테이션
  const { mutate: deletePost } = useMutation({
    mutationFn: (postId: number) => adminPostService.deletePost(postId),
    onSuccess: () => {
      toast.success('게시글이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
    },
    onError: () => {
      toast.error('게시글 삭제에 실패했습니다.');
    },
  });
  
  // 게시글 가시성 토글 뮤테이션
  const { mutate: togglePostVisibility } = useMutation({
    mutationFn: ({ postId, visible }: { postId: number; visible: boolean }) =>
      adminPostService.togglePostVisibility(postId, visible),
    onSuccess: (_, variables) => {
      toast.success(`게시글이 ${variables.visible ? '표시' : '숨김'} 처리되었습니다.`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
    },
    onError: () => {
      toast.error('게시글 상태 변경에 실패했습니다.');
    },
  });
  
  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // 카테고리 변경 핸들러
  const handleCategoryChange = (value: string) => {
    const categoryId = value ? parseInt(value) : undefined;
    setSelectedCategory(categoryId);
    setCurrentPage(0);
  };
  
  // 검색 제출 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(0);
  };
  
  // 게시글 삭제 핸들러
  const handleDeletePost = (postId: number) => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      deletePost(postId);
    }
  };
  
  // 게시글 가시성 토글 핸들러
  const handleToggleVisibility = (postId: number, currentlyVisible: boolean) => {
    togglePostVisibility({ postId, visible: !currentlyVisible });
  };
  
  // 게시글 보기 핸들러
  const handleViewPost = (postId: number) => {
    navigate(`/posts/${postId}`);
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
  
  // 카테고리 옵션 생성
  const categoryOptions = isCategoriesLoading
    ? [{ value: '', label: '카테고리 로딩 중...' }]
    : [
        { value: '', label: '모든 카테고리' },
        ...(categoriesData || []).map((category: Category) => ({
          value: category.id.toString(),
          label: category.name,
        })),
      ];
  
  if (isPostsLoading && currentPage === 0 && !selectedCategory && !searchTerm) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (postsError) {
    return (
      <div className="text-center py-12 text-red-500">
        게시글 목록을 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }
  
  const posts = postsData?.data?.content || [];
  const totalPages = postsData?.data?.totalPages || 0;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">게시글 관리</h2>
      </div>
      
      {/* 필터 및 검색 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-48">
          <Select
            options={categoryOptions}
            value={selectedCategory?.toString() || ''}
            onChange={handleCategoryChange}
            disabled={isCategoriesLoading}
          />
        </div>
        
        <form onSubmit={handleSearch} className="flex flex-grow">
          <Input
            type="text"
            placeholder="제목, 내용 또는 작성자로 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-grow"
          />
          <Button
            type="submit"
            variant="primary"
            className="ml-2"
          >
            검색
          </Button>
        </form>
      </div>
      
      {/* 게시글 목록 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  제목
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  작성자
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  카테고리
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  작성일
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  통계
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm || selectedCategory ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}
                  </td>
                </tr>
              ) : (
                posts.map((post: Post & { hidden?: boolean }) => (
                  <tr key={post.id} className={post.hidden ? 'bg-gray-100 dark:bg-gray-700' : ''}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {truncateText(post.title, 50)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {truncateText(post.content, 70)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {post.author.nickname}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {post.author.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                        {post.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPost(post.id)}
                        >
                          보기
                        </Button>
                        <Button
                          variant={!post.hidden ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => handleToggleVisibility(post.id, !post.hidden)}
                        >
                          {!post.hidden ? '숨기기' : '표시'}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default PostManagement;