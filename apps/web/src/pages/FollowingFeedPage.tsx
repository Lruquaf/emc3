import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus } from 'lucide-react';

import { useFollowingFeed } from '../hooks/useFeed';
import { FeedCard } from '../components/social/FeedCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

function FollowingFeedContent() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useFollowingFeed({ limit: 20 });

  const articles = useMemo(
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
        <Users className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
        <h3 className="text-lg font-medium text-neutral-900">
          Bir hata oluştu
        </h3>
        <p className="mt-2 text-neutral-600">
          Akış yüklenirken bir sorun oluştu.
        </p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
        <UserPlus className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
        <h3 className="text-lg font-medium text-neutral-900">
          Takip ettiğiniz kimse yok
        </h3>
        <p className="mt-2 text-neutral-600">
          Yazarları takip etmeye başlayarak kişiselleştirilmiş akışınızı oluşturun.
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
        {articles.map((article) => (
          <FeedCard key={article.id} article={article} showInteractions />
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

export function FollowingFeedPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Takip Akışı</h1>
        <p className="mt-2 text-neutral-600">
          Takip ettiğiniz yazarların en son makaleleri
        </p>
      </div>

      <FollowingFeedContent />
    </div>
  );
}

