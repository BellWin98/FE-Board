import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { z } from 'zod';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import type { LoginRequest } from '../../types/models';
import { createWelcomeMessage, getDefaultRedirectPath } from '../../utils/redirectUtils';

// 로그인 폼 유효성 검사 스키마
const loginSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
});

// 로그인 폼 타입
type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // React Hook Form 초기화
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 로그인 제출 핸들러
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const loginData: LoginRequest = {
        email: data.email,
        password: data.password,
      };

      const success = await login(loginData);
      
      if (success) {
        // 로그인 성공 시 사용자 정보 가져와서 리디렉션 설정
        const loggedInUser = authService.getUser();
        if (!loggedInUser) {
          throw new Error('로그인 후 사용자 정보를 가져올 수 없습니다.');
        }
        const targetPath = getDefaultRedirectPath(loggedInUser);
        const welcomeMessage = createWelcomeMessage(loggedInUser, targetPath);

        toast.success(welcomeMessage);

        // 약간의 지연 후 리디렉션 (사용자가 메시지를 볼 수 있도록)
        setTimeout(() => {
          navigate(targetPath, { replace: true });
        }, 800);

      } else {
        setError('root', {
          message: '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.',
        });
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      setError('root', {
        message: '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">로그인</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            계정이 없으신가요?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              회원가입
            </Link>
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="이메일"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="이메일을 입력하세요"
              icon={
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              }
            />

            <Input
              label="비밀번호"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="비밀번호를 입력하세요"
              icon={
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  로그인 상태 유지
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
            </div>

            {errors.root && (
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
                      {errors.root.message}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
              >
                로그인
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;