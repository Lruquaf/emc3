import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard, BannedGuard, GuestGuard, VerifiedGuard, RoleGuard } from './components/guards';

// Layouts
import { AdminLayout } from './layouts/AdminLayout';
import { MainLayout } from './layouts/MainLayout';

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
import { MeDraftsPage, MeProfilePage } from './pages/me';
import { RevisionEditPage } from './pages/revision';
import {
  AdminReviewsPage,
  AdminRevisionDetailPage,
  AdminPublishQueuePage,
  AdminCategoriesPage,
  AdminDashboardPage,
  AdminUsersPage,
  AdminArticlesPage,
  AdminAuditPage,
  AdminAppealsPage,
} from './pages/admin';
import { FeedPage } from './pages/FeedPage';
import { FollowingFeedPage } from './pages/FollowingFeedPage';
import { SavedPage } from './pages/SavedPage';
import { AppealPage } from './pages/AppealPage';
import { ProfilePage } from './pages/ProfilePage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin routes first (matched before MainLayout catch‑all) */}
          {/* Moderator (REVIEWER) and Admin routes */}
          <Route element={<RoleGuard allowedRoles={['REVIEWER', 'ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/reviews" element={<AdminReviewsPage />} />
              <Route path="/admin/revisions/:id" element={<AdminRevisionDetailPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/articles" element={<AdminArticlesPage />} />
              <Route path="/admin/audit" element={<AdminAuditPage />} />
              <Route path="/admin/appeals" element={<AdminAppealsPage />} />
            </Route>
          </Route>
          {/* Admin-only routes */}
          <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
              <Route path="/admin/publish-queue" element={<AdminPublishQueuePage />} />
            </Route>
          </Route>

          {/* Main site: navbar + content */}
          <Route element={<BannedGuard />}>
            <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/user/:username" element={<ProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            <Route element={<GuestGuard />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            <Route path="/verify-email" element={<VerifyEmailPage />} />

            <Route element={<AuthGuard />}>
              <Route path="/me/profile" element={<MeProfilePage />} />
              <Route path="/me/drafts" element={<MeDraftsPage />} />
              <Route path="/me/saved" element={<SavedPage />} />
              <Route path="/me/appeal" element={<AppealPage />} />
              <Route path="/feed/following" element={<FollowingFeedPage />} />
              <Route path="/revision/:id/edit" element={<RevisionEditPage />} />
              <Route element={<VerifiedGuard />}>
                <Route path="/article/new" element={<ArticleNewPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
