import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard, GuestGuard, VerifiedGuard, RoleGuard } from './components/guards';

// Layouts
import { AdminLayout } from './layouts/AdminLayout';

// Pages
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import {
  LoginPage,
  RegisterPage,
  VerifyEmailPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from './pages/auth';
import { ArticlePage, ArticleNewPage } from './pages/article';
import { MeDraftsPage } from './pages/me';
import { RevisionEditPage } from './pages/revision';
import {
  AdminReviewsPage,
  AdminRevisionDetailPage,
  AdminPublishQueuePage,
} from './pages/admin';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/article/:slug" element={<ArticlePage />} />

          {/* Auth routes (guest only) */}
          <Route element={<GuestGuard />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Email verification (can be accessed by anyone) */}
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Protected routes (must be logged in) */}
          <Route element={<AuthGuard />}>
            <Route path="/me/drafts" element={<MeDraftsPage />} />
            <Route path="/revision/:id/edit" element={<RevisionEditPage />} />
            
            {/* Routes that require verified email */}
            <Route element={<VerifiedGuard />}>
              <Route path="/article/new" element={<ArticleNewPage />} />
            </Route>
          </Route>

          {/* Admin routes (REVIEWER or ADMIN) */}
          <Route element={<RoleGuard allowedRoles={['REVIEWER', 'ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/reviews" element={<AdminReviewsPage />} />
              <Route path="/admin/revisions/:id" element={<AdminRevisionDetailPage />} />
              {/* Publish queue - ADMIN only (handled by AdminLayout) */}
              <Route path="/admin/publish-queue" element={<AdminPublishQueuePage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
