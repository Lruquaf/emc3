import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, AlertCircle } from 'lucide-react';

import { useMyRevisions } from '../../hooks/useMyDrafts';
import { RevisionStatus } from '../../components/revision/RevisionStatus';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { REVISION_STATUS_LABELS } from '@emc3/shared';
import type { RevisionStatus as RevisionStatusType } from '@emc3/shared';

type FilterStatus =
  | ''
  | 'REV_DRAFT'
  | 'REV_IN_REVIEW'
  | 'REV_CHANGES_REQUESTED'
  | 'REV_APPROVED';

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: '', label: 'Tümü' },
  { value: 'REV_DRAFT', label: REVISION_STATUS_LABELS.REV_DRAFT },
  { value: 'REV_IN_REVIEW', label: REVISION_STATUS_LABELS.REV_IN_REVIEW },
  { value: 'REV_CHANGES_REQUESTED', label: REVISION_STATUS_LABELS.REV_CHANGES_REQUESTED },
  { value: 'REV_APPROVED', label: REVISION_STATUS_LABELS.REV_APPROVED },
];

export function MeDraftsPage() {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useMyRevisions(statusFilter || undefined);

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Taslaklar ve İçeriklerim
          </h1>
          <Link
            to="/article/new"
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            <Plus size={18} />
            Yeni Makale
          </Link>
        </div>

        {/* Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTER_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="rounded-lg bg-rose-100 p-4 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
            Bir hata oluştu. Lütfen tekrar deneyin.
          </div>
        ) : allItems.length === 0 ? (
          <div className="rounded-xl bg-neutral-50 p-8 text-center dark:bg-neutral-800/50">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
              <FileText size={32} className="text-neutral-500" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Henüz içerik yok
            </h3>
            <p className="mb-4 text-neutral-600 dark:text-neutral-400">
              İlk makalenizi yazarak başlayın.
            </p>
            <Link
              to="/article/new"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              <Plus size={18} />
              Yeni Makale
            </Link>
          </div>
        ) : (
          <>
            {/* List */}
            <div className="space-y-3">
              {allItems.map((revision) => (
                <Link
                  key={revision.id}
                  to={`/revision/${revision.id}/edit`}
                  className="block rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-emerald-700"
                >
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                      {revision.title}
                    </h3>
                    <RevisionStatus status={revision.status as RevisionStatusType} size="sm" />
                  </div>

                  {revision.hasUnreadFeedback && (
                    <div className="mb-2 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <AlertCircle size={14} />
                      Yeni geri bildirim var
                    </div>
                  )}

                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    Son güncelleme:{' '}
                    {new Date(revision.updatedAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More */}
            {hasNextPage && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="rounded-lg bg-neutral-100 px-6 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  {isFetchingNextPage ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Yükleniyor...
                    </span>
                  ) : (
                    'Daha Fazla Yükle'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

