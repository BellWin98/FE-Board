
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { challengeService } from '../../services/challengeService';
import type { JoinChallengeRequest } from '../../types/models';

const ChallengeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [betAmount, setBetAmount] = useState<number>(0);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);

  // 챌린지 상세 조회
  const {
    data: challenge,
    isLoading,
    error
  } = useQuery({
    queryKey: ['challenge', id],
    queryFn: () => challengeService.getChallenge(Number(id)),
    enabled: !!id,
  });

  // 챌린지 참가 뮤테이션
  const { mutate: joinChallenge, isPending: isJoining } = useMutation({
    mutationFn: (request: JoinChallengeRequest) => 
      challengeService.joinChallenge(request),
    onSuccess: () => {
      toast.success('챌린지에 참가했습니다!');
      setShowJoinModal(false);
      queryClient.invalidateQueries({ queryKey: ['challenge', id] });
    },
    onError: () => {
      toast.error('챌린지 참가에 실패했습니다.');
    },
  });

  // 챌린지 나가기 뮤테이션
  const { mutate: leaveChallenge, isPending: isLeaving } = useMutation({
    mutationFn: () => challengeService.leaveChallenge(Number(id)),
    onSuccess: () => {
      toast.success('챌린지에서 나갔습니다.');
      queryClient.invalidateQueries({ queryKey: ['challenge', id] });
    },
    onError: () => {
      toast.error('챌린지 나가기에 실패했습니다.');
    },
  });

  const handleJoinChallenge = () => {
    if (!betAmount || betAmount <= 0) {
      toast.error('베팅 금액을 입력해주세요.');
      return;
    }
    
    joinChallenge({
      challengeId: Number(id),
      betAmount: betAmount
    });
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

  const getVerificationMethodText = (method: string) => {
    switch (method) {
      case 'PHOTO': return '사진 인증';
      case 'TEXT': return '텍스트 인증';
      case 'MUTUAL': return '상호 검증';
      case 'ADMIN': return '관리자 검증';
      default: return method;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">챌린지를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">존재하지 않거나 삭제된 챌린지입니다.</p>
          <Button onClick={() => navigate('/challenges')}>
            챌린지 목록으로 돌아가기
          </Button>
        </Card>
      </div>
    );
  }

  const isParticipant = challenge.participants.some(p => p.userId === user?.id);
  const canJoin = challenge.status === 'RECRUITING' && 
                  challenge.participants.length < challenge.maxParticipants && 
                  !isParticipant && 
                  challenge.creatorId !== user?.id;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/challenges')}
          className="mb-4"
        >
          ← 목록으로
        </Button>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(challenge.status)}`}>
          {getStatusText(challenge.status)}
        </span>
      </div>

      {/* 메인 정보 */}
      <Card className="p-8 mb-6">
        <h1 className="text-3xl font-bold mb-4">{challenge.title}</h1>
        <p className="text-gray-600 text-lg mb-6 leading-relaxed">
          {challenge.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium">카테고리</span>
              <span className="text-gray-600">{challenge.category}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium">목표 금액</span>
              <span className="text-primary-600 font-semibold">
                {challenge.goalAmount.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium">베팅 금액</span>
              <span className="text-red-600 font-semibold">
                {challenge.betAmount.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium">총 상금</span>
              <span className="text-green-600 font-semibold">
                {challenge.totalPot.toLocaleString()}원
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium">기간</span>
              <span className="text-gray-600">
                {new Date(challenge.startDate).toLocaleDateString()} ~ 
                {new Date(challenge.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium">검증 방법</span>
              <span className="text-gray-600">
                {getVerificationMethodText(challenge.verificationMethod)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium">참가자</span>
              <span className="text-gray-600">
                {challenge.participants.length}/{challenge.maxParticipants}명
              </span>
            </div>
            {challenge.successRate > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium">성공률</span>
                <span className="text-green-600 font-semibold">
                  {challenge.successRate}%
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 생성자 정보 */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">챌린지 생성자</h3>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
            {challenge.creator.nickname.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{challenge.creator.nickname}</p>
            <p className="text-sm text-gray-500">
              {new Date(challenge.createdAt).toLocaleDateString()} 생성
            </p>
          </div>
        </div>
      </Card>

      {/* 참가자 목록 */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">참가자 목록</h3>
        {challenge.participants.length === 0 ? (
          <p className="text-gray-500 text-center py-4">아직 참가자가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {challenge.participants.map((participant) => (
              <div 
                key={participant.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {participant.user.nickname.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {participant.user.nickname}
                  </p>
                  <p className="text-xs text-gray-500">
                    {participant.betAmount.toLocaleString()}원
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 액션 버튼 */}
      {isAuthenticated && (
        <Card className="p-6">
          {canJoin ? (
            <div className="text-center">
              <Button 
                onClick={() => setShowJoinModal(true)}
                size="lg"
                className="w-full sm:w-auto"
              >
                챌린지 참가하기
              </Button>
            </div>
          ) : isParticipant ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline"
                onClick={() => leaveChallenge()}
                disabled={isLeaving}
                className="w-full sm:w-auto"
              >
                {isLeaving ? '처리중...' : '챌린지 나가기'}
              </Button>
              {(challenge.status === 'IN_PROGRESS' || challenge.status === 'RECRUITING') && (
                <Button 
                  onClick={() => navigate(`/challenges/${challenge.id}/progress`)}
                  className="w-full sm:w-auto"
                >
                  진행상황 보기
                </Button>
              )}
            </div>
          ) : challenge.creatorId === user?.id ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">내가 만든 챌린지입니다.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {(challenge.status === 'IN_PROGRESS' || challenge.status === 'RECRUITING') && (
                  <Button 
                    onClick={() => navigate(`/challenges/${challenge.id}/manage`)}
                    className="w-full sm:w-auto"
                  >
                    챌린지 관리
                  </Button>
                )}
                {challenge.participants.length > 0 && (
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/challenges/${challenge.id}/progress`)}
                    className="w-full sm:w-auto"
                  >
                    진행상황 보기
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500">
                {challenge.status === 'RECRUITING' 
                  ? '정원이 모두 찼습니다.' 
                  : '참가할 수 없는 챌린지입니다.'}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* 참가 모달 */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">챌린지 참가</h3>
            <p className="text-gray-600 mb-4">
              베팅할 금액을 입력해주세요. (최소: {challenge.betAmount.toLocaleString()}원)
            </p>
            <Input
              type="number"
              value={betAmount || ''}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              placeholder={`최소 ${challenge.betAmount.toLocaleString()}원`}
              min={challenge.betAmount}
              className="mb-4"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowJoinModal(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleJoinChallenge}
                disabled={isJoining || betAmount < challenge.betAmount}
                className="flex-1"
              >
                {isJoining ? '참가중...' : '참가하기'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ChallengeDetailPage;