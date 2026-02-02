import { Outlet } from 'react-router-dom';

import { MainNavbar } from '@/components/nav/MainNavbar';
import { BannedBanner } from '@/components/BannedBanner';
import { Footer } from '@/components/layout/Footer';

/**
 * Layout for main app (feed, articles, auth, profile, etc.).
 * Includes top navbar, content area, and footer. Admin routes use AdminLayout instead.
 */
export function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)]">
      <MainNavbar />
      <BannedBanner />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
