
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { challengeService } from '../../services/challengeService';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import type { Challenge } from '../../types/models';

const ChallengesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const PAGE_SIZE = 12;

  // 전체 챌린지 목록 조회
  const {
    data: challengesData,
    isLoading: isChallengesLoading,
  } = useQuery({
    queryKey: ['challenges', currentPage, selectedCategory, selectedStatus],
    queryFn: () => challengeService.getChallenges(
      currentPage, 
      PAGE_SIZE, 
      selectedCategory || undefined,
      selectedStatus || undefined
    ),
    enabled: activeTab === 'all',
  });

  // 내 챌린지 목록 조회
  const {
    data: myChallengesData,
    isLoading: isMyChallengesLoading,
  } = useQuery({
    queryKey: ['myChallenges', currentPage],
    queryFn: () => challengeService.getMyChallenges(currentPage, PAGE_SIZE),
    enabled: activeTab === 'my' && isAuthenticated,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab: 'all' | 'my') => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECRUITING': return 'text-blue-600 bg-blue-100';
      case 'IN_PROGRESS': return 'text-green-600 bg-green-100';
      case 'COMPLETED': return 'text-gray-600 bg-gray-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RECRUITING': return '모집중';
      case 'IN_PROGRESS': return '진행중';
      case 'COMPLETED': return '완료';
      case 'CANCELLED': return '취소됨';
      default: return status;
    }
  };

  const renderChallengeCard = (challenge: Challenge) => (
    <Card 
      key={challenge.id} 
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/challenges/${challenge.id}`)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">
            {challenge.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {challenge.description}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(challenge.status)}`}>
          {getStatusText(challenge.status)}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>카테고리:</span>
          <span className="font-medium">{challenge.category}</span>
        </div>
        <div className="flex justify-between">
          <span>베팅 금액:</span>
          <span className="font-medium text-primary-600">
            {challenge.betAmount.toLocaleString()}원
          </span>
        </div>
        <div className="flex justify-between">
          <span>총 상금:</span>
          <span className="font-medium text-green-600">
            {challenge.totalPot.toLocaleString()}원
          </span>
        </div>
        <div className="flex justify-between">
          <span>참가자:</span>
          <span className="font-medium">
            {challenge.participants.length}/{challenge.maxParticipants}명
          </span>
        </div>
        <div className="flex justify-between">
          <span>기간:</span>
          <span className="font-medium">
            {new Date(challenge.startDate).toLocaleDateString()} ~ 
            {new Date(challenge.endDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {challenge.creator.nickname.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-600">{challenge.creator.nickname}</span>
          </div>
          {challenge.successRate > 0 && (
            <span className="text-sm text-green-600 font-medium">
              성공률 {challenge.successRate}%
            </span>
          )}
        </div>
      </div>
    </Card>
  );

  const currentData = activeTab === 'all' ? challengesData : myChallengesData;
  const isLoading = activeTab === 'all' ? isChallengesLoading : isMyChallengesLoading;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">PlanBet 챌린지</h1>
        {isAuthenticated && (
          <Button onClick={() => navigate('/challenges/create')}>
            챌린지 만들기
          </Button>
        )}
      </div>

      {/* 탭 메뉴 */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'all'
              ? 'bg-white dark:bg-gray-700 shadow-sm'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          onClick={() => handleTabChange('all')}
        >
          전체 챌린지
        </button>
        {isAuthenticated && (
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'my'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleTabChange('my')}
          >
            내 챌린지
          </button>
        )}
      </div>

      {/* 필터 (전체 챌린지에서만 표시) */}
      {activeTab === 'all' && (
        <div className="flex flex-wrap gap-4 mb-6">
          <Select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(0);
            }}
            className="min-w-[150px]"
          >
            <option value="">전체 카테고리</option>
            <option value="운동">운동</option>
            <option value="학습">학습</option>
            <option value="취미">취미</option>
            <option value="업무">업무</option>
            <option value="기타">기타</option>
          </Select>

          <Select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(0);
            }}
            className="min-w-[150px]"
          >
            <option value="">전체 상태</option>
            <option value="RECRUITING">모집중</option>
            <option value="IN_PROGRESS">진행중</option>
            <option value="COMPLETED">완료</option>
          </Select>
        </div>
      )}

      {/* 챌린지 목록 */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <>
          {currentData?.content.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {activeTab === 'all' ? '진행중인 챌린지가 없습니다.' : '참여중인 챌린지가 없습니다.'}
              </p>
              {isAuthenticated && (
                <Button onClick={() => navigate('/challenges/create')}>
                  첫 번째 챌린지 만들기
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentData?.content.map(renderChallengeCard)}
            </div>
          )}

          {/* 페이지네이션 */}
          {currentData && currentData.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentData.number}
                totalPages={currentData.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChallengesPage;
