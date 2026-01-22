import { Heart, Bookmark, Eye } from 'lucide-react';

import { cn } from '../../utils/cn';
import type { ArticleCounts } from '@emc3/shared';

interface ArticleStatsProps {
  counts: ArticleCounts;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Format large numbers (1000 -> 1K, 1000000 -> 1M)
 */
function formatCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
}

export function ArticleStats({
  counts,
  size = 'md',
  className,
}: ArticleStatsProps) {
  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <div
      className={cn(
        'flex items-center gap-4 text-neutral-500',
        size === 'sm' ? 'text-xs' : 'text-sm',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <Heart size={iconSize} />
        <span className="tabular-nums">{formatCount(counts.likes)}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Bookmark size={iconSize} />
        <span className="tabular-nums">{formatCount(counts.saves)}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Eye size={iconSize} />
        <span className="tabular-nums">{formatCount(counts.views)}</span>
      </div>
    </div>
  );
}

