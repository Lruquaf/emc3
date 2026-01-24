import { Heart } from 'lucide-react';

import { useOpinionLike } from '../../hooks/useOpinions';
import { cn } from '../../utils/cn';

interface OpinionLikeButtonProps {
  opinionId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function OpinionLikeButton({
  opinionId,
  initialLiked,
  initialCount,
}: OpinionLikeButtonProps) {
  const { liked, likeCount, toggle, isLoading } = useOpinionLike({
    opinionId,
    initialLiked,
    initialCount,
  });

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        liked
          ? 'border-rose-500 bg-rose-50 text-rose-600 hover:bg-rose-100'
          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-rose-500'
      )}
      aria-label={liked ? 'Beğeniyi kaldır' : 'Beğen'}
      aria-pressed={liked}
    >
      <Heart
        size={16}
        className={cn(
          'transition-all',
          liked && 'fill-rose-500',
          isLoading && 'animate-pulse'
        )}
      />
      <span className="tabular-nums">{likeCount}</span>
    </button>
  );
}

