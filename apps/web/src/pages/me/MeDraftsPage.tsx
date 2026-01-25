import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useMyRevisions } from '../../hooks/useMyDrafts';
import { useCreateRevision } from '../../hooks/useArticle';
import { revisionsApi } from '../../api/revisions.api';
import { RevisionStatus } from '../../components/revision/RevisionStatus';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { REVISION_STATUS_LABELS } from '@emc3/shared';
import type { RevisionStatus as RevisionStatusType } from '@emc3/shared';
import { cn } from '../../utils/cn';

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const createRevision = useCreateRevision();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useMyRevisions(statusFilter || undefined);

  const deleteRevision = useMutation({
    mutationFn: (revisionId: string) => revisionsApi.delete(revisionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRevisions'] });
      setMessage({ type: 'success', text: 'Taslak silindi' });
      setDeletingId(null);
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Taslak silinirken bir hata oluştu';
      setMessage({ type: 'error', text: errorMessage });
      setDeletingId(null);
      setTimeout(() => setMessage(null), 5000);
    },
  });

  const handleDelete = (revisionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(revisionId);
  };

  const confirmDelete = () => {
    if (showDeleteDialog) {
      setDeletingId(showDeleteDialog);
      deleteRevision.mutate(showDeleteDialog);
      setShowDeleteDialog(null);
    }
  };

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header Card */}
      <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Taslaklar ve İçeriklerim</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Makalelerinizi yönetin ve düzenleyin
            </p>
          </div>
          <Link
            to="/article/new"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Plus size={18} />
            Yeni Makale
          </Link>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mt-4 rounded-lg px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-rose-50 text-rose-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mt-6 flex gap-1 border-t border-neutral-100 pt-4">
          {FILTER_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                statusFilter === value
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              )}
            >
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Bir hata oluştu. Lütfen tekrar deneyin.
          </div>
        </div>
      ) : allItems.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
          <h3 className="mb-2 text-lg font-semibold text-neutral-900">Henüz içerik yok</h3>
          <p className="mb-4 text-neutral-600">İlk makalenizi yazarak başlayın.</p>
          <Link
            to="/article/new"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Plus size={18} />
            Yeni Makale
          </Link>
        </div>
      ) : (
        <>
          {/* List */}
          <div className="space-y-4">
            {allItems.map((revision) => {
              const canDelete = revision.status === 'REV_DRAFT';
              const isDeleting = deletingId === revision.id;
              const isWithdrawn = revision.status === 'REV_WITHDRAWN';
              const isCreatingDraft = createRevision.isPending;

              const handleCreateNewDraft = (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                createRevision.mutate(revision.articleId);
              };

              return (
                <div
                  key={revision.id}
                  className="group relative rounded-xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <Link
                    to={isWithdrawn ? '#' : `/revision/${revision.id}/edit`}
                    className="block"
                    onClick={isWithdrawn ? (e) => e.preventDefault() : undefined}
                  >
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {revision.title}
                      </h3>
                      <RevisionStatus status={revision.status as RevisionStatusType} size="sm" />
                    </div>

                    {revision.hasUnreadFeedback && (
                      <div className="mb-3 flex items-center gap-2 text-sm text-amber-600">
                        <AlertCircle size={14} />
                        Yeni geri bildirim var
                      </div>
                    )}

                    {isWithdrawn && (
                      <div className="mb-3 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600">
                        Bu revizyon geri çekilmiş durumda. Düzenlemek için yeni bir taslak oluşturun.
                      </div>
                    )}

                    <div className="text-sm text-neutral-500">
                      Son güncelleme:{' '}
                      {new Date(revision.updatedAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </Link>

                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
                    {isWithdrawn ? (
                      <button
                        type="button"
                        onClick={handleCreateNewDraft}
                        disabled={isCreatingDraft}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 disabled:opacity-50"
                      >
                        {isCreatingDraft ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span>Oluşturuluyor...</span>
                          </>
                        ) : (
                          <>
                            <FileText size={14} />
                            <span>Yeni Taslak Oluştur</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <Link
                        to={`/revision/${revision.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                      >
                        <Edit2 size={14} />
                        Düzenle
                      </Link>
                    )}

                    {/* Delete Button - Only for drafts */}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(revision.id, e)}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                        title="Taslağı sil"
                      >
                        {isDeleting ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span>Siliniyor...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 size={14} />
                            <span>Sil</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More */}
          {hasNextPage && (
            <div className="mt-8 text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
              >
                {isFetchingNextPage ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Yükleniyor...</span>
                  </>
                ) : (
                  'Daha Fazla Yükle'
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog !== null}
        onClose={() => setShowDeleteDialog(null)}
        onConfirm={confirmDelete}
        title="Taslağı Sil"
        message="Bu taslağı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        cancelText="İptal"
        variant="danger"
        isLoading={deletingId !== null && deleteRevision.isPending}
      />
    </div>
  );
}
