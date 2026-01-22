import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Clock, RefreshCw, User } from 'lucide-react';

import type { AuthorDTO, CategoryDTO } from '@emc3/shared';

interface ArticleMetaProps {
  author: AuthorDTO;
  categories: CategoryDTO[];
  publishedAt: string | null;
  isUpdated: boolean;
  hasPendingUpdate: boolean;
}

export function ArticleMeta({
  author,
  categories,
  publishedAt,
  isUpdated,
  hasPendingUpdate,
}: ArticleMetaProps) {
  const timeAgo = publishedAt
    ? formatDistanceToNow(new Date(publishedAt), { addSuffix: true, locale: tr })
    : null;

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
      {/* Author */}
      <Link
        to={`/u/${author.username}`}
        className="flex items-center gap-2 transition-colors hover:text-text"
      >
        {author.avatarUrl ? (
          <img
            src={author.avatarUrl}
            alt={author.displayName || author.username}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-50 text-accent-600">
            <User size={16} />
          </div>
        )}
        <span className="font-medium">
          {author.displayName || `@${author.username}`}
        </span>
      </Link>

      {/* Date */}
      {timeAgo && (
        <div className="flex items-center gap-1.5">
          <Clock size={14} />
          <span>{timeAgo}</span>
        </div>
      )}

      {/* Updated badge */}
      {isUpdated && (
        <div className="flex items-center gap-1.5 text-gold-600">
          <RefreshCw size={14} />
          <span>Güncellendi</span>
        </div>
      )}

      {/* Pending update badge */}
      {hasPendingUpdate && (
        <span className="rounded-full bg-gold-50 px-2.5 py-1 text-xs font-medium text-gold-700">
          Güncelleme Bekliyor
        </span>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/?category=${category.slug}`}
              className="rounded-full bg-surface-subtle px-3 py-1 text-xs font-medium transition-colors hover:bg-border-light"
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

