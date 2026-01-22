import { useState } from 'react';
import { MessageSquareText, TrendingUp, Clock } from 'lucide-react';

import {
  useOpinions,
  useCreateOpinion,
  useUpdateOpinion,
  useCreateReply,
  useUpdateReply,
} from '../../hooks/useOpinions';
import { OpinionCard } from './OpinionCard';
import { OpinionComposer } from './OpinionComposer';
import { OpinionList } from './OpinionList';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { cn } from '../../utils/cn';
import type { OpinionSortOption } from '@emc3/shared';

interface OpinionSectionProps {
  articleId: string;
  articleAuthorId: string;
}

export function OpinionSection({
  articleId,
  articleAuthorId,
}: OpinionSectionProps) {
  const [sort, setSort] = useState<OpinionSortOption>('helpful');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useOpinions({ articleId, sort, limit: 10 });

  const createOpinion = useCreateOpinion(articleId);
  const updateOpinion = useUpdateOpinion(articleId);
  const createReply = useCreateReply(articleId);
  const updateReply = useUpdateReply(articleId);

  const opinions = data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = data?.pages[0]?.meta.total ?? 0;
  const viewerOpinion = data?.pages[0]?.viewerOpinion;

  const handleCreateOpinion = async (bodyMarkdown: string) => {
    await createOpinion.mutateAsync(bodyMarkdown);
    refetch();
  };

  const handleUpdateOpinion = async (
    opinionId: string,
    bodyMarkdown: string
  ) => {
    await updateOpinion.mutateAsync({ opinionId, bodyMarkdown });
    refetch();
  };

  const handleCreateReply = async (opinionId: string, bodyMarkdown: string) => {
    await createReply.mutateAsync({ opinionId, bodyMarkdown });
    refetch();
  };

  const handleUpdateReply = async (opinionId: string, bodyMarkdown: string) => {
    await updateReply.mutateAsync({ opinionId, bodyMarkdown });
    refetch();
  };

  return (
    <section className="mt-12 border-t border-neutral-200 pt-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <MessageSquareText size={24} className="text-emerald-600" />
          <h2 className="text-xl font-bold text-neutral-900">
            Mütalaalar
            {totalCount > 0 && (
              <span className="ml-2 text-neutral-500">({totalCount})</span>
            )}
          </h2>
        </div>

        {/* Sort Toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1">
          <button
            onClick={() => setSort('helpful')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              sort === 'helpful'
                ? 'bg-emerald-100 text-emerald-700'
                : 'text-neutral-600 hover:bg-neutral-50'
            )}
          >
            <TrendingUp size={16} />
            En Faydalı
          </button>
          <button
            onClick={() => setSort('new')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              sort === 'new'
                ? 'bg-emerald-100 text-emerald-700'
                : 'text-neutral-600 hover:bg-neutral-50'
            )}
          >
            <Clock size={16} />
            En Yeni
          </button>
        </div>
      </div>

      {/* Opinion Composer */}
      <div className="mb-8">
        <OpinionComposer
          onSubmit={handleCreateOpinion}
          hasExistingOpinion={!!viewerOpinion}
          disabled={createOpinion.isPending}
        />
      </div>

      {/* Viewer's Own Opinion (highlighted) */}
      {viewerOpinion && (
        <div className="mb-6">
          <div className="mb-2 text-sm font-medium text-emerald-600">
            Sizin Mütalaanız
          </div>
          <OpinionCard
            opinion={viewerOpinion}
            onUpdate={(content) => handleUpdateOpinion(viewerOpinion.id, content)}
            onReply={(content) => handleCreateReply(viewerOpinion.id, content)}
            onReplyUpdate={(content) =>
              handleUpdateReply(viewerOpinion.id, content)
            }
            isHighlighted
          />
        </div>
      )}

      {/* Opinion List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : isError ? (
        <div className="py-8 text-center text-neutral-500">
          Mütalaalar yüklenirken bir hata oluştu.
        </div>
      ) : opinions.length === 0 && !viewerOpinion ? (
        <div className="py-8 text-center text-neutral-500">
          Henüz mütalaa yok. İlk mütalaa yazan siz olun!
        </div>
      ) : (
        <OpinionList
          opinions={opinions.filter((o) => o.id !== viewerOpinion?.id)}
          onUpdate={handleUpdateOpinion}
          onReply={handleCreateReply}
          onReplyUpdate={handleUpdateReply}
        />
      )}

      {/* Load More */}
      {hasNextPage && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            {isFetchingNextPage ? (
              <>
                <LoadingSpinner size="sm" />
                Yükleniyor...
              </>
            ) : (
              'Daha Fazla Yükle'
            )}
          </button>
        </div>
      )}
    </section>
  );
}

