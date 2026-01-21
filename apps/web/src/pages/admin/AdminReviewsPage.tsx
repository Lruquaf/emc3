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
        <h1 className="flex items-center gap-3 font-serif text-3xl font-bold">
          <FileSearch className="text-accent" />
          İnceleme Kuyruğu
        </h1>
        <p className="mt-2 text-muted">
          İnceleme bekleyen ve düzenleme istenen revision'ları yönetin.
        </p>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setStatusFilter('REV_IN_REVIEW')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            statusFilter === 'REV_IN_REVIEW'
              ? 'bg-accent text-white'
              : 'bg-surface text-muted hover:text-text'
          }`}
        >
          İnceleme Bekliyor
        </button>
        <button
          onClick={() => setStatusFilter('REV_CHANGES_REQUESTED')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            statusFilter === 'REV_CHANGES_REQUESTED'
              ? 'bg-warn text-white'
              : 'bg-surface text-muted hover:text-text'
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
        <div className="rounded-lg bg-danger/10 p-4 text-danger">
          Bir hata oluştu. Lütfen tekrar deneyin.
        </div>
      ) : !data?.items.length ? (
        <div className="rounded-lg bg-surface p-8 text-center">
          <FileSearch size={48} className="mx-auto mb-4 text-muted" />
          <h3 className="mb-2 text-lg font-medium">Kuyruk Boş</h3>
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
              className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/50"
            >
              <div className="flex items-start justify-between">
                {/* Left: Info */}
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    {revision.isUpdate && (
                      <span className="rounded bg-accent/10 px-2 py-0.5 text-xs text-accent">
                        Güncelleme
                      </span>
                    )}
                    <Link
                      to={`/admin/revisions/${revision.id}`}
                      className="font-medium text-text hover:text-accent"
                    >
                      {revision.title}
                    </Link>
                  </div>

                  <p className="mb-3 text-sm text-muted line-clamp-2">
                    {revision.summary || 'Özet yok'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                    {/* Author */}
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>@{revision.author.username}</span>
                      {revision.author.isBanned && (
                        <span className="text-danger">(Banlı)</span>
                      )}
                    </div>

                    {/* Submitted time */}
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>
                        {formatDistanceToNow(new Date(revision.submittedAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                    </div>

                    {/* Categories */}
                    {revision.categories.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag size={14} />
                        {revision.categories.map((cat) => cat.name).join(', ')}
                      </div>
                    )}

                    {/* Previous feedback count */}
                    {revision.previousFeedbackCount > 0 && (
                      <div className="flex items-center gap-1 text-warn">
                        <MessageSquare size={14} />
                        <span>{revision.previousFeedbackCount} önceki feedback</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="ml-4 flex gap-2">
                  <Link
                    to={`/admin/revisions/${revision.id}`}
                    className="rounded-lg bg-surface border border-border px-3 py-2 text-sm text-muted hover:bg-bg hover:text-text"
                  >
                    Detay
                  </Link>
                  
                  {statusFilter === 'REV_IN_REVIEW' && (
                    <>
                      <button
                        onClick={() => handleFeedbackClick(revision)}
                        className="rounded-lg bg-warn/10 px-3 py-2 text-sm text-warn hover:bg-warn/20"
                      >
                        <MessageSquare size={16} className="mr-1 inline" />
                        Feedback
                      </button>
                      <button
                        onClick={() => handleApproveClick(revision)}
                        className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success hover:bg-success/20"
                      >
                        <Check size={16} className="mr-1 inline" />
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
        <div className="mt-4 text-sm text-muted">
          Toplam {data.meta.totalCount} revision
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

