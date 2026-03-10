import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, ExternalLink } from 'lucide-react';

import { adminOpinionsApi } from '../../api/admin.api';
import { Select } from '../../components/ui';
import type { AdminOpinionDTO } from '@emc3/shared';

export function AdminOpinionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const statusFilter = searchParams.get('status') as 'ACTIVE' | 'REMOVED' | null;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'opinions', { status: statusFilter, page }],
    queryFn: () =>
      adminOpinionsApi.list({
        status: statusFilter || undefined,
        page,
        limit: 20,
      }),
  });

  const handleFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') {
      params.set('page', '1');
    }
    setSearchParams(params);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">Mütalaalar</h1>
        <p className="text-muted">Tüm mütalaa kayıtlarını görüntüleyin ve yönetin</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Select
          value={statusFilter || ''}
          onChange={(value) => handleFilterChange('status', value || null)}
          placeholder="Tüm Durumlar"
          options={[
            { value: '', label: 'Tüm Durumlar' },
            { value: 'ACTIVE', label: 'Aktif' },
            { value: 'REMOVED', label: 'Kaldırılmış' },
          ]}
          className="min-w-[160px]"
        />
      </div>

      {/* Error state */}
      {isError && (
        <div className="mb-6 rounded-xl border border-danger/30 bg-danger/5 p-6 text-center">
          <p className="text-text font-medium">Mütalaalar yüklenirken hata oluştu</p>
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
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">Mütalaa</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">Makale</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">Yazar</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">Durum</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">İstatistik</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    Yükleniyor...
                  </td>
                </tr>
              ) : !data || data.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    Mütalaa bulunamadı.
                  </td>
                </tr>
              ) : (
                data.items.map((opinion: AdminOpinionDTO) => (
                  <tr key={opinion.id} className="hover:bg-bg/50">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <div className="mt-1 rounded-full bg-accent/10 p-1.5 text-accent">
                          <MessageSquare size={14} />
                        </div>
                        <div>
                          <div className="text-sm text-text line-clamp-2">
                            {opinion.bodyPreview || '—'}
                          </div>
                          <div className="mt-1 text-xs text-muted">
                            {new Date(opinion.createdAt).toLocaleString('tr-TR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/article/${opinion.articleId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline line-clamp-1"
                        >
                          {opinion.articleTitle}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/user/${opinion.author.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text hover:underline"
                        >
                          @{opinion.author.username}
                        </Link>
                        {opinion.author.isBanned && (
                          <span className="px-1.5 py-0.5 text-xs rounded bg-danger/15 text-danger">
                            Banlı
                          </span>
                        )}
                        {opinion.author.isDeleted && (
                          <span className="px-1.5 py-0.5 text-xs rounded bg-muted/20 text-muted">
                            Silinmiş
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {opinion.status === 'ACTIVE' ? (
                        <span className="px-2 py-0.5 text-xs rounded bg-success/20 text-success">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs rounded bg-danger/20 text-danger">
                          Kaldırılmış
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
                      {opinion.likeCount} beğeni
                      {opinion.hasReply && ', yazar cevabı var'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/article/${opinion.articleId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-muted hover:text-text hover:bg-bg rounded-lg transition-colors"
                          title="Makaledeki mütalaayı gör"
                        >
                          <ExternalLink size={18} />
                        </Link>
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
    </div>
  );
}

