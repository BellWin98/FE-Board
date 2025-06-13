import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '../../types/models';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';

// 가상의 관리자 사용자 관리 API 서비스
const adminUserService = {
  // 사용자 목록 조회
  getUsers: async (page = 0, size = 10, search = '') => {
    // 실제 구현에서는 API 호출
    // 현재는 가상의 데이터 반환
    return new Promise((resolve) => {
      setTimeout(() => {
        // 가상의 사용자 데이터 생성
        const users = Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          email: `user${i + 1}@example.com`,
          nickname: `user${i + 1}`,
          profileImage: null,
          role: i < 5 ? 'ADMIN' : 'USER',
          createdAt: new Date(2025, 0, 1 + i).toISOString(),
          updatedAt: new Date(2025, 0, 1 + i).toISOString(),
        }));
        
        // 검색어가 있으면 필터링
        const filteredUsers = search
          ? users.filter(
              (user) =>
                user.nickname.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase())
            )
          : users;
          
        // 페이지네이션
        const paginatedUsers = filteredUsers.slice(page * size, (page + 1) * size);
        
        resolve({
          data: {
            content: paginatedUsers,
            totalElements: filteredUsers.length,
            totalPages: Math.ceil(filteredUsers.length / size),
            size,
            number: page,
            first: page === 0,
            last: page === Math.ceil(filteredUsers.length / size) - 1,
            empty: paginatedUsers.length === 0,
          },
        });
      }, 800);
    });
  },
  
  // 사용자 역할 변경
  updateUserRole: async (userId: number, role: 'USER' | 'ADMIN') => {
    // 실제 구현에서는 API 호출
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            message: `사용자 ID ${userId}의 역할이 ${role}로 변경되었습니다.`,
          },
        });
      }, 500);
    });
  },
  
  // 사용자 계정 활성화/비활성화
  toggleUserStatus: async (userId: number, active: boolean) => {
    // 실제 구현에서는 API 호출
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            message: `사용자 ID ${userId}의 계정이 ${active ? '활성화' : '비활성화'}되었습니다.`,
          },
        });
      }, 500);
    });
  },
};

const UserManagement = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const PAGE_SIZE = 10;
  
  // 사용자 목록 조회
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin', 'users', currentPage, searchTerm],
    queryFn: () => adminUserService.getUsers(currentPage, PAGE_SIZE, searchTerm),
  });
  
  // 사용자 역할 변경 뮤테이션
  const { mutate: updateUserRole } = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: 'USER' | 'ADMIN' }) =>
      adminUserService.updateUserRole(userId, role),
    onSuccess: () => {
      toast.success('사용자 역할이 변경되었습니다.');
      queryClient.invalidateQueries(['admin', 'users']);
    },
    onError: () => {
      toast.error('사용자 역할 변경에 실패했습니다.');
    },
  });
  
  // 사용자 상태 토글 뮤테이션
  const { mutate: toggleUserStatus } = useMutation({
    mutationFn: ({ userId, active }: { userId: number; active: boolean }) =>
      adminUserService.toggleUserStatus(userId, active),
    onSuccess: (_, variables) => {
      toast.success(`사용자가 ${variables.active ? '활성화' : '비활성화'}되었습니다.`);
      queryClient.invalidateQueries(['admin', 'users']);
    },
    onError: () => {
      toast.error('사용자 상태 변경에 실패했습니다.');
    },
  });
  
  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // 검색 제출 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(0);
  };
  
  // 역할 변경 핸들러
  const handleRoleChange = (userId: number, currentRole: 'USER' | 'ADMIN') => {
    const newRole = currentRole === 'USER' ? 'ADMIN' : 'USER';
    if (window.confirm(`이 사용자의 역할을 ${newRole}로 변경하시겠습니까?`)) {
      updateUserRole({ userId, role: newRole });
    }
  };
  
  // 계정 상태 변경 핸들러
  const handleToggleStatus = (userId: number, active: boolean) => {
    if (window.confirm(`이 사용자의 계정을 ${active ? '비활성화' : '활성화'}하시겠습니까?`)) {
      toggleUserStatus({ userId, active: !active });
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
        사용자 목록을 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }
  
  const users = usersData?.data?.content || [];
  const totalPages = usersData?.data?.totalPages || 0;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">사용자 관리</h2>
        
        {/* 검색 폼 */}
        <form onSubmit={handleSearch} className="flex items-center">
          <Input
            type="text"
            placeholder="사용자명 또는 이메일 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-64"
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
      
      {/* 사용자 목록 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  사용자 정보
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  이메일
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  역할
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  가입일
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
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? '검색 결과가 없습니다.' : '사용자가 없습니다.'}
                  </td>
                </tr>
              ) : (
                users.map((user: User & { active?: boolean }) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profileImage ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.profileImage}
                              alt={user.nickname}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-primary-600 dark:text-primary-300 font-semibold">
                              {user.nickname.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {user.nickname}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {user.role === 'ADMIN' ? '관리자' : '일반 사용자'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleChange(user.id, user.role)}
                        >
                          {user.role === 'USER' ? '관리자로 변경' : '사용자로 변경'}
                        </Button>
                        <Button
                          variant={user.active !== false ? 'danger' : 'success'}
                          size="sm"
                          onClick={() => handleToggleStatus(user.id, user.active !== false)}
                        >
                          {user.active !== false ? '비활성화' : '활성화'}
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

export default UserManagement;