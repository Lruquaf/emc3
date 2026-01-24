import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Clock, TrendingUp, X } from 'lucide-react';

import { useGlobalFeed } from '../hooks/useFeed';
import { FeedCard } from '../components/social/FeedCard';
import { CategoryFilter } from '../components/category/CategoryFilter';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useDebounce } from '../hooks/useDebounce';
import { cn } from '../utils/cn';
import type { FeedSortOption } from '@emc3/shared';

export function FeedPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('query') || '');
  const debouncedSearchInput = useDebounce(searchInput, 500);

  const query = searchParams.get('query') || undefined;
  const category = searchParams.get('category') || undefined;
  const sort = (searchParams.get('sort') as FeedSortOption) || 'new';

  // Update URL when debounced search input changes
  useEffect(() => {
    setSearchParams((prevParams) => {
      const params = new URLSearchParams(prevParams);
      const trimmedInput = debouncedSearchInput.trim();
      if (trimmedInput) {
        params.set('query', trimmedInput);
      } else {
        params.delete('query');
      }
      return params;
    }, { replace: true });
  }, [debouncedSearchInput, setSearchParams]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useGlobalFeed({
    query,
    category,
    sort,
    limit: 20,
  });

  const articles = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const handleSortChange = (newSort: FeedSortOption) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    setSearchParams(params);
  };

  const handleCategoryChange = (categorySlug: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (categorySlug) {
      params.set('category', categorySlug);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is now handled automatically via debounce, but we keep this for Enter key support
    // The debounced effect will handle the actual search
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Keşfet</h1>
        <p className="mt-2 text-neutral-600">
          İlmî makaleler, akademik içerikler ve daha fazlası
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Başlık veya özet ara..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-10 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                aria-label="Aramayı temizle"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Category Filter */}
          <CategoryFilter
            selectedSlug={category ?? null}
            onSelect={(slug) => handleCategoryChange(slug ?? undefined)}
          />

          {/* Sort Toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1">
            <button
              onClick={() => handleSortChange('new')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                sort === 'new'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-neutral-600 hover:bg-neutral-50'
              )}
            >
              <Clock className="h-4 w-4" />
              En Yeni
            </button>
            <button
              onClick={() => handleSortChange('popular')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                sort === 'popular'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-neutral-600 hover:bg-neutral-50'
              )}
            >
              <TrendingUp className="h-4 w-4" />
              Popüler
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
          <h3 className="text-lg font-medium text-neutral-900">
            Makaleler yüklenirken hata oluştu
          </h3>
          <p className="mt-2 text-neutral-600">
            Bağlantı veya sunucu kaynaklı bir sorun olabilir. Lütfen tekrar deneyin.
          </p>
          {import.meta.env.DEV && error && (
            <p className="mt-2 text-left text-sm text-rose-600 font-mono max-w-xl mx-auto">
              {typeof error === 'object' && 'message' in error
                ? String((error as { message?: string }).message)
                : String(error)}
            </p>
          )}
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
          >
            Tekrar Dene
          </button>
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
          <h3 className="text-lg font-medium text-neutral-900">
            Sonuç bulunamadı
          </h3>
          <p className="mt-2 text-neutral-600">
            {query && category
              ? `"${query}" için bu kategoride sonuç yok. Filtreleri değiştirmeyi deneyin.`
              : query
                ? `"${query}" için sonuç bulunamadı.`
                : category
                  ? 'Bu kategoride henüz makale yok.'
                  : 'Henüz yayınlanmış makale bulunmuyor.'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {articles.map((article) => (
              <FeedCard key={article.id} article={article} showInteractions />
            ))}
          </div>

          {/* Load More */}
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
      )}
    </div>
  );
}

