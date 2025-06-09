import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Spinner from '../../components/ui/Spinner';

// 이 컴포넌트에서 사용할 가상의 관리자 API 서비스 (실제 백엔드 구현 시 대체)
const adminService = {
  // 사이트 통계 데이터 조회 (실제 API 호출로 대체 필요)
  getSiteStats: async () => {
    // 실제 구현에서는 API 호출
    // 현재는 가상의 데이터 반환
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            totalUsers: 256,
            totalPosts: 1254,
            totalComments: 3871,
            newUsersToday: 12,
            newPostsToday: 54,
            newCommentsToday: 127,
            activeUsers: 87,
            popularCategories: [
              { id: 1, name: '자유게시판', postCount: 423 },
              { id: 2, name: '질문게시판', postCount: 321 },
              { id: 3, name: '정보게시판', postCount: 289 },
              { id: 4, name: '공지사항', postCount: 122 },
              { id: 5, name: '토론게시판', postCount: 99 },
            ],
            recentActivity: [
              { type: 'post', nickname: 'user123', action: '새 게시글 작성', timestamp: '2025-05-12T10:30:00Z' },
              { type: 'comment', nickname: 'john_doe', action: '댓글 작성', timestamp: '2025-05-12T10:15:00Z' },
              { type: 'user', nickname: 'new_user', action: '회원가입', timestamp: '2025-05-12T09:45:00Z' },
              { type: 'post', nickname: 'admin', action: '공지사항 작성', timestamp: '2025-05-12T09:30:00Z' },
              { type: 'comment', nickname: 'jane_smith', action: '댓글 작성', timestamp: '2025-05-12T09:15:00Z' },
            ],
          }
        });
      }, 800); // 서버 응답 시간을 시뮬레이션하기 위한 지연
    });
  }
};

const SiteStats: React.FC = () => {
  // 사이트 통계 데이터 조회
  const {
    data: statsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin', 'siteStats'],
    queryFn: () => adminService.getSiteStats(),
    refetchInterval: 60000, // 1분마다 자동 갱신
  });

  // 타임스탬프 포맷팅 함수
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
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
        통계 데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  const stats = statsData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">사이트 통계</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
          })}
        </div>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="총 사용자" 
          value={stats.totalUsers} 
          newToday={stats.newUsersToday}
          icon={
            <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
        />
        <StatCard 
          title="총 게시글" 
          value={stats.totalPosts} 
          newToday={stats.newPostsToday}
          icon={
            <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
        <StatCard 
          title="총 댓글" 
          value={stats.totalComments} 
          newToday={stats.newCommentsToday}
          icon={
            <svg className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          }
        />
      </div>

      {/* 추가 정보 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* 인기 카테고리 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-4">인기 카테고리</h3>
          <div className="space-y-4">
            {stats.popularCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
                <div className="flex items-center">
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-32 sm:w-40 md:w-64">
                    <div 
                      className="absolute h-2 bg-primary-500 rounded-full" 
                      style={{ width: `${(category.postCount / stats.popularCategories[0].postCount) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">{category.postCount}개</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-4">최근 활동</h3>
          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="mr-4">
                  {activity.type === 'post' && (
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  )}
                  {activity.type === 'comment' && (
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                  )}
                  {activity.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{activity.nickname}</span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{activity.action}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimestamp(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 활성 사용자 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">현재 활성 사용자</h3>
          <span className="text-primary-600 dark:text-primary-400 font-semibold">{stats.activeUsers}명</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div 
            className="h-2 bg-primary-500 rounded-full" 
            style={{ width: `${(stats.activeUsers / stats.totalUsers) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          전체 사용자 중 {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%가 최근 30분 내에 활동했습니다.
        </div>
      </div>
    </div>
  );
};

// 통계 카드 컴포넌트
interface StatCardProps {
  title: string;
  value: number;
  newToday: number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, newToday, icon }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value.toLocaleString()}</p>
        </div>
        <div>{icon}</div>
      </div>
      <div className="mt-4 flex items-center">
        <div className="flex items-center text-green-600 dark:text-green-400">
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          <span>+{newToday.toLocaleString()}</span>
        </div>
        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">오늘</span>
      </div>
    </div>
  );
};

export default SiteStats;