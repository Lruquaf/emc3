import { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  User,
  Calendar,
  Tag,
  MessageSquare,
  Check,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { tr } from 'date-fns/locale';

import { adminReviewApi } from '@/api/admin.api';
import { MarkdownPreview } from '@/components/editor/MarkdownPreview';
import { FeedbackModal } from '@/components/admin/FeedbackModal';
import { ApproveConfirmDialog } from '@/components/admin/ApproveConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { REVISION_STATUS_LABELS } from '@emc3/shared';

export function AdminRevisionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);

  const { data: revision, isLoading, error } = useQuery({
    queryKey: ['revisionDetail', id],
    queryFn: () => adminReviewApi.getRevisionDetail(id!),
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: () => adminReviewApi.approve(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisionDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
      queryClient.invalidateQueries({ queryKey: ['publishQueue'] });
      setShowApproveDialog(false);
    },
  });

  if (!id) {
    return <Navigate to="/admin/reviews" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !revision) {
    return (
      <div className="p-8">
        <div className="rounded-lg bg-danger/10 p-4 text-danger">
          Revision bulunamadı veya erişim izniniz yok.
        </div>
      </div>
    );
  }

  const canTakeAction = revision.status === 'REV_IN_REVIEW';

  return (
    <div className="p-8">
      {/* Back button */}
      <Link
        to="/admin/reviews"
        className="mb-6 inline-flex items-center gap-2 text-muted hover:text-text"
      >
        <ArrowLeft size={18} />
        İnceleme Kuyruğuna Dön
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              {revision.isNewArticle ? (
                <span className="rounded bg-success/10 px-2 py-1 text-xs text-success">
                  Yeni Makale
                </span>
              ) : (
                <span className="rounded bg-accent/10 px-2 py-1 text-xs text-accent">
                  Güncelleme
                </span>
              )}
              <span
                className={`rounded px-2 py-1 text-xs ${
                  revision.status === 'REV_IN_REVIEW'
                    ? 'bg-accent/10 text-accent'
                    : revision.status === 'REV_APPROVED'
                    ? 'bg-success/10 text-success'
                    : 'bg-warn/10 text-warn'
                }`}
              >
                {REVISION_STATUS_LABELS[revision.status]}
              </span>
            </div>

            <h1 className="font-serif text-3xl font-bold">{revision.title}</h1>

            {!revision.isNewArticle && revision.currentPublishedTitle && (
              <p className="mt-2 text-sm text-muted">
                Yayınlanan başlık: "{revision.currentPublishedTitle}"
              </p>
            )}
          </div>

          {/* Summary */}
          {revision.summary && (
            <div className="mb-6 rounded-lg border-l-4 border-accent bg-surface p-4">
              <h3 className="mb-2 text-sm font-medium text-muted">Özet</h3>
              <p className="text-text">{revision.summary}</p>
            </div>
          )}

          {/* Content */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-medium">İçerik</h3>
            <div className="rounded-lg border border-border bg-surface p-6">
              <MarkdownPreview
                content={revision.contentMarkdown}
                className="prose-lg"
              />
            </div>
          </div>

          {/* Bibliography */}
          {revision.bibliography && (
            <div className="mb-6">
              <h3 className="mb-4 text-lg font-medium">Kaynakça</h3>
              <div className="rounded-lg border border-border bg-surface p-6">
                <MarkdownPreview content={revision.bibliography} />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {canTakeAction && (
            <div className="rounded-lg border border-border bg-surface p-4">
              <h3 className="mb-4 font-medium">İşlemler</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowApproveDialog(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-success px-4 py-2 text-white hover:bg-success/90"
                >
                  <Check size={18} />
                  Onayla
                </button>
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-warn px-4 py-2 text-white hover:bg-warn/90"
                >
                  <MessageSquare size={18} />
                  Düzenleme İste
                </button>
              </div>
            </div>
          )}

          {/* Author Info */}
          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-4 font-medium">Yazar</h3>
            <div className="flex items-center gap-3">
              {revision.author.avatarUrl ? (
                <img
                  src={revision.author.avatarUrl}
                  alt={revision.author.username}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white">
                  {revision.author.username[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium">
                  {revision.author.displayName || `@${revision.author.username}`}
                </p>
                <p className="text-sm text-muted">@{revision.author.username}</p>
              </div>
            </div>
            {revision.author.isBanned && (
              <div className="mt-3 flex items-center gap-2 rounded bg-danger/10 p-2 text-sm text-danger">
                <AlertCircle size={16} />
                Bu kullanıcı banlanmış durumda
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-4 font-medium">Bilgiler</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-muted" />
                <span>
                  {revision.categories.map((c) => c.name).join(', ') || 'Kategori yok'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-muted" />
                <span>
                  Oluşturuldu:{' '}
                  {format(new Date(revision.createdAt), 'd MMM yyyy HH:mm', {
                    locale: tr,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-muted" />
                <span>
                  İncelemeye gönderildi:{' '}
                  {formatDistanceToNow(new Date(revision.submittedAt), {
                    addSuffix: true,
                    locale: tr,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback History */}
          {revision.feedbackHistory.length > 0 && (
            <div className="rounded-lg border border-border bg-surface p-4">
              <h3 className="mb-4 font-medium">Geri Bildirim Geçmişi</h3>
              <div className="space-y-3">
                {revision.feedbackHistory.map((feedback) => (
                  <div
                    key={feedback.id}
                    className={`rounded-lg p-3 text-sm ${
                      feedback.action === 'APPROVE'
                        ? 'bg-success/10'
                        : 'bg-warn/10'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium">
                        @{feedback.reviewerUsername}
                      </span>
                      <span className="text-xs text-muted">
                        {format(new Date(feedback.createdAt), 'd MMM HH:mm', {
                          locale: tr,
                        })}
                      </span>
                    </div>
                    {feedback.action === 'APPROVE' ? (
                      <p className="text-success">✓ Onaylandı</p>
                    ) : (
                      <p className="text-muted">{feedback.feedbackText}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showFeedbackModal && (
        <FeedbackModal
          revision={{
            id: revision.id,
            title: revision.title,
          }}
          onClose={() => setShowFeedbackModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['revisionDetail', id] });
            queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
            setShowFeedbackModal(false);
          }}
        />
      )}

      {showApproveDialog && (
        <ApproveConfirmDialog
          revision={{
            id: revision.id,
            title: revision.title,
          }}
          isLoading={approveMutation.isPending}
          onConfirm={() => approveMutation.mutate()}
          onCancel={() => setShowApproveDialog(false)}
        />
      )}
    </div>
  );
}

