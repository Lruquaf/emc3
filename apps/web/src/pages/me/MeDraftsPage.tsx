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
          <h1 className="font-serif text-3xl font-bold text-text">
            Taslaklar ve İçeriklerim
          </h1>
          <Link
            to="/article/new"
            className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-600"
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
                  ? 'bg-accent text-white'
                  : 'bg-surface-subtle text-text-secondary hover:bg-border-light'
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
          <div className="rounded-lg bg-danger-50 p-4 text-danger">
            Bir hata oluştu. Lütfen tekrar deneyin.
          </div>
        ) : allItems.length === 0 ? (
          <div className="rounded-xl bg-surface-subtle p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-border-light">
              <FileText size={32} className="text-text-muted" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-text">
              Henüz içerik yok
            </h3>
            <p className="mb-4 text-text-secondary">
              İlk makalenizi yazarak başlayın.
            </p>
            <Link
              to="/article/new"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600"
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
                  className="block rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent hover:shadow-sm"
                >
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <h3 className="font-medium text-text">
                      {revision.title}
                    </h3>
                    <RevisionStatus status={revision.status as RevisionStatusType} size="sm" />
                  </div>

                  {revision.hasUnreadFeedback && (
                    <div className="mb-2 flex items-center gap-2 text-sm text-gold">
                      <AlertCircle size={14} />
                      Yeni geri bildirim var
                    </div>
                  )}

                  <div className="text-sm text-text-muted">
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
                  className="rounded-lg bg-surface-subtle px-6 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-border-light disabled:opacity-50"
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

