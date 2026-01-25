import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Send, Trash2, Undo } from 'lucide-react';

import {
  useRevision,
  useUpdateRevision,
  useDeleteRevision,
  useSubmitRevision,
  useWithdrawRevision,
} from '../../hooks/useRevision';
import { useCreateRevision } from '../../hooks/useArticle';
import { EditorWithPreview } from '../../components/editor/EditorWithPreview';
import { RevisionStatus } from '../../components/revision/RevisionStatus';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorDisplay } from '../../components/ui/ErrorDisplay';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { CategoryTreePicker } from '../../components/category/CategoryTreePicker';
import { EDITABLE_STATUSES } from '@emc3/shared';
import type { RevisionStatus as RevisionStatusType } from '@emc3/shared';
import { FileText } from 'lucide-react';

export function RevisionEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: revision, isLoading, error, refetch } = useRevision(id!);
  const updateRevision = useUpdateRevision(id!);
  const deleteRevision = useDeleteRevision();
  const submitRevision = useSubmitRevision(id!);
  const withdrawRevision = useWithdrawRevision(id!);
  const createRevision = useCreateRevision();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [bibliography, setBibliography] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Sync form state with fetched data
  useEffect(() => {
    if (revision) {
      setTitle(revision.title);
      setSummary(revision.summary);
      setContent(revision.contentMarkdown);
      setBibliography(revision.bibliography || '');
      setSelectedCategories(revision.categories.map((c) => c.id));
    }
  }, [revision]);

  // Track changes
  useEffect(() => {
    if (revision) {
      const changed =
        title !== revision.title ||
        summary !== revision.summary ||
        content !== revision.contentMarkdown ||
        bibliography !== (revision.bibliography || '') ||
        JSON.stringify(selectedCategories.sort()) !==
          JSON.stringify(revision.categories.map((c) => c.id).sort());
      setHasChanges(changed);
    }
  }, [title, summary, content, bibliography, selectedCategories, revision]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !revision) {
    return <ErrorDisplay error={error} onRetry={() => refetch()} />;
  }

  const isEditable = EDITABLE_STATUSES.includes(revision.status as RevisionStatusType);
  const isWithdrawn = revision.status === 'REV_WITHDRAWN';
  const canSubmit = revision.status === 'REV_DRAFT' || revision.status === 'REV_CHANGES_REQUESTED';
  const canWithdraw = revision.status === 'REV_IN_REVIEW';
  const canDelete = revision.status === 'REV_DRAFT';

  const handleCreateNewDraft = async () => {
    await createRevision.mutateAsync(revision.articleId);
  };

  const handleSave = async () => {
    await updateRevision.mutateAsync({
      title,
      summary,
      contentMarkdown: content,
      bibliography,
      categoryIds: selectedCategories,
    });
  };

  const handleSubmit = async () => {
    if (hasChanges) {
      await handleSave();
    }
    await submitRevision.mutateAsync();
  };

  const handleWithdraw = async () => {
    await withdrawRevision.mutateAsync();
    setShowWithdrawDialog(false);
  };

  const handleDelete = async () => {
    await deleteRevision.mutateAsync(id!);
    setShowDeleteDialog(false);
  };

  const isValid =
    title.length >= 5 &&
    content.length >= 100 &&
    selectedCategories.length >= 1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header Card */}
      <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900">Düzenle</h1>
              <RevisionStatus status={revision.status as RevisionStatusType} />
            </div>
            <p className="text-sm text-neutral-500">
              Article ID: {revision.articleId}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleteRevision.isPending}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
              >
                <Trash2 size={16} />
                Sil
              </button>
            )}

            {canWithdraw && (
              <button
                onClick={() => setShowWithdrawDialog(true)}
                disabled={withdrawRevision.isPending}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 disabled:opacity-50"
              >
                <Undo size={16} />
                Geri Çek
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Withdrawn Alert */}
      {isWithdrawn && (
        <div className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <FileText className="h-6 w-6 text-neutral-500" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                Bu revizyon geri çekilmiş durumda
              </h3>
              <p className="mb-4 text-sm text-neutral-600">
                Geri çekilen bir revizyonu doğrudan düzenleyemezsiniz. Düzenlemeye devam etmek için
                yeni bir taslak oluşturmanız gerekiyor.
              </p>
              <button
                type="button"
                onClick={handleCreateNewDraft}
                disabled={createRevision.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createRevision.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    <span>Yeni Taslak Oluştur</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Alert */}
      {revision.lastReviewFeedback && revision.status === 'REV_CHANGES_REQUESTED' && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="mb-2 font-medium text-amber-800">
            Geri Bildirim ({revision.lastReviewFeedback.reviewerUsername})
          </h3>
          <p className="text-sm text-amber-700">
            {revision.lastReviewFeedback.feedbackText}
          </p>
        </div>
      )}

      <form className="space-y-6">
        {/* Title */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Başlık
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!isEditable}
            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-lg font-medium text-neutral-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-neutral-50 disabled:opacity-60"
          />
        </div>

        {/* Summary */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Özet
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            disabled={!isEditable}
            rows={3}
            className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-neutral-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-neutral-50 disabled:opacity-60"
          />
        </div>

        {/* Categories */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-2 block text-sm font-medium text-neutral-700">
            Kategoriler
          </div>
          {isEditable ? (
            <CategoryTreePicker
              selectedIds={selectedCategories}
              onChange={setSelectedCategories}
              maxSelections={5}
            />
          ) : (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex flex-wrap gap-2">
                {revision.categories.map((category) => (
                  <span
                    key={category.id}
                    className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            İçerik
          </label>
          <EditorWithPreview
            value={content}
            onChange={setContent}
            disabled={!isEditable}
          />
        </div>

        {/* Bibliography */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Kaynakça
          </label>
          <textarea
            value={bibliography}
            onChange={(e) => setBibliography(e.target.value)}
            disabled={!isEditable}
            rows={5}
            className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-4 py-2.5 font-mono text-sm text-neutral-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-neutral-50 disabled:opacity-60"
          />
        </div>

        {/* Actions */}
        {isEditable && (
          <div className="flex items-center justify-end gap-3 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <button
              type="button"
              onClick={() => navigate('/me/drafts')}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              İptal
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || !isValid || updateRevision.isPending}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 bg-white px-5 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateRevision.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Kaydet</span>
                </>
              )}
            </button>

            {canSubmit && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isValid || submitRevision.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitRevision.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>İncelemeye Gönder</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </form>

      {/* Withdraw Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showWithdrawDialog}
        onClose={() => setShowWithdrawDialog(false)}
        onConfirm={handleWithdraw}
        title="İncelemeden Geri Çek"
        message="İncelemeden geri çekmek istediğinize emin misiniz? Bu işlemden sonra revizyonunuz taslak durumuna dönecektir."
        confirmText="Geri Çek"
        cancelText="İptal"
        variant="warning"
        isLoading={withdrawRevision.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Taslağı Sil"
        message="Bu taslağı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        cancelText="İptal"
        variant="danger"
        isLoading={deleteRevision.isPending}
      />
    </div>
  );
}

