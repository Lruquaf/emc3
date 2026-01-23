import { useState } from 'react';

import { useOpinions, useCreateOpinion, useUpdateOpinion, useCreateReply, useUpdateReply } from '../../hooks/useOpinions';
import { OpinionComposer } from './OpinionComposer';
import { OpinionList } from './OpinionList';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorDisplay } from '../ui/ErrorDisplay';

interface OpinionSectionProps {
  articleId: string;
  articleAuthorId: string;
}

export function OpinionSection({ articleId, articleAuthorId }: OpinionSectionProps) {
  const [sort, setSort] = useState<'helpful' | 'new'>('helpful');

  const {
    data: opinionsData,
    isLoading,
    error,
    refetch,
  } = useOpinions(articleId, { sort, limit: 20 });

  const createOpinionMutation = useCreateOpinion();
  const updateOpinionMutation = useUpdateOpinion();
  const createReplyMutation = useCreateReply();
  const updateReplyMutation = useUpdateReply();

  const handleCreateOpinion = async (bodyMarkdown: string) => {
    await createOpinionMutation.mutateAsync({
      articleId,
      input: { bodyMarkdown },
    });
  };

  const handleUpdateOpinion = async (opinionId: string, bodyMarkdown: string) => {
    await updateOpinionMutation.mutateAsync({
      opinionId,
      input: { bodyMarkdown },
    });
  };

  const handleCreateReply = async (opinionId: string, bodyMarkdown: string) => {
    await createReplyMutation.mutateAsync({
      opinionId,
      input: { bodyMarkdown },
    });
  };

  const handleUpdateReply = async (opinionId: string, bodyMarkdown: string) => {
    await updateReplyMutation.mutateAsync({
      opinionId,
      input: { bodyMarkdown },
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <ErrorDisplay error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  const opinions = opinionsData?.items ?? [];
  const viewerOpinion = opinionsData?.viewerOpinion;
  const hasViewerOpinion = !!viewerOpinion;

  // Safety check
  if (!Array.isArray(opinions)) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="text-center text-neutral-500">
          <p>Mütalaalar yüklenirken bir hata oluştu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">
          Mütalaalar
          {opinionsData?.meta.total !== undefined && (
            <span className="ml-2 text-lg font-normal text-neutral-500">
              ({opinionsData.meta.total})
            </span>
          )}
        </h2>

        {/* Sort buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setSort('helpful')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              sort === 'helpful'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            En Faydalı
          </button>
          <button
            onClick={() => setSort('new')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              sort === 'new'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            En Yeni
          </button>
        </div>
      </div>

      {/* Opinion Composer */}
      {!hasViewerOpinion && (
        <div className="mb-6">
          <OpinionComposer
            onSubmit={handleCreateOpinion}
            hasExistingOpinion={hasViewerOpinion}
            disabled={createOpinionMutation.isPending}
          />
        </div>
      )}

      {/* Opinion List */}
      <OpinionList
        opinions={opinions}
        onUpdate={(opinionId, bodyMarkdown) => handleUpdateOpinion(opinionId, bodyMarkdown)}
        onReply={(opinionId, bodyMarkdown) => handleCreateReply(opinionId, bodyMarkdown)}
        onReplyUpdate={(opinionId, bodyMarkdown) => handleUpdateReply(opinionId, bodyMarkdown)}
        onRemove={() => refetch()}
        highlightedOpinionId={viewerOpinion?.id}
      />
    </div>
  );
}
