import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';

// 페이지 컴포넌트 (지연 로딩 적용)
const HomePage = React.lazy(() => import('./pages/home/HomePage'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const ProfilePage = React.lazy(() => import('./pages/profile/ProfilePage'));
const BoardsPage = React.lazy(() => import('./pages/board/BoardsPage'));
const BoardDetailPage = React.lazy(() => import('./pages/board/BoardDetailPage'));
const PostDetailPage = React.lazy(() => import('./pages/board/PostDetailPage'));
const PostCreatePage = React.lazy(() => import('./pages/board/PostCreatePage'));
const PostEditPage = React.lazy(() => import('./pages/board/PostEditPage'));
const MyPostsPage = React.lazy(() => import('./pages/profile/MyPostsPage'));
const MyCommentsPage = React.lazy(() => import('./pages/profile/MyCommentsPage'));
const MyBookmarksPage = React.lazy(() => import('./pages/profile/MyBookmarksPage'));
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'));
const NotFoundPage = React.lazy(() => import('./pages/error/NotFoundPage'));

// PlanBet Pages (지연 로딩 적용)
const FriendsPage = React.lazy(() => import('./pages/friends/FriendsPage'));
const ChallengesPage = React.lazy(() => import('./pages/challenges/ChallengesPage'));
const CreateChallengePage = React.lazy(() => import('./pages/challenges/CreateChallengePage'));
import ChallengeDetailPage from './pages/challenges/ChallengeDetailPage';

// 로딩 컴포넌트
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <React.Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* 공개 접근 가능 라우트 */}
                <Route path="/" element={<HomePage />} />
                <Route path="/boards" element={<BoardsPage />} />
                <Route path="/boards/:categoryId" element={<BoardDetailPage />} />
                <Route path="/posts/:postId" element={<PostDetailPage />} />

                {/* 게스트 전용 라우트 */}
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <GuestRoute>
                      <RegisterPage />
                    </GuestRoute>
                  }
                />

                {/* 인증 사용자 전용 라우트 */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/post/create"
                  element={
                    <ProtectedRoute>
                      <PostCreatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/post/edit/:postId"
                  element={
                    <ProtectedRoute>
                      <PostEditPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-posts"
                  element={
                    <ProtectedRoute>
                      <MyPostsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-comments"
                  element={
                    <ProtectedRoute>
                      <MyCommentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-bookmarks"
                  element={
                    <ProtectedRoute>
                      <MyBookmarksPage />
                    </ProtectedRoute>
                  }
                />

                 {/* PlanBet 페이지 */}
                 <Route
                  path="/friends"
                  element={
                    <ProtectedRoute>
                      <FriendsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/challenges" element={<ChallengesPage />} />
                <Route
                  path="/challenges/create"
                  element={
                    <ProtectedRoute>
                      <CreateChallengePage />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/challenges/:id" 
                  element={
                    <ProtectedRoute>
                      <ChallengeDetailPage />
                    </ProtectedRoute>
                  } 
                />

                {/* 관리자 전용 라우트 */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 페이지 */}
                <Route path="/404" element={<NotFoundPage />} />

                {/* 알 수 없는 경로는 404 페이지로 리디렉션 */}
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </React.Suspense>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;