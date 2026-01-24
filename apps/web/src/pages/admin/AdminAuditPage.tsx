import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Shield, User, FileText, MessageSquare, FolderTree, AlertCircle } from 'lucide-react';

import { adminAuditApi } from '../../api/admin.api';
import type { AuditLogDTO } from '@emc3/shared';

const ACTION_LABELS: Record<string, string> = {
  USER_BANNED: 'Kullanıcı Banlandı',
  USER_UNBANNED: 'Ban Kaldırıldı',
  USER_ROLE_ADDED: 'Rol Eklendi',
  USER_ROLE_REMOVED: 'Rol Kaldırıldı',
  ARTICLE_REMOVED: 'Makale Kaldırıldı',
  ARTICLE_RESTORED: 'Makale Geri Yüklendi',
  OPINION_REMOVED: 'Görüş Kaldırıldı',
  OPINION_REPLY_REMOVED: 'Görüş Yanıtı Kaldırıldı',
  REV_FEEDBACK: 'Geri Bildirim',
  REV_APPROVED: 'Onaylandı',
  REV_PUBLISHED: 'Yayınlandı',
  REV_SUBMITTED: 'İncelemeye Gönderildi',
  REV_WITHDRAWN: 'Geri Çekildi',
  APPEAL_OPENED: 'İtiraz Açıldı',
  APPEAL_MESSAGE: 'İtiraz Mesajı',
  APPEAL_CLOSED: 'İtiraz Kapatıldı',
  CATEGORY_CREATED: 'Kategori Oluşturuldu',
  CATEGORY_UPDATED: 'Kategori Güncellendi',
  CATEGORY_REPARENTED: 'Kategori Taşındı',
  CATEGORY_DELETED_SUBTREE: 'Kategori Silindi',
};

const TARGET_ICONS: Record<string, React.ElementType> = {
  user: User,
  article: FileText,
  revision: FileText,
  opinion: MessageSquare,
  category: FolderTree,
  appeal: AlertCircle,
};

export function AdminAuditPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const actionFilter = searchParams.get('action');
  const targetTypeFilter = searchParams.get('targetType');

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['admin', 'audit', { action: actionFilter, targetType: targetTypeFilter }],
    queryFn: ({ pageParam }) =>
      adminAuditApi.getLogs({
        action: actionFilter || undefined,
        targetType: targetTypeFilter || undefined,
        limit: 50,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor ?? undefined : undefined,
  });

  const handleFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const allLogs = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">Audit Log</h1>
        <p className="text-muted">Sistemdeki tüm işlemlerin kaydı</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={actionFilter || ''}
          onChange={(e) => handleFilterChange('action', e.target.value || null)}
          className="px-4 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">Tüm İşlemler</option>
          <option value="USER_BANNED">Kullanıcı Banları</option>
          <option value="USER_UNBANNED">Ban Kaldırma</option>
          <option value="ARTICLE_REMOVED">Makale Kaldırma</option>
          <option value="ARTICLE_RESTORED">Makale Geri Yükleme</option>
          <option value="REV_PUBLISHED">Yayınlama</option>
          <option value="REV_APPROVED">Onaylama</option>
          <option value="REV_FEEDBACK">Geri Bildirim</option>
        </select>

        <select
          value={targetTypeFilter || ''}
          onChange={(e) => handleFilterChange('targetType', e.target.value || null)}
          className="px-4 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">Tüm Hedefler</option>
          <option value="user">Kullanıcı</option>
          <option value="article">Makale</option>
          <option value="revision">Revizyon</option>
          <option value="opinion">Görüş</option>
          <option value="appeal">İtiraz</option>
          <option value="category">Kategori</option>
        </select>
      </div>

      {/* Log List */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted">Yükleniyor...</div>
        ) : allLogs.length === 0 ? (
          <div className="p-8 text-center text-muted">Kayıt bulunamadı</div>
        ) : (
          <div className="divide-y divide-border">
            {allLogs.map((log) => (
              <AuditLogItem key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div className="mt-4 text-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
          </button>
        </div>
      )}
    </div>
  );
}

