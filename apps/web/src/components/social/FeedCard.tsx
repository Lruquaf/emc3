import { Link } from 'react-router-dom';
import { Clock, RefreshCw } from 'lucide-react';

import { LikeButton } from './LikeButton';
import { SaveButton } from './SaveButton';
import { ArticleStats } from './ArticleStats';
import { CategoryBadge } from '../category/CategoryBadge';
import { cn } from '../../utils/cn';
import type { FeedItemDTO } from '@emc3/shared';

interface FeedCardProps {
  article: FeedItemDTO;
  showInteractions?: boolean;
  className?: string;
}

/**
 * Format date as relative time or full date
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} dakika önce`;
    }
    return `${diffHours} saat önce`;
  }

  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;

  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function FeedCard({
  article,
  showInteractions = true,
  className,
}: FeedCardProps) {
  return (
    <article
      className={cn(
        'rounded-xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md',
        className
      )}
    >
      {/* Author Header */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          to={`/@${article.author.username}`}
          className="flex items-center gap-3 hover:opacity-80"
        >
          {/* Avatar */}
          <div className="h-10 w-10 overflow-hidden rounded-full bg-emerald-100">
            {article.author.avatarUrl ? (
              <img
                src={article.author.avatarUrl}
                alt={article.author.displayName || article.author.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-semibold text-emerald-700">
                {(article.author.displayName || article.author.username)
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>

          {/* Author Info */}
          <div>
            <div className="font-medium text-neutral-900">
              {article.author.displayName || article.author.username}
              {article.author.isBanned && (
                <span className="ml-2 text-xs text-rose-500">(Askıya Alındı)</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Clock size={14} />
              <span>{formatDate(article.firstPublishedAt)}</span>
              {article.isUpdated && (
                <>
                  <RefreshCw size={14} className="ml-1" />
                  <span className="text-emerald-600">Güncellendi</span>
                </>
              )}
            </div>
          </div>
        </Link>

        {/* Stats (small, right side) */}
        <ArticleStats counts={article.counts} size="sm" />
      </div>

      {/* Article Content */}
      <Link to={`/article/${article.slug}`} className="block">
        <h2 className="mb-2 text-xl font-bold text-neutral-900 hover:text-emerald-700">
          {article.title}
        </h2>
        <p className="mb-4 line-clamp-2 text-neutral-600">{article.summary}</p>
      </Link>

      {/* Categories */}
      {article.categories.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {article.categories.map((category) => (
            <CategoryBadge
              key={category.id}
              name={category.name}
              slug={category.slug}
              size="sm"
            />
          ))}
        </div>
      )}

      {/* Interactions */}
      {showInteractions && (
        <div className="flex items-center gap-3 border-t border-neutral-100 pt-4">
          <LikeButton
            articleId={article.id}
            initialLiked={article.viewerInteraction?.hasLiked ?? false}
            initialCount={article.counts.likes}
            size="sm"
          />
          <SaveButton
            articleId={article.id}
            initialSaved={article.viewerInteraction?.hasSaved ?? false}
            initialCount={article.counts.saves}
            size="sm"
            variant="minimal"
          />
        </div>
      )}
    </article>
  );
}

