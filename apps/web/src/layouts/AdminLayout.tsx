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
  User,
  Crown,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

const adminNavItems = [
  { to: '/admin/reviews', icon: FileSearch, label: 'İnceleme Kuyruğu' },
  { to: '/admin/publish-queue', icon: CheckSquare, label: 'Yayın Kuyruğu', adminOnly: true },
  // Future admin pages
  // { to: '/admin/users', icon: Users, label: 'Kullanıcılar' },
  // { to: '/admin/articles', icon: FileText, label: 'Makaleler' },
  // { to: '/admin/categories', icon: FolderTree, label: 'Kategoriler', adminOnly: true },
  // { to: '/admin/audit', icon: Shield, label: 'Audit Log' },
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
      <aside className="w-72 border-r border-border bg-surface flex flex-col shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-br from-surface to-surface-subtle">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent shadow-md">
              <Shield className="text-white" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-lg font-bold text-text truncate">
                Admin Panel
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isAdmin ? (
                  <>
                    <Crown size={12} className="text-gold" />
                    <span className="text-xs font-medium text-gold">Administrator</span>
                  </>
                ) : (
                  <>
                    <FileSearch size={12} className="text-accent" />
                    <span className="text-xs font-medium text-accent">Reviewer</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* User Info */}
          <div className="flex items-center gap-3 rounded-lg bg-surface p-3 border border-border-light">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-50 ring-2 ring-accent/20">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <User size={18} className="text-accent" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text truncate">
                {user?.displayName || user?.username}
              </p>
              <p className="text-xs text-text-muted truncate">@{user?.username}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="mb-2 px-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Menü
            </p>
          </div>
          <div className="space-y-1">
            {adminNavItems
              .filter((item) => !item.adminOnly || isAdmin)
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      isActive
                        ? 'bg-accent text-white shadow-md shadow-accent/20'
                        : 'text-text-secondary hover:bg-bg-secondary hover:text-text'
                    }`
                  }
                >
                  <item.icon 
                    size={18} 
                    className={`transition-transform group-hover:scale-110 ${
                      'text-current'
                    }`}
                  />
                  <span>{item.label}</span>
                </NavLink>
              ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3 space-y-1 bg-surface-subtle">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-text-secondary rounded-lg transition-all hover:bg-bg-secondary hover:text-text"
          >
            <Home size={18} />
            <span>Siteye Dön</span>
          </NavLink>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-text-secondary rounded-lg transition-all hover:bg-danger-50 hover:text-danger"
          >
            <LogOut size={18} />
            <span>Çıkış Yap</span>
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

