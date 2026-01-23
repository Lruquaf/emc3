import { useState } from 'react';
import { useParams, Navigate, Link, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  
  const fromPage = searchParams.get('from');
  const backUrl = fromPage === 'publish' ? '/admin/publish-queue' : '/admin/reviews';
  const backLabel = fromPage === 'publish' ? 'Yayın Kuyruğuna Dön' : 'İnceleme Kuyruğuna Dön';

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
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-danger">
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
        to={backUrl}
        className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-muted hover:text-accent hover:bg-accent/5 transition-all font-medium"
      >
        <ArrowLeft size={18} />
        {backLabel}
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              {revision.isNewArticle ? (
                <span className="inline-flex items-center rounded-full bg-accent-2/15 px-2.5 py-0.5 text-xs font-semibold text-accent-2 ring-1 ring-inset ring-accent-2/30">
                  Yeni Makale
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success ring-1 ring-inset ring-success/30">
                  Güncelleme
                </span>
              )}
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                  revision.status === 'REV_IN_REVIEW'
                    ? 'bg-accent/15 text-accent ring-accent/30'
                    : revision.status === 'REV_APPROVED'
                    ? 'bg-success/15 text-success ring-success/30'
                    : 'bg-warn/15 text-warn ring-warn/30'
                }`}
              >
                {REVISION_STATUS_LABELS[revision.status]}
              </span>
            </div>

            <h1 className="font-serif text-3xl font-bold text-text leading-tight">{revision.title}</h1>

            {!revision.isNewArticle && revision.currentPublishedTitle && (
              <p className="mt-3 text-sm text-muted">
                Yayınlanan başlık: <span className="italic">"{revision.currentPublishedTitle}"</span>
              </p>
            )}
          </div>

          {/* Summary */}
          {revision.summary && (
            <div className="mb-6 rounded-lg border-l-4 border-accent bg-accent/5 p-5">
              <h3 className="mb-2 text-sm font-semibold text-accent uppercase tracking-wide">Özet</h3>
              <p className="text-text leading-relaxed">{revision.summary}</p>
            </div>
          )}

          {/* Content */}
          <div className="mb-6">
            <h3 className="mb-4 font-serif text-xl font-semibold text-text">İçerik</h3>
            <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
              <MarkdownPreview
                content={revision.contentMarkdown}
                className="prose-lg prose-headings:font-serif prose-headings:text-text prose-p:text-text prose-p:leading-relaxed"
              />
            </div>
          </div>

          {/* Bibliography */}
          {revision.bibliography && (
            <div className="mb-6">
              <h3 className="mb-4 font-serif text-xl font-semibold text-text">Kaynakça</h3>
              <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
                <MarkdownPreview 
                  content={revision.bibliography}
                  className="prose prose-headings:font-serif prose-headings:text-text prose-p:text-text prose-p:leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {canTakeAction && (
            <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-4 font-semibold text-text">İşlemler</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowApproveDialog(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-white hover:bg-success/90 shadow-md hover:shadow-lg transition-all"
                >
                  <Check size={18} />
                  Onayla
                </button>
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-warn px-4 py-2.5 text-sm font-semibold text-white hover:bg-warn/90 shadow-md hover:shadow-lg transition-all"
                >
                  <MessageSquare size={18} />
                  Düzenleme İste
                </button>
              </div>
            </div>
          )}

          {/* Author Info */}
          <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-text">Yazar</h3>
            <div className="flex items-center gap-3">
              {revision.author.avatarUrl ? (
                <img
                  src={revision.author.avatarUrl}
                  alt={revision.author.username}
                  className="h-12 w-12 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white font-semibold">
                  {revision.author.username[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-text truncate">
                  {revision.author.displayName || `@${revision.author.username}`}
                </p>
                <p className="text-sm text-muted">@{revision.author.username}</p>
              </div>
            </div>
            {revision.author.isBanned && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-2.5 text-sm text-danger">
                <AlertCircle size={16} />
                <span className="font-medium">Bu kullanıcı banlanmış durumda</span>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-text">Bilgiler</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <Tag size={16} className="text-muted mt-0.5 flex-shrink-0" />
                <span className="text-text">
                  {revision.categories.map((c) => c.name).join(', ') || <span className="text-muted italic">Kategori yok</span>}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Calendar size={16} className="text-muted mt-0.5 flex-shrink-0" />
                <span className="text-text">
                  <span className="text-muted">Oluşturuldu:</span>{' '}
                  {format(new Date(revision.createdAt), 'd MMM yyyy HH:mm', {
                    locale: tr,
                  })}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Calendar size={16} className="text-muted mt-0.5 flex-shrink-0" />
                <span className="text-text">
                  <span className="text-muted">İncelemeye gönderildi:</span>{' '}
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
            <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
              <h3 className="mb-4 font-semibold text-text">Geri Bildirim Geçmişi</h3>
              <div className="space-y-3">
                {revision.feedbackHistory.map((feedback) => (
                  <div
                    key={feedback.id}
                    className={`rounded-lg border p-4 text-sm ${
                      feedback.action === 'APPROVE'
                        ? 'border-success/30 bg-success/10'
                        : 'border-warn/30 bg-warn/10'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold text-text">
                        @{feedback.reviewerUsername}
                      </span>
                      <span className="text-xs text-muted">
                        {format(new Date(feedback.createdAt), 'd MMM HH:mm', {
                          locale: tr,
                        })}
                      </span>
                    </div>
                    {feedback.action === 'APPROVE' ? (
                      <p className="text-success font-medium">✓ Onaylandı</p>
                    ) : (
                      <p className="text-text leading-relaxed">{feedback.feedbackText}</p>
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

