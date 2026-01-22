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
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        liked
          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
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

