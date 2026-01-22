import { Outlet, NavLink, Navigate } from 'react-router-dom';
import {
  FileSearch,
  CheckSquare,
  Users,
  FolderTree,
  FileText,
  Shield,
  Home,
  LogOut,
  LayoutDashboard,
  MessageSquare,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Kullanıcılar' },
  { to: '/admin/articles', icon: FileText, label: 'Makaleler' },
  { to: '/admin/reviews', icon: FileSearch, label: 'İnceleme Kuyruğu' },
  { to: '/admin/publish-queue', icon: CheckSquare, label: 'Yayın Kuyruğu', adminOnly: true },
  { to: '/admin/categories', icon: FolderTree, label: 'Kategoriler', adminOnly: true },
  { to: '/admin/audit', icon: Shield, label: 'Audit Log' },
  { to: '/admin/appeals', icon: MessageSquare, label: 'İtirazlar' },
];

export function AdminLayout() {
  const { user, hasRole, logout } = useAuth();

  // Check if user has admin or reviewer role
  const isReviewer = hasRole('REVIEWER') || hasRole('ADMIN');
  const isAdmin = hasRole('ADMIN');

  if (!isReviewer) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-surface flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-bold text-text">Admin Panel</h1>
          <p className="text-sm text-muted">
            {isAdmin ? 'Administrator' : 'Reviewer'}
          </p>
          <p className="text-xs text-muted mt-1">@{user?.username}</p>
        </div>

        <nav className="flex-1 mt-4">
          {adminNavItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? 'border-r-2 border-accent bg-accent/5 text-accent'
                      : 'text-muted hover:bg-bg hover:text-text'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
        </nav>

        {/* Footer links */}
        <div className="border-t border-border p-4 space-y-2">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-2 py-2 text-sm text-muted hover:text-text transition-colors rounded-lg hover:bg-bg"
          >
            <Home size={18} />
            Siteye Dön
          </NavLink>
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-2 py-2 text-sm text-muted hover:text-danger transition-colors rounded-lg hover:bg-danger/5 w-full text-left"
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-bg overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

