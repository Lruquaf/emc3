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
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-text-muted">Revision yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !revision) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-danger-100 bg-danger-50 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-danger" size={24} />
            <div>
              <h3 className="font-semibold text-danger-dark">Revision Bulunamadı</h3>
              <p className="mt-1 text-sm text-danger-dark/80">
                Revision bulunamadı veya erişim izniniz yok.
              </p>
            </div>
          </div>
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
        className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text"
      >
        <ArrowLeft size={18} />
        İnceleme Kuyruğuna Dön
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header Card */}
          <div className="mb-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {revision.isNewArticle ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-dark">
                  <Tag size={12} />
                  Yeni Makale
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-3 py-1 text-xs font-medium text-gold">
                  <Tag size={12} />
                  Güncelleme
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                  revision.status === 'REV_IN_REVIEW'
                    ? 'bg-info-50 text-info-dark'
                    : revision.status === 'REV_APPROVED'
                    ? 'bg-success-50 text-success-dark'
                    : 'bg-warn-50 text-warn-dark'
                }`}
              >
                {REVISION_STATUS_LABELS[revision.status]}
              </span>
            </div>

            <h1 className="mb-3 font-serif text-3xl font-bold text-text leading-tight">
              {revision.title}
            </h1>

            {!revision.isNewArticle && revision.currentPublishedTitle && (
              <div className="rounded-lg border border-border-light bg-bg-secondary p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-1">
                  Mevcut Yayınlanan Başlık
                </p>
                <p className="text-sm text-text-secondary">
                  "{revision.currentPublishedTitle}"
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          {revision.summary && (
            <div className="mb-6 rounded-xl border-l-4 border-accent bg-accent-50/30 p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50">
                  <MessageSquare size={16} className="text-accent" />
                </div>
                <h3 className="font-semibold text-text">Özet</h3>
              </div>
              <p className="text-text leading-relaxed">{revision.summary}</p>
            </div>
          )}

          {/* Content */}
          <div className="mb-6 rounded-xl border border-border bg-surface shadow-sm">
            <div className="border-b border-divider px-6 py-4">
              <h3 className="font-serif text-xl font-semibold text-text">İçerik</h3>
            </div>
            <div className="p-6">
              <MarkdownPreview
                content={revision.contentMarkdown}
                className="prose-lg prose-headings:font-serif"
              />
            </div>
          </div>

          {/* Bibliography */}
          {revision.bibliography && (
            <div className="mb-6 rounded-xl border border-border bg-surface shadow-sm">
              <div className="border-b border-divider px-6 py-4">
                <div className="flex items-center gap-2">
                  <Tag size={18} className="text-accent" />
                  <h3 className="font-serif text-xl font-semibold text-text">Kaynakça</h3>
                </div>
              </div>
              <div className="p-6">
                <MarkdownPreview content={revision.bibliography} />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {canTakeAction && (
            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Check size={18} className="text-accent" />
                <h3 className="font-semibold text-text">İşlemler</h3>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setShowApproveDialog(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-success px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-success-600 hover:shadow-md"
                >
                  <Check size={18} />
                  Onayla ve Yayın Kuyruğuna Ekle
                </button>
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-warn bg-warn-50 px-4 py-3 text-sm font-medium text-warn transition-all hover:bg-warn hover:text-white hover:border-warn"
                >
                  <MessageSquare size={18} />
                  Düzenleme İste
                </button>
              </div>
              <p className="mt-4 text-xs text-text-muted leading-relaxed">
                Bu revision şu anda inceleme aşamasında. Onaylayabilir veya düzenleme isteyebilirsiniz.
              </p>
            </div>
          )}

          {/* Author Info */}
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <User size={18} className="text-accent" />
              <h3 className="font-semibold text-text">Yazar</h3>
            </div>
            <div className="flex items-center gap-3">
              {revision.author.avatarUrl ? (
                <img
                  src={revision.author.avatarUrl}
                  alt={revision.author.username}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg font-semibold text-white ring-2 ring-accent-50">
                  {revision.author.username[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text truncate">
                  {revision.author.displayName || `@${revision.author.username}`}
                </p>
                <p className="text-sm text-text-muted">@{revision.author.username}</p>
              </div>
            </div>
            {revision.author.isBanned && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-danger-100 bg-danger-50 p-3">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-danger" />
                <div>
                  <p className="text-sm font-medium text-danger-dark">Banlı Kullanıcı</p>
                  <p className="mt-0.5 text-xs text-danger-dark/80">
                    Bu kullanıcı banlanmış durumda
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-accent" />
              <h3 className="font-semibold text-text">Bilgiler</h3>
            </div>
            <div className="space-y-4">
              {/* Categories */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                  Kategoriler
                </p>
                {revision.categories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {revision.categories.map((category) => (
                      <span
                        key={category.id}
                        className="inline-flex items-center gap-1 rounded-full bg-accent-2-50 px-2.5 py-1 text-xs font-medium text-accent-2-dark"
                      >
                        <Tag size={12} />
                        {category.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">Kategori yok</p>
                )}
              </div>

              {/* Timeline */}
              <div className="space-y-3 border-t border-divider pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info-50">
                    <Calendar size={14} className="text-info" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                      Oluşturuldu
                    </p>
                    <p className="mt-0.5 text-sm text-text">
                      {format(new Date(revision.createdAt), 'd MMMM yyyy, HH:mm', {
                        locale: tr,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50">
                    <Calendar size={14} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                      İncelemeye Gönderildi
                    </p>
                    <p className="mt-0.5 text-sm text-text">
                      {formatDistanceToNow(new Date(revision.submittedAt), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      ({format(new Date(revision.submittedAt), 'd MMM yyyy, HH:mm', {
                        locale: tr,
                      })})
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback History */}
          {revision.feedbackHistory.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquare size={18} className="text-accent" />
                <h3 className="font-semibold text-text">Geri Bildirim Geçmişi</h3>
                <span className="ml-auto rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent">
                  {revision.feedbackHistory.length}
                </span>
              </div>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
                
                <div className="space-y-4">
                  {revision.feedbackHistory.map((feedback, index) => (
                    <div key={feedback.id} className="relative flex gap-4">
                      {/* Timeline dot */}
                      <div className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        feedback.action === 'APPROVE'
                          ? 'bg-success-50 ring-2 ring-success-100'
                          : 'bg-warn-50 ring-2 ring-warn-100'
                      }`}>
                        {feedback.action === 'APPROVE' ? (
                          <Check size={12} className="text-success" />
                        ) : (
                          <MessageSquare size={12} className="text-warn" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className={`flex-1 rounded-lg p-3 ${
                        feedback.action === 'APPROVE'
                          ? 'bg-success-50 border border-success-100'
                          : 'bg-warn-50 border border-warn-100'
                      }`}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-text">
                            @{feedback.reviewerUsername}
                          </span>
                          <span className="text-xs text-text-muted">
                            {format(new Date(feedback.createdAt), 'd MMM yyyy, HH:mm', {
                              locale: tr,
                            })}
                          </span>
                        </div>
                        {feedback.action === 'APPROVE' ? (
                          <div className="flex items-center gap-2">
                            <Check size={14} className="text-success" />
                            <p className="text-sm font-medium text-success-dark">Onaylandı</p>
                          </div>
                        ) : (
                          <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">
                            {feedback.feedbackText}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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

