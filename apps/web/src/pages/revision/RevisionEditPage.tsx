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
import { EditorWithPreview } from '../../components/editor/EditorWithPreview';
import { RevisionStatus } from '../../components/revision/RevisionStatus';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorDisplay } from '../../components/ui/ErrorDisplay';
import { EDITABLE_STATUSES } from '@emc3/shared';
import type { RevisionStatus as RevisionStatusType } from '@emc3/shared';

// TODO: Replace with actual categories API
const MOCK_CATEGORIES = [
  { id: '1', name: 'Fıkıh', slug: 'fikih' },
  { id: '2', name: 'Hadis', slug: 'hadis' },
  { id: '3', name: 'Tefsir', slug: 'tefsir' },
  { id: '4', name: 'Akaid', slug: 'akaid' },
  { id: '5', name: 'Siyer', slug: 'siyer' },
];

export function RevisionEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: revision, isLoading, error, refetch } = useRevision(id!);
  const updateRevision = useUpdateRevision(id!);
  const deleteRevision = useDeleteRevision();
  const submitRevision = useSubmitRevision(id!);
  const withdrawRevision = useWithdrawRevision(id!);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [bibliography, setBibliography] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

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
  const canSubmit = revision.status === 'REV_DRAFT' || revision.status === 'REV_CHANGES_REQUESTED';
  const canWithdraw = revision.status === 'REV_IN_REVIEW';
  const canDelete = revision.status === 'REV_DRAFT';

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((cid) => cid !== categoryId)
        : prev.length < 5
        ? [...prev, categoryId]
        : prev
    );
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
    if (confirm('İncelemeden geri çekmek istediğinize emin misiniz?')) {
      await withdrawRevision.mutateAsync();
    }
  };

  const handleDelete = async () => {
    if (confirm('Bu taslağı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      await deleteRevision.mutateAsync(id!);
    }
  };

  const isValid =
    title.length >= 5 &&
    content.length >= 100 &&
    selectedCategories.length >= 1;

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Düzenle
              </h1>
              <RevisionStatus status={revision.status as RevisionStatusType} />
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              /{revision.articleSlug}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleteRevision.isPending}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
              >
                <Trash2 size={16} />
                Sil
              </button>
            )}

            {canWithdraw && (
              <button
                onClick={handleWithdraw}
                disabled={withdrawRevision.isPending}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
              >
                <Undo size={16} />
                Geri Çek
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {revision.lastReviewFeedback && revision.status === 'REV_CHANGES_REQUESTED' && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
            <h3 className="mb-2 font-medium text-amber-800 dark:text-amber-300">
              Geri Bildirim ({revision.lastReviewFeedback.reviewerUsername})
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              {revision.lastReviewFeedback.feedbackText}
            </p>
          </div>
        )}

        <form className="space-y-6">
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Başlık
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isEditable}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-lg font-medium text-neutral-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:disabled:bg-neutral-900"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Özet
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={!isEditable}
              rows={3}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:disabled:bg-neutral-900"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Kategoriler
            </label>
            <div className="flex flex-wrap gap-2">
              {MOCK_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => isEditable && toggleCategory(category.id)}
                  disabled={!isEditable}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                    selectedCategories.includes(category.id)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 disabled:hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              İçerik
            </label>
            <EditorWithPreview
              value={content}
              onChange={setContent}
              disabled={!isEditable}
            />
          </div>

          {/* Bibliography */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Kaynakça
            </label>
            <textarea
              value={bibliography}
              onChange={(e) => setBibliography(e.target.value)}
              disabled={!isEditable}
              rows={5}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 font-mono text-sm text-neutral-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:disabled:bg-neutral-900"
            />
          </div>

          {/* Actions */}
          {isEditable && (
            <div className="flex items-center justify-end gap-4 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <button
                type="button"
                onClick={() => navigate('/me/drafts')}
                className="rounded-lg px-6 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                İptal
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges || !isValid || updateRevision.isPending}
                className="flex items-center gap-2 rounded-lg border border-emerald-600 px-6 py-2.5 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
              >
                {updateRevision.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Save size={16} />
                )}
                Kaydet
              </button>

              {canSubmit && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isValid || submitRevision.isPending}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitRevision.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Send size={16} />
                  )}
                  İncelemeye Gönder
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

