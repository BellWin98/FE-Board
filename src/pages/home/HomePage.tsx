import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Post, Category } from '../../types/models';
import postService from '../../services/postService';
import categoryService from '../../services/categoryService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const HomePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // 최신 게시글 조회
  const {
    data: latestPostsData,
    isLoading: isLatestPostsLoading,
    error: latestPostsError,
  } = useQuery({
    queryKey: ['latestPosts', selectedCategory],
    queryFn: () =>
      postService.getPosts({
        page: 0,
        size: 5,
        categoryId: selectedCategory ?? undefined,
        sort: 'newest',
      }),
    select: (data) => data.content,  // 중첩 구조에서 필요한 부분만 추출
  });

  console.log(latestPostsData);

  // 인기 게시글 조회
  const {
    data: popularPostsData,
    isLoading: isPopularPostsLoading,
    error: popularPostsError,
  } = useQuery({
    queryKey: ['popularPosts', selectedCategory],
    queryFn: () =>
      postService.getPosts({
        page: 0,
        size: 5,
        categoryId: selectedCategory ?? undefined,
        sort: 'popular',
      }),
    select: (data) => data.content,
  });

  // 카테고리 목록 조회
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  // 게시글 포맷팅 유틸리티 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // 게시글 목록 렌더링 함수
  const renderPostList = (posts: Post[] | undefined, isLoading: boolean, error: unknown) => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8 text-red-500">
          게시글을 불러오는 중 오류가 발생했습니다.
        </div>
      );
    }

    if (!posts || posts.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          게시글이 없습니다.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/posts/${post.id}`}
            className="block transition-transform hover:translate-x-1 hover:translate-y-1 duration-200"
          >
            <Card hover>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">{post.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-0.5 rounded text-xs">
                      카테고리 이름
                    </span>
                    <span className="mx-2">•</span>
                    <span>{post.authorId}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
              </div>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">게시판에 오신 것을 환영합니다</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">다양한 주제의 게시글을 읽고 의견을 나눠보세요.</p>
        <div className="flex justify-center">
          <Link to="/boards">
            <Button variant="primary" size="lg">
              게시판 둘러보기
            </Button>
          </Link>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            selectedCategory === null
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}
          onClick={() => setSelectedCategory(null)}
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
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))
        )}
      </div>

      {/* 최신 게시물 및 인기 게시물 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 최신 게시물 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">최신 게시물</h2>
            <Link to="/boards" className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
              더보기
            </Link>
          </div>
          {renderPostList(latestPostsData, isLatestPostsLoading, latestPostsError)}
        </div>

        {/* 인기 게시물 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">인기 게시물</h2>
            <Link to="/boards?sort=popular" className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
              더보기
            </Link>
          </div>
          {renderPostList(popularPostsData, isPopularPostsLoading, popularPostsError)}
        </div>
      </div>
    </div>
  );
};

export default HomePage;