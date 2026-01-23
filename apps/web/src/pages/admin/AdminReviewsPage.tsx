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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-3 font-serif text-3xl font-bold text-text">
          <FileSearch className="text-accent" size={32} />
          İnceleme Kuyruğu
        </h1>
        <p className="mt-2 text-muted">
          İnceleme bekleyen ve düzenleme istenen revision'ları yönetin.
        </p>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setStatusFilter('REV_IN_REVIEW')}
          className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
            statusFilter === 'REV_IN_REVIEW'
              ? 'bg-accent text-white shadow-sm hover:bg-accent/90'
              : 'bg-surface border border-border text-muted hover:bg-accent/5 hover:border-accent/30 hover:text-accent'
          }`}
        >
          İnceleme Bekliyor
        </button>
        <button
          onClick={() => setStatusFilter('REV_CHANGES_REQUESTED')}
          className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
            statusFilter === 'REV_CHANGES_REQUESTED'
              ? 'bg-warn text-white shadow-sm hover:bg-warn/90'
              : 'bg-surface border border-border text-muted hover:bg-warn/10 hover:border-warn/30 hover:text-warn'
          }`}
        >
          Düzenleme İstendi
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-danger">
          <p className="font-medium">Bir hata oluştu. Lütfen tekrar deneyin.</p>
        </div>
      ) : !data?.items.length ? (
        <div className="rounded-lg border border-border bg-surface p-12 text-center shadow-sm">
          <FileSearch size={48} className="mx-auto mb-4 text-muted" />
          <h3 className="mb-2 font-serif text-lg font-semibold text-text">Kuyruk Boş</h3>
          <p className="text-muted">
            {statusFilter === 'REV_IN_REVIEW'
              ? 'İnceleme bekleyen revision yok.'
              : 'Düzenleme isteyen revision yok.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map((revision) => (
            <div
              key={revision.id}
              className="rounded-lg border border-border bg-surface p-6 shadow-sm transition-all hover:shadow-md hover:border-accent/30"
            >
              <div className="flex items-start justify-between gap-6">
                {/* Left: Info */}
                <div className="flex-1 min-w-0">
                  <div className="mb-3 flex items-center gap-2 flex-wrap">
                    {revision.isUpdate && (
                      <span className="inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success ring-1 ring-inset ring-success/30">
                        Güncelleme
                      </span>
                    )}
                    <Link
                      to={`/admin/revisions/${revision.id}?from=review`}
                      className="font-serif text-xl font-semibold text-text hover:text-accent transition-colors line-clamp-2"
                    >
                      {revision.title}
                    </Link>
                  </div>

                  {revision.summary && (
                    <p className="mb-4 text-sm text-muted line-clamp-3 leading-relaxed">
                      {revision.summary}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
                    {/* Author */}
                    <div className="flex items-center gap-1.5">
                      <User size={14} className="text-muted" />
                      <span className="font-medium">@{revision.author.username}</span>
                      {revision.author.isBanned && (
                        <span className="rounded-full bg-danger/15 px-1.5 py-0.5 text-xs font-semibold text-danger ring-1 ring-inset ring-danger/20">
                          Banlı
                        </span>
                      )}
                    </div>

                    {/* Submitted time */}
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-muted" />
                      <span>
                        {formatDistanceToNow(new Date(revision.submittedAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                    </div>

                    {/* Categories */}
                    {revision.categories.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Tag size={14} className="text-muted" />
                        <span className="font-medium">
                          {revision.categories.map((cat) => cat.name).join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Previous feedback count */}
                    {revision.previousFeedbackCount > 0 && (
                      <div className="flex items-center gap-1.5 text-warn">
                        <MessageSquare size={14} />
                        <span className="font-medium">{revision.previousFeedbackCount} önceki feedback</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/admin/revisions/${revision.id}?from=review`}
                    className="inline-flex items-center rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text shadow-sm hover:bg-accent/5 hover:border-accent/40 hover:text-accent transition-all"
                  >
                    Detay
                  </Link>
                  
                  {statusFilter === 'REV_IN_REVIEW' && (
                    <>
                      <button
                        onClick={() => handleFeedbackClick(revision)}
                        className="inline-flex items-center gap-1.5 rounded-lg border-2 border-warn/40 bg-warn/15 px-4 py-2.5 text-sm font-semibold text-warn hover:bg-warn/25 hover:border-warn/60 transition-all shadow-sm"
                      >
                        <MessageSquare size={16} />
                        Feedback
                      </button>
                      <button
                        onClick={() => handleApproveClick(revision)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-white hover:bg-success/90 shadow-md hover:shadow-lg transition-all"
                      >
                        <Check size={16} />
                        Onayla
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total count */}
      {data && (
        <div className="mt-6 rounded-lg bg-accent/5 border border-border px-4 py-3">
          <p className="text-sm font-medium text-text">
            Toplam <span className="text-accent font-semibold">{data.meta.totalCount}</span> revision
          </p>
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

