import { Share2, Eye } from 'lucide-react';

import { LikeButton } from '../social/LikeButton';
import { SaveButton } from '../social/SaveButton';
import type { ArticleCountsDTO, ViewerInteractionDTO } from '@emc3/shared';

interface ArticleActionsProps {
  articleId: string;
  counts: ArticleCountsDTO;
  viewerInteraction?: ViewerInteractionDTO;
}

export function ArticleActions({
  articleId,
  counts,
  viewerInteraction,
}: ArticleActionsProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert('Bağlantı panoya kopyalandı!');
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="flex items-center gap-4">
      <LikeButton
        articleId={articleId}
        initialLiked={viewerInteraction?.hasLiked ?? false}
        initialCount={counts.likes}
        size="md"
        showCount
      />
      <SaveButton
        articleId={articleId}
        initialSaved={viewerInteraction?.hasSaved ?? false}
        initialCount={counts.saves}
        size="md"
        showCount
      />
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Eye size={18} />
        <span className="tabular-nums">{formatCount(counts.views)}</span>
      </div>
      <button
        onClick={handleShare}
        className="ml-auto inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
        aria-label="Paylaş"
      >
        <Share2 size={18} />
        Paylaş
      </button>
    </div>
  );
}

