import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CreatePostRequest, Category } from '../../types/models';
import postService from '../../services/postService';
import categoryService from '../../services/categoryService';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Select, { type SelectOption } from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';

// 게시글 작성 폼 유효성 검사 스키마
const postSchema = z.object({
  title: z.string().min(2, '제목은 최소 2자 이상이어야 합니다.').max(100, '제목은 최대 100자까지 입력할 수 있습니다.'),
  content: z.string().min(10, '내용은 최소 10자 이상이어야 합니다.'),
  categoryId: z.string().min(1, '카테고리를 선택해주세요.'),
});

// 게시글 작성 폼 타입
type PostFormValues = z.infer<typeof postSchema>;

const PostCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  // React Hook Form 초기화
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      categoryId: '',
    },
  });

  // 현재 폼 값 감시
  const watchedValues = {
    title: watch('title'),
    content: watch('content'),
  };

  // 카테고리 목록 조회
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  // 게시글 작성 뮤테이션
  const { mutate: createPost } = useMutation({
    mutationFn: (data: CreatePostRequest) => postService.createPost(data),
    onSuccess: (response) => {
      toast.success('게시글이 작성되었습니다.');
      navigate(`/posts/${response.id}`);
    },
    onError: () => {
      toast.error('게시글 작성에 실패했습니다.');
    },
  });

  // 게시글 작성 제출 핸들러
  const onSubmit = (data: PostFormValues) => {
    const postData: CreatePostRequest = {
      title: data.title,
      content: data.content,
      categoryId: parseInt(data.categoryId),
    };

    createPost(postData);
  };

  // 카테고리 옵션 생성
  const categoryOptions: SelectOption[] = categoriesData
    ? [
        { value: '', label: '카테고리 선택' },
        ...categoriesData.map((category: Category) => ({
          value: category.id.toString(),
          label: category.name,
        })),
      ]
    : [{ value: '', label: '카테고리 선택' }];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">게시글 작성</h1>

      <Card>
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              className={`px-4 py-2 ${
                !previewMode
                  ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => setPreviewMode(false)}
            >
              작성
            </button>
            <button
              className={`px-4 py-2 ${
                previewMode
                  ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => setPreviewMode(true)}
            >
              미리보기
            </button>
          </div>
        </div>

        {previewMode ? (
          <div className="prose dark:prose-invert max-w-none">
            <h1>{watchedValues.title || '제목 없음'}</h1>
            <div className="whitespace-pre-wrap">{watchedValues.content || '내용 없음'}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <Input
                label="제목"
                placeholder="제목을 입력하세요"
                {...register('title')}
                error={errors.title?.message}
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  카테고리
                </label>
                {isCategoriesLoading ? (
                  <div className="flex items-center">
                    <Spinner size="sm" />
                    <span className="ml-2">카테고리 로딩 중...</span>
                  </div>
                ) : categoriesError ? (
                  <div className="text-red-500">카테고리를 불러오는 중 오류가 발생했습니다.</div>
                ) : (
                  <select
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    {...register('categoryId')}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                {errors.categoryId && (
                  <p className="mt-1 text-xs text-red-500">{errors.categoryId.message}</p>
                )}
              </div>

              <TextArea
                label="내용"
                placeholder="내용을 입력하세요 (마크다운 형식을 지원합니다)"
                rows={15}
                {...register('content')}
                error={errors.content?.message}
              />

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                >
                  게시글 등록
                </Button>
              </div>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default PostCreatePage;