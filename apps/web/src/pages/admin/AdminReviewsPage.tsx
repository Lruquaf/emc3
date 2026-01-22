import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileSearch, Clock, User, Tag, MessageSquare, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

import { adminReviewApi } from '@/api/admin.api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FeedbackModal } from '@/components/admin/FeedbackModal';
import { ApproveConfirmDialog } from '@/components/admin/ApproveConfirmDialog';
import type { ReviewQueueItemDTO } from '@emc3/shared';

type StatusFilter = 'REV_IN_REVIEW' | 'REV_CHANGES_REQUESTED';

export function AdminReviewsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('REV_IN_REVIEW');
  const [selectedRevision, setSelectedRevision] = useState<ReviewQueueItemDTO | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['reviewQueue', statusFilter],
    queryFn: () => adminReviewApi.getReviewQueue({ status: statusFilter, limit: 50 }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminReviewApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
      queryClient.invalidateQueries({ queryKey: ['publishQueue'] });
      setShowApproveDialog(false);
      setSelectedRevision(null);
    },
  });

  const handleApproveClick = (revision: ReviewQueueItemDTO) => {
    setSelectedRevision(revision);
    setShowApproveDialog(true);
  };

  const handleFeedbackClick = (revision: ReviewQueueItemDTO) => {
    setSelectedRevision(revision);
    setShowFeedbackModal(true);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-3 font-serif text-3xl font-bold text-text">
          <FileSearch className="text-accent" size={32} />
          İnceleme Kuyruğu
        </h1>
        <p className="mt-2 text-text-secondary">
          İnceleme bekleyen ve düzenleme istenen revision'ları yönetin.
        </p>
      </div>

      {/* Statistics Cards */}
      {data && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">Toplam</p>
                <p className="mt-1 text-2xl font-bold text-text">
                  {data.meta.totalCount}
                </p>
              </div>
              <div className="rounded-lg bg-accent-50 p-3">
                <FileSearch className="text-accent" size={24} />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">İncelemede</p>
                <p className="mt-1 text-2xl font-bold text-text">
                  {data.items.filter((i) => i.status === 'REV_IN_REVIEW').length}
                </p>
              </div>
              <div className="rounded-lg bg-info-50 p-3">
                <Clock className="text-info" size={24} />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">Düzenleme İstendi</p>
                <p className="mt-1 text-2xl font-bold text-text">
                  {data.items.filter((i) => i.status === 'REV_CHANGES_REQUESTED').length}
                </p>
              </div>
              <div className="rounded-lg bg-warn-50 p-3">
                <MessageSquare className="text-warn" size={24} />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">Güncellemeler</p>
                <p className="mt-1 text-2xl font-bold text-text">
                  {data.items.filter((i) => i.isUpdate).length}
                </p>
              </div>
              <div className="rounded-lg bg-gold-50 p-3">
                <Tag className="text-gold" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Filter */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setStatusFilter('REV_IN_REVIEW')}
          className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
            statusFilter === 'REV_IN_REVIEW'
              ? 'bg-accent text-white shadow-md shadow-accent/20'
              : 'bg-surface text-text-muted hover:bg-surface-elevated hover:text-text border border-border'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock size={16} />
          İnceleme Bekliyor
          </div>
        </button>
        <button
          onClick={() => setStatusFilter('REV_CHANGES_REQUESTED')}
          className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
            statusFilter === 'REV_CHANGES_REQUESTED'
              ? 'bg-warn text-white shadow-md shadow-warn/20'
              : 'bg-surface text-text-muted hover:bg-surface-elevated hover:text-text border border-border'
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageSquare size={16} />
          Düzenleme İstendi
          </div>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-danger/10 p-4 text-danger">
          Bir hata oluştu. Lütfen tekrar deneyin.
        </div>
      ) : !data?.items.length ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-secondary">
            <FileSearch size={32} className="text-text-muted" />
          </div>
          <h3 className="mb-2 font-serif text-xl font-semibold text-text">Kuyruk Boş</h3>
          <p className="text-text-secondary">
            {statusFilter === 'REV_IN_REVIEW'
              ? 'İnceleme bekleyen revision yok.'
              : 'Düzenleme isteyen revision yok.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((revision) => (
            <div
              key={revision.id}
              className="group rounded-xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-accent/30 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Info */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="mb-3 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex items-center gap-2 flex-wrap">
                    {revision.isUpdate && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2.5 py-1 text-xs font-medium text-gold">
                            <Tag size={12} />
                        Güncelleme
                      </span>
                    )}
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          revision.status === 'REV_IN_REVIEW'
                            ? 'bg-info-50 text-info-dark'
                            : 'bg-warn-50 text-warn-dark'
                        }`}>
                          {revision.status === 'REV_IN_REVIEW' ? 'İncelemede' : 'Düzenleme İstendi'}
                        </span>
                      </div>
                    <Link
                      to={`/admin/revisions/${revision.id}`}
                        className="block font-serif text-lg font-semibold text-text transition-colors hover:text-accent line-clamp-2"
                    >
                      {revision.title}
                    </Link>
                    </div>
                  </div>

                  {/* Summary */}
                  {revision.summary && (
                    <p className="mb-4 text-sm text-text-secondary line-clamp-2 leading-relaxed">
                      {revision.summary}
                  </p>
                  )}

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Author */}
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-50">
                        <User size={12} className="text-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-text truncate">
                          @{revision.author.username}
                        </p>
                      {revision.author.isBanned && (
                          <p className="text-danger text-[10px]">Banlı</p>
                      )}
                      </div>
                    </div>

                    {/* Submitted time */}
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-info-50">
                        <Clock size={12} className="text-info" />
                      </div>
                      <span className="font-medium">
                        {formatDistanceToNow(new Date(revision.submittedAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                    </div>

                    {/* Categories */}
                    {revision.categories.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-2-50">
                          <Tag size={12} className="text-accent-2" />
                        </div>
                        <span className="font-medium truncate">
                        {revision.categories.map((cat) => cat.name).join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Previous feedback count */}
                    {revision.previousFeedbackCount > 0 && (
                      <div className="flex items-center gap-2 text-xs text-warn">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warn-50">
                          <MessageSquare size={12} />
                        </div>
                        <span className="font-medium">
                          {revision.previousFeedbackCount} önceki feedback
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <Link
                    to={`/admin/revisions/${revision.id}`}
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-text transition-all hover:border-accent hover:bg-accent-50 hover:text-accent"
                  >
                    Detay Gör
                  </Link>
                  
                  {statusFilter === 'REV_IN_REVIEW' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFeedbackClick(revision)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-warn-50 px-3 py-2 text-sm font-medium text-warn transition-all hover:bg-warn hover:text-white"
                      >
                        <MessageSquare size={14} />
                        Feedback
                      </button>
                      <button
                        onClick={() => handleApproveClick(revision)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-success-50 px-3 py-2 text-sm font-medium text-success transition-all hover:bg-success hover:text-white"
                      >
                        <Check size={14} />
                        Onayla
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Feedback Modal */}
      {showFeedbackModal && selectedRevision && (
        <FeedbackModal
          revision={selectedRevision}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedRevision(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
            setShowFeedbackModal(false);
            setSelectedRevision(null);
          }}
        />
      )}

      {/* Approve Dialog */}
      {showApproveDialog && selectedRevision && (
        <ApproveConfirmDialog
          revision={selectedRevision}
          isLoading={approveMutation.isPending}
          onConfirm={() => approveMutation.mutate(selectedRevision.id)}
          onCancel={() => {
            setShowApproveDialog(false);
            setSelectedRevision(null);
          }}
        />
      )}
    </div>
  );
}

