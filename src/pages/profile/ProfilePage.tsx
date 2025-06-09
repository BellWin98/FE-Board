import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useNavigate } from 'react-router-dom';

// 프로필 업데이트 폼 유효성 검사 스키마
const profileSchema = z.object({
  nickname: z
    .string()
    .min(2, '사용자 이름은 최소 2자 이상이어야 합니다.')
    .max(30, '사용자 이름은 최대 30자까지 가능합니다.'),
  // 프로필 이미지는 선택사항
  profileImage: z.string().optional(),
});

// 프로필 업데이트 폼 타입
type ProfileFormValues = z.infer<typeof profileSchema>;

// 비밀번호 변경 폼 유효성 검사 스키마
const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, '현재 비밀번호는 최소 6자 이상이어야 합니다.'),
    newPassword: z.string().min(6, '새 비밀번호는 최소 6자 이상이어야 합니다.'),
    confirmNewPassword: z.string().min(6, '비밀번호 확인은 최소 6자 이상이어야 합니다.'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: '새 비밀번호가 일치하지 않습니다.',
    path: ['confirmNewPassword'],
  });

// 비밀번호 변경 폼 타입
type PasswordFormValues = z.infer<typeof passwordSchema>;

const ProfilePage: React.FC = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'activity'>('profile');

  // 프로필 업데이트 폼 초기화
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    setError: setProfileError,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: user?.nickname || '',
      profileImage: user?.profileImage || '',
    },
  });

  // 비밀번호 변경 폼 초기화
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    setError: setPasswordError,
    reset: resetPassword,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  // 프로필 업데이트 제출 핸들러
  const onSubmitProfile = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setIsProfileLoading(true);
    try {
      const success = await updateUserProfile({
        nickname: data.nickname,
        profileImage: data.profileImage,
      });
      
      if (!success) {
        setProfileError('root', {
          message: '프로필 업데이트에 실패했습니다. 다시 시도해주세요.',
        });
      }
    } catch (error) {
      console.error(error);
      setProfileError('root', {
        message: '프로필 업데이트 중 오류가 발생했습니다.',
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  // 비밀번호 변경 제출 핸들러
  const onSubmitPassword = async () => {
    setIsPasswordLoading(true);
    try {
      // 비밀번호 변경 API 호출 (실제 구현 필요)
      // 여기에서는 단순히 성공으로 가정하고 폼을 리셋합니다.
      await new Promise(resolve => setTimeout(resolve, 1000));
      resetPassword();
    } catch (error) {
      console.error(error);
      setPasswordError('root', {
        message: '비밀번호 변경 중 오류가 발생했습니다.',
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // 계정 삭제 핸들러
  const handleDeleteAccount = () => {
    if (window.confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      // 계정 삭제 로직 구현 (API 호출)
      // 성공 시 로그아웃 및 홈으로 리디렉션
      logout();
      navigate('/');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10">
        <p>로그인이 필요한 페이지입니다.</p>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => navigate('/login')}
        >
          로그인
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">내 프로필</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* 프로필 사이드바 */}
        <div className="w-full md:w-1/4">
          <Card className="sticky top-20">
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={user.profileImage || 'https://via.placeholder.com/150'}
                  alt={user.nickname}
                  className="h-32 w-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md"
                />
                <button
                  className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full shadow-lg"
                  aria-label="Change profile picture"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
              <h2 className="mt-4 text-xl font-semibold">{user.nickname}</h2>
              <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                가입일: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="mt-6 space-y-2">
              <button
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeTab === 'profile'
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                프로필 정보
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeTab === 'password'
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('password')}
              >
                비밀번호 변경
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeTab === 'activity'
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('activity')}
              >
                활동 내역
              </button>
            </div>
          </Card>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="w-full md:w-3/4">
          {activeTab === 'profile' && (
            <Card title="프로필 정보">
              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                <Input
                  label="사용자 이름"
                  type="text"
                  {...registerProfile('nickname')}
                  error={profileErrors.nickname?.message}
                />

                <Input
                  label="이메일"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                />

                {profileErrors.root && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          {profileErrors.root.message}
                        </h3>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isProfileLoading}
                  >
                    저장
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'password' && (
            <Card title="비밀번호 변경">
              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                <Input
                  label="현재 비밀번호"
                  type="password"
                  {...registerPassword('currentPassword')}
                  error={passwordErrors.currentPassword?.message}
                />

                <Input
                  label="새 비밀번호"
                  type="password"
                  {...registerPassword('newPassword')}
                  error={passwordErrors.newPassword?.message}
                />

                <Input
                  label="새 비밀번호 확인"
                  type="password"
                  {...registerPassword('confirmNewPassword')}
                  error={passwordErrors.confirmNewPassword?.message}
                />

                {passwordErrors.root && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          {passwordErrors.root.message}
                        </h3>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isPasswordLoading}
                  >
                    비밀번호 변경
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'activity' && (
            <Card title="활동 내역">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="font-medium">내 게시글</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">작성한 게시글 목록</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/my-posts')}
                  >
                    보기
                  </Button>
                </div>

                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="font-medium">내 댓글</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">작성한 댓글 목록</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/my-comments')}
                  >
                    보기
                  </Button>
                </div>

                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="font-medium">북마크</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">북마크한 게시글 목록</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/my-bookmarks')}
                  >
                    보기
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* 계정 삭제 섹션 */}
          <Card className="mt-6 border border-red-300 dark:border-red-900">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-500 mb-4">위험 영역</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              계정을 삭제하시면 모든 데이터가 영구적으로 삭제되며, 이 작업은 되돌릴 수 없습니다.
            </p>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
            >
              계정 삭제
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;