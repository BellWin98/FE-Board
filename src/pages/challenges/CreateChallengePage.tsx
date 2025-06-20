
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { challengeService } from '../../services/challengeService';
import { friendService } from '../../services/friendService';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import type { CreateChallengeRequest, Friend } from '../../types/models';

const CreateChallengePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreateChallengeRequest>({
    title: '',
    description: '',
    category: '',
    goalAmount: 0,
    betAmount: 0,
    startDate: '',
    endDate: '',
    verificationMethod: 'MUTUAL',
    maxParticipants: 10,
    invitedFriends: [],
  });

  // 친구 목록 조회
  const { data: friendsData } = useQuery({
    queryKey: ['friends'],
    queryFn: () => friendService.getFriends(0, 100),
  });

  // 챌린지 생성 뮤테이션
  const { mutate: createChallenge, isPending } = useMutation({
    mutationFn: (challengeData: CreateChallengeRequest) => 
      challengeService.createChallenge(challengeData),
    onSuccess: (challenge) => {
      toast.success('챌린지가 생성되었습니다!');
      navigate(`/challenges/${challenge.id}`);
    },
    onError: () => {
      toast.error('챌린지 생성에 실패했습니다.');
    },
  });

  const handleInputChange = (field: keyof CreateChallengeRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFriendToggle = (friendId: number) => {
    setFormData(prev => ({
      ...prev,
      invitedFriends: prev.invitedFriends.includes(friendId)
        ? prev.invitedFriends.filter(id => id !== friendId)
        : [...prev.invitedFriends, friendId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.title.trim()) {
      toast.error('챌린지 제목을 입력해주세요.');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('챌린지 설명을 입력해주세요.');
      return;
    }
    if (!formData.category) {
      toast.error('카테고리를 선택해주세요.');
      return;
    }
    if (formData.goalAmount <= 0) {
      toast.error('목표 금액을 입력해주세요.');
      return;
    }
    if (formData.betAmount <= 0) {
      toast.error('베팅 금액을 입력해주세요.');
      return;
    }
    if (!formData.startDate) {
      toast.error('시작 날짜를 입력해주세요.');
      return;
    }
    if (!formData.endDate) {
      toast.error('종료 날짜를 입력해주세요.');
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('종료 날짜는 시작 날짜보다 늦어야 합니다.');
      return;
    }

    createChallenge(formData);
  };

  const friends = friendsData?.content || [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">새 챌린지 만들기</h1>
        <p className="text-gray-600">친구들과 함께 목표를 달성해보세요!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본 정보 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                챌린지 제목 *
              </label>
              <Input
                placeholder="예: 30일 동안 매일 운동하기"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                챌린지 설명 *
              </label>
              <TextArea
                placeholder="챌린지에 대한 자세한 설명을 입력해주세요..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                카테고리 *
              </label>
              <Select
                options={[
                  { value: '', label: '카테고리 선택' },
                  { value: '운동', label: '운동' },
                  { value: '학습', label: '학습' },
                  { value: '취미', label: '취미' },
                  { value: '업무', label: '업무' },
                  { value: '기타', label: '기타' }
                ]}
                value={formData.category}
                onChange={(value) => handleInputChange('category', value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                검증 방법 *
              </label>
              <Select
                options={[
                  { value: 'MUTUAL', label: '상호 검증' },
                  { value: 'PHOTO', label: '사진 인증' },
                  { value: 'TEXT', label: '텍스트 인증' },
                  { value: 'ADMIN', label: '관리자 검증' }
                ]}
                value={formData.verificationMethod}
                onChange={(value) => handleInputChange('verificationMethod', value)}
                required
              />
            </div>
          </div>
        </Card>

        {/* 베팅 정보 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">베팅 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                목표 금액 (원) *
              </label>
              <Input
                type="number"
                placeholder="100000"
                value={formData.goalAmount || ''}
                onChange={(e) => handleInputChange('goalAmount', parseInt(e.target.value) || 0)}
                min="1000"
                step="1000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                개인 베팅 금액 (원) *
              </label>
              <Input
                type="number"
                placeholder="10000"
                value={formData.betAmount || ''}
                onChange={(e) => handleInputChange('betAmount', parseInt(e.target.value) || 0)}
                min="1000"
                step="1000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                최대 참가자 수 *
              </label>
              <Input
                type="number"
                placeholder="10"
                value={formData.maxParticipants || ''}
                onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value) || 10)}
                min="2"
                max="50"
                required
              />
            </div>
          </div>
        </Card>

        {/* 일정 정보 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">일정 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                시작 날짜 *
              </label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                종료 날짜 *
              </label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
        </Card>

        {/* 친구 초대 */}
        {friends.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">친구 초대 (선택사항)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friendship: Friend) => {
                const friend = friendship.requester.id === user?.id 
                  ? friendship.addressee 
                  : friendship.requester;
                const isSelected = formData.invitedFriends.includes(friend.id);
                
                return (
                  <div
                    key={friend.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleFriendToggle(friend.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {friend.nickname.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{friend.nickname}</p>
                        <p className="text-xs text-gray-500">{friend.email}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {formData.invitedFriends.length > 0 && (
              <p className="mt-4 text-sm text-gray-600">
                {formData.invitedFriends.length}명의 친구를 초대합니다.
              </p>
            )}
          </Card>
        )}

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/challenges')}
          >
            취소
          </Button>
          <Button
            type="submit"
            isLoading={isPending}
          >
            챌린지 생성하기
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateChallengePage;
