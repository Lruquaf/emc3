import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Trash2, RotateCcw, ExternalLink, X } from 'lucide-react';

import { adminArticlesApi } from '../../api/admin.api';
import { useDebounce } from '../../hooks/useDebounce';
import { Select } from '../../components/ui';
import type { AdminArticleDTO } from '@emc3/shared';

export function AdminArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const queryFromUrl = searchParams.get('query') || '';
  const [searchInput, setSearchInput] = useState(queryFromUrl);
  const debouncedSearchInput = useDebounce(searchInput, 500);
  const [removeModal, setRemoveModal] = useState<{ article: AdminArticleDTO; reason: string } | null>(null);

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
      params.set('page', '1');
      return params;
    }, { replace: true });
  }, [debouncedSearchInput, setSearchParams]);

  const page = parseInt(searchParams.get('page') || '1');
  const statusFilter = searchParams.get('status') as 'PUBLISHED' | 'REMOVED' | undefined;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'articles', { query: queryFromUrl, status: statusFilter, page }],
    queryFn: () =>
      adminArticlesApi.list({
        query: queryFromUrl || undefined,
        status: statusFilter,
        page,
        limit: 20,
      }),
  });

  const removeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminArticlesApi.remove(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
      setRemoveModal(null);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => adminArticlesApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is now handled automatically via debounce, but we keep this for Enter key support
    // The debounced effect will handle the actual search
  };

  const handleFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">Makaleler</h1>
        <p className="text-muted">Makale listesi ve moderasyon</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              placeholder="Başlık veya özet ara..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-9 py-1.5 text-sm bg-bg border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full text-muted hover:text-text hover:bg-bg/50 transition-colors"
                aria-label="Aramayı temizle"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </form>

        <Select
          value={statusFilter || ''}
          onChange={(value) => handleFilterChange('status', value || null)}
          placeholder="Tüm Durumlar"
          options={[
            { value: '', label: 'Tüm Durumlar' },
            { value: 'PUBLISHED', label: 'Yayında' },
            { value: 'REMOVED', label: 'Kaldırılmış' },
          ]}
          className="min-w-[160px]"
        />
      </div>

      {/* Error state */}
      {isError && (
        <div className="mb-6 rounded-xl border border-danger/30 bg-danger/5 p-6 text-center">
          <p className="text-text font-medium">Makaleler yüklenirken hata oluştu</p>
          <p className="mt-1 text-sm text-muted">
            Bağlantı veya sunucu kaynaklı bir sorun olabilir.
          </p>
          {import.meta.env.DEV && error && (
            <p className="mt-2 mx-auto max-w-xl text-left text-sm font-mono text-danger">
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
      )}

      {/* Table */}
      {!isError && (
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">Başlık</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">Yazar</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">Durum</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">İstatistik</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  Yükleniyor...
                </td>
              </tr>
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  {queryFromUrl
                    ? `"${queryFromUrl}" için makale bulunamadı.`
                    : 'Makale bulunamadı.'}
                </td>
              </tr>
            ) : (
              data?.items.map((article) => (
                <tr key={article.id} className="hover:bg-bg/50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-text font-medium line-clamp-1">{article.title}</div>
                      <div className="text-sm text-muted line-clamp-1">{article.summary}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-text">@{article.author.username}</span>
                      {article.author.isBanned && (
                        <span className="px-1 py-0.5 text-xs bg-danger/20 text-danger rounded">
                          Banlı
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {article.status === 'PUBLISHED' ? (
                      <span className="px-2 py-0.5 text-xs rounded bg-success/20 text-success">
                        Yayında
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs rounded bg-danger/20 text-danger">
                        Kaldırılmış
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">
                    {article.counts.views} görüntüleme, {article.counts.likes} beğeni
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/article/${article.id}`}
                        target="_blank"
                        className="p-2 text-muted hover:text-text hover:bg-bg rounded-lg transition-colors"
                        title="Makaleyi Görüntüle"
                      >
                        <ExternalLink size={18} />
                      </Link>
                      {article.status === 'PUBLISHED' ? (
                        <button
                          onClick={() => setRemoveModal({ article, reason: '' })}
                          className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                          title="Kaldır"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => restoreMutation.mutate(article.id)}
                          disabled={restoreMutation.isPending}
                          className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors"
                          title="Geri Yükle"
                        >
                          <RotateCcw size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => handleFilterChange('page', String(p))}
              className={`px-3 py-1 rounded ${
                p === page
                  ? 'bg-accent text-white'
                  : 'bg-bg text-muted hover:bg-border'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Remove Modal */}
      {removeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text mb-4">Makaleyi Kaldır</h3>
            <p className="text-muted mb-4">
              <span className="font-medium text-text">{removeModal.article.title}</span> makalesini
              kaldırmak üzeresiniz.
            </p>
            <textarea
              placeholder="Kaldırma sebebi (en az 10 karakter)"
              value={removeModal.reason}
              onChange={(e) => setRemoveModal({ ...removeModal, reason: e.target.value })}
              className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none h-24"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setRemoveModal(null)}
                className="px-4 py-2 text-muted hover:text-text transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() =>
                  removeMutation.mutate({ id: removeModal.article.id, reason: removeModal.reason })
                }
                disabled={removeModal.reason.length < 10 || removeMutation.isPending}
                className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 disabled:opacity-50 transition-colors"
              >
                {removeMutation.isPending ? 'İşleniyor...' : 'Kaldır'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
