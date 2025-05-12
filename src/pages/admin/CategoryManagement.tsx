import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Category } from '../../types/models';
import categoryService from '../../services/categoryService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import { toast } from 'react-toastify';

const CategoryManagement: React.FC = () => {
  const queryClient = useQueryClient();
  
  // 상태 관리
  const [isAddMode, setIsAddMode] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<{ name: string; description: string }>({
    name: '',
    description: '',
  });

  // 카테고리 목록 조회
  const {
    data: categoriesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  // 카테고리 생성 뮤테이션
  const { mutate: createCategory, isLoading: isCreating } = useMutation({
    mutationFn: (categoryData: { name: string; description: string }) =>
      categoryService.createCategory(categoryData),
    onSuccess: () => {
      toast.success('카테고리가 생성되었습니다.');
      queryClient.invalidateQueries(['categories']);
      setIsAddMode(false);
      setNewCategory({ name: '', description: '' });
    },
    onError: () => {
      toast.error('카테고리 생성에 실패했습니다.');
    },
  });

  // 카테고리 수정 뮤테이션
  const { mutate: updateCategory, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; description: string } }) =>
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      toast.success('카테고리가 수정되었습니다.');
      queryClient.invalidateQueries(['categories']);
      setEditingCategory(null);
    },
    onError: () => {
      toast.error('카테고리 수정에 실패했습니다.');
    },
  });

  // 카테고리 삭제 뮤테이션
  const { mutate: deleteCategory, isLoading: isDeleting } = useMutation({
    mutationFn: (id: number) => categoryService.deleteCategory(id),
    onSuccess: () => {
      toast.success('카테고리가 삭제되었습니다.');
      queryClient.invalidateQueries(['categories']);
    },
    onError: () => {
      toast.error('카테고리 삭제에 실패했습니다.');
    },
  });

  // 카테고리 생성 핸들러
  const handleCreateCategory = () => {
    if (!newCategory.name.trim()) {
      toast.error('카테고리 이름을 입력해주세요.');
      return;
    }
    createCategory(newCategory);
  };

  // 카테고리 수정 핸들러
  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    if (!editingCategory.name.trim()) {
      toast.error('카테고리 이름을 입력해주세요.');
      return;
    }
    updateCategory({
      id: editingCategory.id,
      data: {
        name: editingCategory.name,
        description: editingCategory.description,
      },
    });
  };

  // 카테고리 삭제 핸들러
  const handleDeleteCategory = (id: number) => {
    if (window.confirm('정말로 이 카테고리를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      deleteCategory(id);
    }
  };

  // 카테고리 수정 모드 시작 핸들러
  const handleStartEdit = (category: Category) => {
    setEditingCategory({ ...category });
    setIsAddMode(false);
  };

  // 카테고리 수정 입력 변경 핸들러
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingCategory) return;
    const { name, value } = e.target;
    setEditingCategory({
      ...editingCategory,
      [name]: value,
    });
  };

  // 새 카테고리 입력 변경 핸들러
  const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCategory({
      ...newCategory,
      [name]: value,
    });
  };

  // 카테고리 수정 취소 핸들러
  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  // 새 카테고리 추가 취소 핸들러
  const handleCancelAdd = () => {
    setIsAddMode(false);
    setNewCategory({ name: '', description: '' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        카테고리 목록을 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  const categories = categoriesData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">카테고리 관리</h2>
        {!isAddMode && (
          <Button
            variant="primary"
            onClick={() => {
              setIsAddMode(true);
              setEditingCategory(null);
            }}
          >
            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            새 카테고리 추가
          </Button>
        )}
      </div>

      {/* 새 카테고리 추가 폼 */}
      {isAddMode && (
        <Card className="mb-4 p-4 border border-primary-200 dark:border-primary-800">
          <h3 className="text-lg font-semibold mb-4">새 카테고리 추가</h3>
          <div className="space-y-4">
            <Input
              label="카테고리 이름"
              name="name"
              value={newCategory.name}
              onChange={handleNewCategoryChange}
              placeholder="카테고리 이름을 입력하세요"
            />
            <TextArea
              label="카테고리 설명"
              name="description"
              value={newCategory.description}
              onChange={handleNewCategoryChange}
              placeholder="카테고리에 대한 설명을 입력하세요"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancelAdd}>
                취소
              </Button>
              <Button 
                variant="primary" 
                onClick={handleCreateCategory}
                isLoading={isCreating}
              >
                추가
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 카테고리 목록 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                이름
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                설명
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                생성일
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
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  카테고리가 없습니다.
                </td>
              </tr>
            ) : (
              categories.map((category: Category) => (
                <tr key={category.id}>
                  {editingCategory && editingCategory.id === category.id ? (
                    <td colSpan={4} className="px-6 py-4">
                      <div className="space-y-4">
                        <Input
                          label="카테고리 이름"
                          name="name"
                          value={editingCategory.name}
                          onChange={handleEditInputChange}
                        />
                        <TextArea
                          label="카테고리 설명"
                          name="description"
                          value={editingCategory.description}
                          onChange={handleEditInputChange}
                          rows={3}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={handleCancelEdit}>
                            취소
                          </Button>
                          <Button 
                            variant="primary" 
                            onClick={handleUpdateCategory}
                            isLoading={isUpdating}
                          >
                            저장
                          </Button>
                        </div>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {category.description || '(설명 없음)'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartEdit(category)}
                          >
                            수정
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            isLoading={isDeleting}
                          >
                            삭제
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryManagement;