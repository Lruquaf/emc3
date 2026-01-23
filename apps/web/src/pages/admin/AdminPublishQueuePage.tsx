import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Clock, User, Tag, Rocket, Check } from 'lucide-react';
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-3 font-serif text-3xl font-bold text-text">
          <CheckSquare className="text-accent" size={32} />
          Yayın Kuyruğu
        </h1>
        <p className="mt-2 text-muted">
          Onaylanmış ve yayınlanmayı bekleyen revision'ları yönetin.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-danger">
          <p className="font-medium">Bir hata oluştu. Lütfen tekrar deneyin.</p>
        </div>
      ) : !data?.items.length ? (
        <div className="rounded-lg border border-border bg-surface p-12 text-center shadow-sm">
          <CheckSquare size={48} className="mx-auto mb-4 text-muted" />
          <h3 className="mb-2 font-serif text-lg font-semibold text-text">Kuyruk Boş</h3>
          <p className="text-muted">Yayınlanmayı bekleyen revision yok.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map((revision) => (
            <div
              key={revision.id}
              className="rounded-lg border border-border bg-surface p-6 shadow-sm transition-all hover:shadow-md hover:border-accent/30"
            >
              <div className="flex items-start justify-between gap-6">
                {/* Left: Info */}
                <div className="flex-1 min-w-0">
                  <div className="mb-3 flex items-center gap-2 flex-wrap">
                    {revision.isNewArticle ? (
                      <span className="inline-flex items-center rounded-full bg-accent-2/15 px-2.5 py-0.5 text-xs font-semibold text-accent-2 ring-1 ring-inset ring-accent-2/30">
                        Yeni Makale
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success ring-1 ring-inset ring-success/30">
                        Güncelleme
                      </span>
                    )}
                    <Link
                      to={`/admin/revisions/${revision.id}?from=publish`}
                      className="font-serif text-xl font-semibold text-text hover:text-accent transition-colors line-clamp-2"
                    >
                      {revision.title}
                    </Link>
                  </div>

                  {revision.summary && (
                    <p className="mb-4 text-sm text-muted line-clamp-3 leading-relaxed">
                      {revision.summary}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
                    {/* Author */}
                    <div className="flex items-center gap-1.5">
                      <User size={14} className="text-muted" />
                      <span className="font-medium">@{revision.author.username}</span>
                    </div>

                    {/* Approved time */}
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-muted" />
                      <span>
                        Onaylandı:{' '}
                        {formatDistanceToNow(new Date(revision.approvedAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                    </div>

                    {/* Approved by */}
                    <div className="flex items-center gap-1.5 text-success">
                      <Check size={14} />
                      <span className="font-medium">@{revision.approvedBy.username} tarafından onaylandı</span>
                    </div>

                    {/* Categories */}
                    {revision.categories.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Tag size={14} className="text-muted" />
                        <span className="font-medium">
                          {revision.categories.map((cat) => cat.name).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/admin/revisions/${revision.id}?from=publish`}
                    className="inline-flex items-center rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text shadow-sm hover:bg-accent/5 hover:border-accent/40 hover:text-accent transition-all"
                  >
                    Detay
                  </Link>
                  <button
                    onClick={() => setSelectedRevision(revision)}
                    className="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-white hover:bg-success/90 shadow-md hover:shadow-lg transition-all"
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

      {/* Total count */}
      {data && (
        <div className="mt-6 rounded-lg bg-accent/5 border border-border px-4 py-3">
          <p className="text-sm font-medium text-text">
            Toplam <span className="text-accent font-semibold">{data.meta.totalCount}</span> revision yayın bekliyor
          </p>
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

