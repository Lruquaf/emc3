import { Link } from 'react-router-dom';

import { FollowButton } from './FollowButton';
import { cn } from '../../utils/cn';
import type { UserSummaryDTO } from '@emc3/shared';

interface UserCardProps {
  user: UserSummaryDTO;
  showFollow?: boolean;
  className?: string;
}

export function UserCard({
  user,
  showFollow = true,
  className,
}: UserCardProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-4',
        user.isBanned && 'opacity-60',
        className
      )}
    >
      <Link
        to={`/@${user.username}`}
        className="flex items-center gap-3 hover:opacity-80"
      >
        {/* Avatar */}
        <div className="h-12 w-12 overflow-hidden rounded-full bg-emerald-100">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName || user.username}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-emerald-700">
              {(user.displayName || user.username).charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* User Info */}
        <div>
          <div className="font-medium text-neutral-900">
            {user.displayName || user.username}
            {user.isBanned && (
              <span className="ml-2 text-xs text-rose-500">(Askıya Alındı)</span>
            )}
          </div>
          <div className="text-sm text-neutral-500">@{user.username}</div>
          {user.about && (
            <p className="mt-1 line-clamp-1 text-sm text-neutral-600">
              {user.about}
            </p>
          )}
        </div>
      </Link>

      {showFollow && !user.isBanned && (
        <FollowButton
          userId={user.id}
          username={user.username}
          initialFollowing={user.isFollowing}
          size="sm"
        />
      )}
    </div>
  );
}

