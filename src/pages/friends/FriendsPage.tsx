
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { friendService } from '../../services/friendService';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import type { Friend, FriendRequest } from '../../types/models';

const FriendsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'friends' | 'received' | 'sent'>('friends');
  const [currentPage, setCurrentPage] = useState(0);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [friendMessage, setFriendMessage] = useState('');
  const PAGE_SIZE = 10;

  // 친구 목록 조회
  const {
    data: friendsData,
    isLoading: isFriendsLoading,
  } = useQuery({
    queryKey: ['friends', currentPage],
    queryFn: () => friendService.getFriends(currentPage, PAGE_SIZE),
    enabled: activeTab === 'friends',
  });

  // 받은 친구 요청 조회
  const {
    data: receivedRequestsData,
    isLoading: isReceivedLoading,
  } = useQuery({
    queryKey: ['friendRequests', 'received', currentPage],
    queryFn: () => friendService.getReceivedRequests(currentPage, PAGE_SIZE),
    enabled: activeTab === 'received',
  });

  // 보낸 친구 요청 조회
  const {
    data: sentRequestsData,
    isLoading: isSentLoading,
  } = useQuery({
    queryKey: ['friendRequests', 'sent', currentPage],
    queryFn: () => friendService.getSentRequests(currentPage, PAGE_SIZE),
    enabled: activeTab === 'sent',
  });

  // 친구 요청 보내기
  const { mutate: sendFriendRequest, isPending: isSending } = useMutation({
    mutationFn: (request: FriendRequest) => friendService.sendFriendRequest(request),
    onSuccess: () => {
      toast.success('친구 요청을 보냈습니다.');
      setFriendEmail('');
      setFriendMessage('');
      setShowAddFriend(false);
      queryClient.invalidateQueries({ queryKey: ['friendRequests', 'sent'] });
    },
    onError: () => {
      toast.error('친구 요청 전송에 실패했습니다.');
    },
  });

  // 친구 요청 수락
  const { mutate: acceptRequest } = useMutation({
    mutationFn: (requestId: number) => friendService.acceptFriendRequest(requestId),
    onSuccess: () => {
      toast.success('친구 요청을 수락했습니다.');
      queryClient.invalidateQueries({ queryKey: ['friendRequests', 'received'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: () => {
      toast.error('친구 요청 수락에 실패했습니다.');
    },
  });

  // 친구 요청 거절
  const { mutate: rejectRequest } = useMutation({
    mutationFn: (requestId: number) => friendService.rejectFriendRequest(requestId),
    onSuccess: () => {
      toast.success('친구 요청을 거절했습니다.');
      queryClient.invalidateQueries({ queryKey: ['friendRequests', 'received'] });
    },
    onError: () => {
      toast.error('친구 요청 거절에 실패했습니다.');
    },
  });

  // 친구 삭제
  const { mutate: removeFriend } = useMutation({
    mutationFn: (friendId: number) => friendService.removeFriend(friendId),
    onSuccess: () => {
      toast.success('친구를 삭제했습니다.');
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: () => {
      toast.error('친구 삭제에 실패했습니다.');
    },
  });

  const handleSendFriendRequest = () => {
    if (!friendEmail.trim()) {
      toast.error('이메일을 입력해주세요.');
      return;
    }

    sendFriendRequest({
      email: friendEmail.trim(),
      message: friendMessage.trim() || undefined,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderFriendsList = () => {
    if (isFriendsLoading) return <Spinner />;

    const friends = friendsData?.content || [];

    if (friends.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          아직 친구가 없습니다. 친구를 추가해보세요!
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {friends.map((friendship: Friend) => {
          const friend = friendship.requester.id === user?.id 
            ? friendship.addressee 
            : friendship.requester;
          
          return (
            <Card key={friendship.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {friend.nickname.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{friend.nickname}</h3>
                    <p className="text-sm text-gray-500">{friend.email}</p>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeFriend(friendship.id)}
                >
                  삭제
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderReceivedRequests = () => {
    if (isReceivedLoading) return <Spinner />;

    const requests = receivedRequestsData?.content || [];

    if (requests.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          받은 친구 요청이 없습니다.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {requests.map((request: Friend) => (
          <Card key={request.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {request.requester.nickname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold">{request.requester.nickname}</h3>
                  <p className="text-sm text-gray-500">{request.requester.email}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => acceptRequest(request.id)}
                >
                  수락
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => rejectRequest(request.id)}
                >
                  거절
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderSentRequests = () => {
    if (isSentLoading) return <Spinner />;

    const requests = sentRequestsData?.content || [];

    if (requests.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          보낸 친구 요청이 없습니다.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {requests.map((request: Friend) => (
          <Card key={request.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {request.addressee.nickname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold">{request.addressee.nickname}</h3>
                  <p className="text-sm text-gray-500">{request.addressee.email}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(request.createdAt).toLocaleDateString()} • 
                    <span className="ml-1 text-yellow-600">대기중</span>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const getCurrentData = () => {
    if (activeTab === 'friends') return friendsData;
    if (activeTab === 'received') return receivedRequestsData;
    if (activeTab === 'sent') return sentRequestsData;
    return null;
  };

  const currentData = getCurrentData();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">친구 관리</h1>
        <Button onClick={() => setShowAddFriend(true)}>
          친구 추가
        </Button>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'friends'
              ? 'bg-white dark:bg-gray-700 shadow-sm'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          onClick={() => {
            setActiveTab('friends');
            setCurrentPage(0);
          }}
        >
          친구 목록
        </button>
        <button
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'received'
              ? 'bg-white dark:bg-gray-700 shadow-sm'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          onClick={() => {
            setActiveTab('received');
            setCurrentPage(0);
          }}
        >
          받은 요청
        </button>
        <button
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'sent'
              ? 'bg-white dark:bg-gray-700 shadow-sm'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          onClick={() => {
            setActiveTab('sent');
            setCurrentPage(0);
          }}
        >
          보낸 요청
        </button>
      </div>

      {/* 친구 추가 모달 */}
      {showAddFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">친구 추가</h2>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="친구 이메일"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
              />
              <Input
                placeholder="메시지 (선택사항)"
                value={friendMessage}
                onChange={(e) => setFriendMessage(e.target.value)}
              />
              <div className="flex space-x-2">
                <Button
                  onClick={handleSendFriendRequest}
                  isLoading={isSending}
                  fullWidth
                >
                  요청 보내기
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddFriend(false);
                    setFriendEmail('');
                    setFriendMessage('');
                  }}
                  fullWidth
                >
                  취소
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 컨텐츠 */}
      <div className="mb-6">
        {activeTab === 'friends' && renderFriendsList()}
        {activeTab === 'received' && renderReceivedRequests()}
        {activeTab === 'sent' && renderSentRequests()}
      </div>

      {/* 페이지네이션 */}
      {currentData && currentData.totalPages > 1 && (
        <Pagination
          currentPage={currentData.number}
          totalPages={currentData.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default FriendsPage;
