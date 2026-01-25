import { Link } from 'react-router-dom';
import { Clock, RefreshCw, User } from 'lucide-react';

import { formatHybridDateSafe } from '../../utils/date';
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
  const timeAgo = formatHybridDateSafe(publishedAt);

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
      {/* Author */}
      <Link
        to={`/user/${author.username}`}
        className="flex items-center gap-2 transition-colors hover:text-neutral-700"
      >
        {author.avatarUrl ? (
          <img
            src={author.avatarUrl}
            alt={author.displayName || author.username}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <User size={16} />
          </div>
        )}
        <span className="font-medium">
          {author.displayName || `@${author.username}`}
        </span>
      </Link>

      {/* Date */}
      {timeAgo !== '—' && (
        <div className="flex items-center gap-1.5">
          <Clock size={14} />
          <span>{timeAgo}</span>
        </div>
      )}

      {/* Updated badge */}
      {isUpdated && (
        <div className="flex items-center gap-1.5 text-amber-600">
          <RefreshCw size={14} />
          <span>Güncellendi</span>
        </div>
      )}

      {/* Pending update badge */}
      {hasPendingUpdate && (
        <span className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
          Güncelleme Bekliyor
        </span>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/feed?category=${category.slug}`}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

