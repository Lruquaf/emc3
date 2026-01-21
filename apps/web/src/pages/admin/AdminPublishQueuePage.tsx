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
        <h1 className="flex items-center gap-3 font-serif text-3xl font-bold">
          <CheckSquare className="text-success" />
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
        <div className="rounded-lg bg-danger/10 p-4 text-danger">
          Bir hata oluştu. Lütfen tekrar deneyin.
        </div>
      ) : !data?.items.length ? (
        <div className="rounded-lg bg-surface p-8 text-center">
          <CheckSquare size={48} className="mx-auto mb-4 text-muted" />
          <h3 className="mb-2 text-lg font-medium">Kuyruk Boş</h3>
          <p className="text-muted">Yayınlanmayı bekleyen revision yok.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map((revision) => (
            <div
              key={revision.id}
              className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-success/50"
            >
              <div className="flex items-start justify-between">
                {/* Left: Info */}
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    {revision.isNewArticle ? (
                      <span className="rounded bg-success/10 px-2 py-0.5 text-xs text-success">
                        Yeni Makale
                      </span>
                    ) : (
                      <span className="rounded bg-accent/10 px-2 py-0.5 text-xs text-accent">
                        Güncelleme
                      </span>
                    )}
                    <Link
                      to={`/admin/revisions/${revision.id}`}
                      className="font-medium text-text hover:text-accent"
                    >
                      {revision.title}
                    </Link>
                  </div>

                  <p className="mb-3 text-sm text-muted line-clamp-2">
                    {revision.summary || 'Özet yok'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                    {/* Author */}
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>@{revision.author.username}</span>
                    </div>

                    {/* Approved time */}
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>
                        Onaylandı:{' '}
                        {formatDistanceToNow(new Date(revision.approvedAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                    </div>

                    {/* Approved by */}
                    <div className="flex items-center gap-1 text-success">
                      <span>✓ @{revision.approvedBy.username} tarafından</span>
                    </div>

                    {/* Categories */}
                    {revision.categories.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag size={14} />
                        {revision.categories.map((cat) => cat.name).join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="ml-4 flex gap-2">
                  <Link
                    to={`/admin/revisions/${revision.id}`}
                    className="rounded-lg bg-surface border border-border px-3 py-2 text-sm text-muted hover:bg-bg hover:text-text"
                  >
                    Detay
                  </Link>
                  <button
                    onClick={() => setSelectedRevision(revision)}
                    className="flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm text-white hover:bg-success/90"
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
        <div className="mt-4 text-sm text-muted">
          Toplam {data.meta.totalCount} revision yayın bekliyor
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

