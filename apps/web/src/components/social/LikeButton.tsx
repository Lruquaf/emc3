import { Heart } from 'lucide-react';

import { useLike } from '../../hooks/useLike';
import { cn } from '../../utils/cn';

interface LikeButtonProps {
  articleId: string;
  initialLiked: boolean;
  initialCount: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export function LikeButton({
  articleId,
  initialLiked,
  initialCount,
  size = 'md',
  showCount = true,
  className,
}: LikeButtonProps) {
  const { liked, likeCount, toggle, isLoading } = useLike({
    articleId,
    initialLiked,
    initialCount,
  });

  const sizeClasses = {
    sm: 'h-8 px-2 text-sm gap-1.5',
    md: 'h-10 px-3 text-base gap-2',
    lg: 'h-12 px-4 text-lg gap-2.5',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      className={cn(
        'inline-flex items-center rounded-lg border font-medium transition-all',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        liked
          ? 'border-rose-500 bg-rose-50 text-rose-600 hover:bg-rose-100'
          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-rose-500',
        sizeClasses[size],
        className
      )}
      aria-label={liked ? 'Beğeniyi kaldır' : 'Beğen'}
      aria-pressed={liked}
    >
      <Heart
        size={iconSizes[size]}
        className={cn(
          'transition-all',
          liked && 'fill-rose-500',
          isLoading && 'animate-pulse'
        )}
      />
      {showCount && (
        <span className="tabular-nums">{likeCount}</span>
      )}
    </button>
  );
}

