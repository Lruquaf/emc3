import { useState } from 'react';
import { Heart, Bookmark, Share2, Eye } from 'lucide-react';

import type { ArticleCountsDTO, ViewerInteractionDTO } from '@emc3/shared';

interface ArticleActionsProps {
  articleId: string;
  counts: ArticleCountsDTO;
  viewerInteraction?: ViewerInteractionDTO;
}

export function ArticleActions({
  counts,
  viewerInteraction,
}: ArticleActionsProps) {
  const [liked, setLiked] = useState(viewerInteraction?.hasLiked ?? false);
  const [saved, setSaved] = useState(viewerInteraction?.hasSaved ?? false);
  const [likeCount, setLikeCount] = useState(counts.likes);
  const [saveCount, setSaveCount] = useState(counts.saves);

  const handleLike = async () => {
    // TODO: Implement like API call
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleSave = async () => {
    // TODO: Implement save API call
    setSaved(!saved);
    setSaveCount((prev) => (saved ? prev - 1 : prev + 1));
  };

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
    <div className="flex items-center gap-6">
      {/* Like */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-2 transition-colors ${
          liked ? 'text-danger' : 'text-text-muted hover:text-danger'
        }`}
      >
        <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
        <span className="text-sm font-medium">{formatCount(likeCount)}</span>
      </button>

      {/* Save */}
      <button
        onClick={handleSave}
        className={`flex items-center gap-2 transition-colors ${
          saved ? 'text-accent' : 'text-text-muted hover:text-accent'
        }`}
      >
        <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
        <span className="text-sm font-medium">{formatCount(saveCount)}</span>
      </button>

      {/* Views */}
      <div className="flex items-center gap-2 text-text-muted">
        <Eye size={20} />
        <span className="text-sm">{formatCount(counts.views)}</span>
      </div>

      {/* Share */}
      <button
        onClick={handleShare}
        className="flex items-center gap-2 text-text-muted transition-colors hover:text-text"
      >
        <Share2 size={20} />
      </button>
    </div>
  );
}

