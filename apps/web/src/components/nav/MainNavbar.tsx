import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Compass,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Settings,
  FileEdit,
  Bookmark,
  Users,
  ChevronDown,
  LayoutDashboard,
  Rss,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils/cn';

export function MainNavbar() {
  const { user, isAuthenticated, isLoading, logout, hasRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate(user?.isBanned ? '/' : '/feed');
  };

  const isAdmin = hasRole('ADMIN');
  const isReviewer = hasRole('REVIEWER');
  const hasModeratorAccess = isAdmin || isReviewer;
  const isBanned = user?.isBanned ?? false;

  // Determine admin panel entry point based on role
  const getAdminPath = () => {
    if (isAdmin) return '/admin';
    if (isReviewer) return '/admin/reviews';
    return '/feed';
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <NavLink
          to={isBanned ? '/me/appeal' : '/feed'}
          className="flex items-center gap-2 font-serif text-xl font-bold text-accent transition-opacity hover:opacity-90"
        >
          e=mc³
        </NavLink>

        {/* Nav links - hidden for banned users (flows closed) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {!isBanned && (
            <>
              <NavLink
                to="/feed"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-muted hover:bg-border/50 hover:text-text'
                  )
                }
              >
                <Compass className="h-4 w-4" />
                <span className="hidden sm:inline">Keşfet</span>
              </NavLink>

              {isAuthenticated && (
                <NavLink
                  to="/feed/following"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent/10 text-accent'
                        : 'text-muted hover:bg-border/50 hover:text-text'
                    )
                  }
                >
                  <Rss className="h-4 w-4" />
                  <span className="hidden sm:inline">Akışım</span>
                </NavLink>
              )}
            </>
          )}

          {!isLoading && (
            <>
              {!isAuthenticated ? (
                <>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-accent/10 text-accent'
                          : 'text-muted hover:bg-border/50 hover:text-text'
                      )
                    }
                  >
                    <LogIn className="h-4 w-4" />
                    Giriş
                  </NavLink>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-accent/10 text-accent'
                          : 'bg-accent text-white hover:bg-accent/90'
                      )
                    }
                  >
                    <UserPlus className="h-4 w-4" />
                    Kayıt
                  </NavLink>
                </>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-border/50 hover:text-text"
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                  >
                    <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-accent/20">
                      {user?.profile?.avatarUrl ? (
                        <img
                          src={user.profile.avatarUrl}
                          alt={user.profile.displayName || user.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-accent">
                          {(user?.profile?.displayName || user?.username || '?').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="hidden max-w-[120px] truncate sm:inline">
                      {user?.profile?.displayName || user?.username}
                    </span>
                    <ChevronDown
                      className={cn('h-4 w-4 transition-transform', dropdownOpen && 'rotate-180')}
                    />
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-1 w-52 rounded-lg border border-border bg-surface py-1 shadow-lg"
                      role="menu"
                    >
                      {isBanned ? (
                        <Link
                          to="/me/appeal"
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-text transition-colors hover:bg-bg"
                          role="menuitem"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <User className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>İtiraz Et</span>
                        </Link>
                      ) : (
                        <>
                      <Link
                        to={user ? `/user/${user.username}` : '/feed'}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-text transition-colors hover:bg-bg"
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Profilim</span>
                      </Link>
                      <Link
                        to="/me/profile"
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-text transition-colors hover:bg-bg"
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Hesabım</span>
                      </Link>
                      <Link
                        to="/me/drafts"
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-text transition-colors hover:bg-bg"
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FileEdit className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Taslaklarım</span>
                      </Link>
                      <Link
                        to="/me/saved"
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-text transition-colors hover:bg-bg"
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Bookmark className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Kaydettiklerim</span>
                      </Link>
                      </>
                      )}
                      {!isBanned && hasModeratorAccess && (
                        <Link
                          to={getAdminPath()}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-text transition-colors hover:bg-bg"
                          role="menuitem"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <LayoutDashboard className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{isAdmin ? 'Admin' : 'Moderasyon'}</span>
                        </Link>
                      )}
                      <div className="my-1 border-t border-border" />
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-danger transition-colors hover:bg-danger/5"
                        role="menuitem"
                      >
                        <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