function AuditLogItem({ log }: { log: AuditLogDTO }) {
  const TargetIcon = TARGET_ICONS[log.targetType || ''] || Shield;
  const actionLabel = ACTION_LABELS[log.action] || log.action;
  const metaInfo = formatMetaInfo(log);

  return (
    <div className="px-4 py-4 hover:bg-bg/50">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
          <TargetIcon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-text">{actionLabel}</span>
            {log.targetType && (
              <span className="text-xs text-muted bg-bg px-2 py-0.5 rounded">
                {log.targetType}
              </span>
            )}
          </div>
          <div className="text-sm text-muted">
            {log.actor ? (
              <span>
                <span className="text-text">@{log.actor.username}</span> tarafından
              </span>
            ) : (
              <span>Sistem tarafından</span>
            )}
            {' • '}
            {new Date(log.createdAt).toLocaleString('tr-TR')}
          </div>
          {metaInfo && (
            <div className="mt-2 text-sm text-muted bg-bg rounded-lg p-2 space-y-1">
              {metaInfo}
            </div>
          )}
          {log.reason && (
            <div className="mt-2 text-sm text-muted bg-bg rounded-lg p-2">
              <span className="text-text/70">Sebep:</span> {log.reason}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatMetaInfo(log: AuditLogDTO): React.ReactNode {
  const meta = log.meta || {};
  const items: React.ReactNode[] = [];

  // User actions
  if (meta.targetUsername) {
    items.push(
      <div key="targetUsername">
        <span className="text-text/70">Kullanıcı:</span>{' '}
        <span className="text-text font-medium">@{meta.targetUsername}</span>
      </div>
    );
  }
  if (meta.username) {
    items.push(
      <div key="username">
        <span className="text-text/70">Kullanıcı:</span>{' '}
        <span className="text-text font-medium">@{meta.username}</span>
      </div>
    );
  }
  if (meta.userId) {
    items.push(
      <div key="userId">
        <span className="text-text/70">Kullanıcı ID:</span>{' '}
        <span className="text-text font-mono text-xs">{meta.userId}</span>
      </div>
    );
  }
  if (meta.role) {
    items.push(
      <div key="role">
        <span className="text-text/70">Rol:</span>{' '}
        <span className="text-text font-medium">{meta.role}</span>
      </div>
    );
  }

  // Article actions
  if (meta.articleSlug) {
    items.push(
      <div key="articleSlug">
        <span className="text-text/70">Makale:</span>{' '}
        <span className="text-text font-medium">{meta.articleSlug}</span>
      </div>
    );
  }
  if (meta.slug) {
    items.push(
      <div key="slug">
        <span className="text-text/70">Makale:</span>{' '}
        <span className="text-text font-medium">{meta.slug}</span>
      </div>
    );
  }
  if (meta.articleId) {
    items.push(
      <div key="articleId">
        <span className="text-text/70">Makale ID:</span>{' '}
        <span className="text-text font-mono text-xs">{meta.articleId}</span>
      </div>
    );
  }
  if (meta.authorUsername) {
    items.push(
      <div key="authorUsername">
        <span className="text-text/70">Yazar:</span>{' '}
        <span className="text-text font-medium">@{meta.authorUsername}</span>
      </div>
    );
  }
  if (meta.authorId) {
    items.push(
      <div key="authorId">
        <span className="text-text/70">Yazar ID:</span>{' '}
        <span className="text-text font-mono text-xs">{meta.authorId}</span>
      </div>
    );
  }

  // Category actions
  if (meta.categoryName) {
    items.push(
      <div key="categoryName">
        <span className="text-text/70">Kategori:</span>{' '}
        <span className="text-text font-medium">{meta.categoryName}</span>
        {meta.categorySlug && (
          <span className="text-muted ml-1">({meta.categorySlug})</span>
        )}
      </div>
    );
  }
  if (meta.name && log.targetType === 'category') {
    items.push(
      <div key="name">
        <span className="text-text/70">Kategori:</span>{' '}
        <span className="text-text font-medium">{meta.name}</span>
        {meta.slug && (
          <span className="text-muted ml-1">({meta.slug})</span>
        )}
      </div>
    );
  }
  if (meta.deletedCategoryCount !== undefined) {
    items.push(
      <div key="deletedCategoryCount">
        <span className="text-text/70">Silinen Kategori:</span>{' '}
        <span className="text-text font-medium">{meta.deletedCategoryCount} adet</span>
      </div>
    );
  }
  if (meta.reassignedRevisionCount !== undefined) {
    items.push(
      <div key="reassignedRevisionCount">
        <span className="text-text/70">Yeniden Atanan Revizyon:</span>{' '}
        <span className="text-text font-medium">{meta.reassignedRevisionCount} adet</span>
      </div>
    );
  }
  if (meta.previousParentName || meta.newParentName || meta.previousParentId || meta.newParentId) {
    items.push(
      <div key="parentChange">
        <span className="text-text/70">Parent Değişimi:</span>{' '}
        {meta.previousParentName ? (
          <span className="text-text">{meta.previousParentName}</span>
        ) : meta.previousParentId ? (
          <span className="text-text font-mono text-xs">{meta.previousParentId}</span>
        ) : (
          <span className="text-muted">(yok)</span>
        )}
        {' → '}
        {meta.newParentName ? (
          <span className="text-text">{meta.newParentName}</span>
        ) : meta.newParentId ? (
          <span className="text-text font-mono text-xs">{meta.newParentId}</span>
        ) : (
          <span className="text-muted">(kök)</span>
        )}
      </div>
    );
  }
  if (meta.parentId && !meta.previousParentId && !meta.newParentId) {
    items.push(
      <div key="parentId">
        <span className="text-text/70">Parent ID:</span>{' '}
        <span className="text-text font-mono text-xs">{meta.parentId}</span>
      </div>
    );
  }

  // Opinion actions
  if (meta.opinionId) {
    items.push(
      <div key="opinionId">
        <span className="text-text/70">Görüş ID:</span>{' '}
        <span className="text-text font-mono text-xs">{meta.opinionId}</span>
      </div>
    );
  }
  if (meta.replierUsername) {
    items.push(
      <div key="replierUsername">
        <span className="text-text/70">Yanıtlayan:</span>{' '}
        <span className="text-text font-medium">@{meta.replierUsername}</span>
      </div>
    );
  }

  // Revision actions
  if (meta.isFirstPublish !== undefined) {
    items.push(
      <div key="isFirstPublish">
        <span className="text-text/70">İlk Yayın:</span>{' '}
        <span className="text-text font-medium">
          {meta.isFirstPublish ? 'Evet' : 'Hayır'}
        </span>
      </div>
    );
  }
  if (meta.feedbackLength !== undefined) {
    items.push(
      <div key="feedbackLength">
        <span className="text-text/70">Geri Bildirim Uzunluğu:</span>{' '}
        <span className="text-text font-medium">{meta.feedbackLength} karakter</span>
      </div>
    );
  }

  // Appeal actions
  if (meta.resolution) {
    items.push(
      <div key="resolution">
        <span className="text-text/70">Karar:</span>{' '}
        <span className="text-text font-medium">
          {meta.resolution === 'upheld' ? 'Onaylandı' : 'Reddedildi'}
        </span>
      </div>
    );
  }
  if (meta.isAdmin !== undefined) {
    items.push(
      <div key="isAdmin">
        <span className="text-text/70">Gönderen:</span>{' '}
        <span className="text-text font-medium">
          {meta.isAdmin ? 'Admin/Reviewer' : 'Kullanıcı'}
        </span>
      </div>
    );
  }

  // Category changes
  if (meta.changes) {
    const changes = meta.changes as Record<string, unknown>;
    const changeItems: string[] = [];
    if (changes.name) changeItems.push(`İsim: ${changes.name}`);
    if (changes.slug) changeItems.push(`Slug: ${changes.slug}`);
    if (changeItems.length > 0) {
      items.push(
        <div key="changes">
          <span className="text-text/70">Değişiklikler:</span>{' '}
          <span className="text-text">{changeItems.join(', ')}</span>
        </div>
      );
    }
  }
  if (meta.previousValues) {
    const prev = meta.previousValues as Record<string, unknown>;
    const prevItems: string[] = [];
    if (prev.name) prevItems.push(`İsim: ${prev.name}`);
    if (prev.slug) prevItems.push(`Slug: ${prev.slug}`);
    if (prevItems.length > 0) {
      items.push(
        <div key="previousValues">
          <span className="text-text/70">Önceki Değerler:</span>{' '}
          <span className="text-text">{prevItems.join(', ')}</span>
        </div>
      );
    }
  }

  return items.length > 0 ? <>{items}</> : null;
}
