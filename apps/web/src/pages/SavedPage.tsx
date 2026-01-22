import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';

import { useSavedArticles } from '../hooks/useSave';
import { FeedCard } from '../components/social/FeedCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

/**
 * Format date as relative time
 */
function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} dakika önce`;
    }
    return `${diffHours} saat önce`;
  }

  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;

  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function SavedContent() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useSavedArticles({ limit: 20 });

  const savedItems = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
        <Bookmark className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
        <h3 className="text-lg font-medium text-neutral-900">
          Bir hata oluştu
        </h3>
        <p className="mt-2 text-neutral-600">
          Kaydedilenler yüklenirken bir sorun oluştu.
        </p>
      </div>
    );
  }

  if (savedItems.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
        <Bookmark className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
        <h3 className="text-lg font-medium text-neutral-900">
          Henüz kaydedilen makale yok
        </h3>
        <p className="mt-2 text-neutral-600">
          Beğendiğiniz makaleleri kaydedin ve daha sonra okuyun.
        </p>
        <Link
          to="/feed"
          className="mt-4 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Keşfete Git
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {savedItems.map((item) => (
          <div key={item.article.id}>
            <div className="mb-2 text-xs text-neutral-500">
              {formatRelativeDate(item.savedAt)} kaydedildi
            </div>
            <FeedCard article={item.article} showInteractions />
          </div>
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-6 py-2.5 font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
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
    </>
  );
}

export function SavedPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-full bg-amber-100 p-3">
          <Bookmark className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Kaydedilenler
          </h1>
          <p className="text-neutral-600">
            Daha sonra okumak için kaydettiğiniz makaleler
          </p>
        </div>
      </div>

      <SavedContent />
    </div>
  );
}

