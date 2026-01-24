import { useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';

import { useFollow } from '../../hooks/useFollow';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

interface FollowButtonProps {
  userId: string;
  username: string;
  initialFollowing: boolean;
  initialFollowerCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export function FollowButton({
  userId,
  username,
  initialFollowing,
  initialFollowerCount = 0,
  size = 'md',
  showCount = false,
  className,
}: FollowButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { following, followerCount, toggle, isLoading } = useFollow({
    userId,
    initialFollowing,
    initialFollowerCount,
  });

  // Don't show follow button for own profile
  if (user?.id === userId) {
    return null;
  }

  const handleClick = () => {
    if (!isAuthenticated) {
      // Redirect to login with returnUrl
      const returnUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?returnUrl=${returnUrl}`);
      return;
    }
    toggle();
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg',
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg font-medium transition-all',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        following
          ? 'border border-neutral-300 bg-white text-neutral-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600'
          : 'bg-emerald-600 text-white hover:bg-emerald-700',
        sizeClasses[size],
        className
      )}
      aria-label={following ? `${username} takibini bırak` : `${username} takip et`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : following ? (
        <UserMinus className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      <span>{following ? 'Takibi Bırak' : 'Takip Et'}</span>
      {showCount && (
        <span className="text-neutral-500">({followerCount})</span>
      )}
    </button>
  );
}

