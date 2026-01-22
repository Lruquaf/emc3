import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Clock, User, Tag, Rocket } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

import { adminPublishApi } from '@/api/admin.api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PublishConfirmDialog } from '@/components/admin/PublishConfirmDialog';
import type { PublishQueueItemDTO } from '@emc3/shared';

export function AdminPublishQueuePage() {
  const [selectedRevision, setSelectedRevision] = useState<PublishQueueItemDTO | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['publishQueue'],
    queryFn: () => adminPublishApi.getPublishQueue({ limit: 50 }),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => adminPublishApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishQueue'] });
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
      setSelectedRevision(null);
    },
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-3 font-serif text-3xl font-bold text-text">
          <CheckSquare className="text-success" size={32} />
          Yayın Kuyruğu
        </h1>
        <p className="mt-2 text-text-secondary">
          Onaylanmış ve yayınlanmayı bekleyen revision'ları yönetin.
        </p>
      </div>

      {/* Statistics Cards */}
      {data && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">Toplam</p>
                <p className="mt-1 text-2xl font-bold text-text">
                  {data.meta.totalCount}
                </p>
              </div>
              <div className="rounded-lg bg-success-50 p-3">
                <CheckSquare className="text-success" size={24} />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">Yeni Makaleler</p>
                <p className="mt-1 text-2xl font-bold text-text">
                  {data.items.filter((i) => i.isNewArticle).length}
                </p>
              </div>
              <div className="rounded-lg bg-success-50 p-3">
                <Rocket className="text-success" size={24} />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">Güncellemeler</p>
                <p className="mt-1 text-2xl font-bold text-text">
                  {data.items.filter((i) => !i.isNewArticle).length}
                </p>
              </div>
              <div className="rounded-lg bg-gold-50 p-3">
                <Tag className="text-gold" size={24} />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">Ortalama Bekleme</p>
                <p className="mt-1 text-2xl font-bold text-text">
                  {data.items.length > 0
                    ? Math.round(
                        data.items.reduce((acc, item) => {
                          const waitTime =
                            Date.now() - new Date(item.approvedAt).getTime();
                          return acc + waitTime / (1000 * 60 * 60 * 24); // days
                        }, 0) / data.items.length
                      )
                    : 0}
                  gün
                </p>
              </div>
              <div className="rounded-lg bg-info-50 p-3">
                <Clock className="text-info" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-danger-100 bg-danger-50 p-4 text-danger">
          Bir hata oluştu. Lütfen tekrar deneyin.
        </div>
      ) : !data?.items.length ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-secondary">
            <CheckSquare size={32} className="text-text-muted" />
          </div>
          <h3 className="mb-2 font-serif text-xl font-semibold text-text">Kuyruk Boş</h3>
          <p className="text-text-secondary">
            Yayınlanmayı bekleyen revision yok.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((revision) => (
            <div
              key={revision.id}
              className="group rounded-xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-success/30 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Info */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="mb-3 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex items-center gap-2 flex-wrap">
                    {revision.isNewArticle ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-dark">
                            <Rocket size={12} />
                        Yeni Makale
                      </span>
                    ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2.5 py-1 text-xs font-medium text-gold">
                            <Tag size={12} />
                        Güncelleme
                      </span>
                    )}
                        <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-dark">
                          <CheckSquare size={12} />
                          Onaylandı
                        </span>
                      </div>
                    <Link
                      to={`/admin/revisions/${revision.id}`}
                        className="block font-serif text-lg font-semibold text-text transition-colors hover:text-accent line-clamp-2"
                    >
                      {revision.title}
                    </Link>
                    </div>
                  </div>

                  {/* Summary */}
                  {revision.summary && (
                    <p className="mb-4 text-sm text-text-secondary line-clamp-2 leading-relaxed">
                      {revision.summary}
                  </p>
                  )}

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Author */}
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-50">
                        <User size={12} className="text-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-text truncate">
                          @{revision.author.username}
                        </p>
                        {revision.author.isBanned && (
                          <p className="text-danger text-[10px]">Banlı</p>
                        )}
                      </div>
                    </div>

                    {/* Approved time */}
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-50">
                        <Clock size={12} className="text-success" />
                      </div>
                      <span className="font-medium">
                        Onaylandı:{' '}
                        {formatDistanceToNow(new Date(revision.approvedAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                    </div>

                    {/* Approved by */}
                    <div className="flex items-center gap-2 text-xs text-success">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-50">
                        <CheckSquare size={12} />
                      </div>
                      <span className="font-medium">
                        @{revision.approvedBy.username}
                      </span>
                    </div>

                    {/* Categories */}
                    {revision.categories.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-2-50">
                          <Tag size={12} className="text-accent-2" />
                        </div>
                        <span className="font-medium truncate">
                        {revision.categories.map((cat) => cat.name).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <Link
                    to={`/admin/revisions/${revision.id}`}
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-text transition-all hover:border-accent hover:bg-accent-50 hover:text-accent"
                  >
                    Detay Gör
                  </Link>
                  <button
                    onClick={() => setSelectedRevision(revision)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-success px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-success-600 hover:shadow-md"
                  >
                    <Rocket size={16} />
                    Yayınla
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish Confirm Dialog */}
      {selectedRevision && (
        <PublishConfirmDialog
          revision={selectedRevision}
          isLoading={publishMutation.isPending}
          onConfirm={() => publishMutation.mutate(selectedRevision.id)}
          onCancel={() => setSelectedRevision(null)}
        />
      )}
    </div>
  );
}

