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
    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
      {/* Author */}
      <Link
        to={`/u/${author.username}`}
        className="flex items-center gap-2 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200"
      >
        {author.avatarUrl ? (
          <img
            src={author.avatarUrl}
            alt={author.displayName || author.username}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
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
        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
          <RefreshCw size={14} />
          <span>Güncellendi</span>
        </div>
      )}

      {/* Pending update badge */}
      {hasPendingUpdate && (
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
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
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

