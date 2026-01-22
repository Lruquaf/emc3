import { Rocket, X, AlertCircle, User, Tag } from 'lucide-react';

import type { PublishQueueItemDTO } from '@emc3/shared';

interface PublishConfirmDialogProps {
  revision: PublishQueueItemDTO;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PublishConfirmDialog({
  revision,
  isLoading,
  onConfirm,
  onCancel,
}: PublishConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-surface shadow-2xl border border-border">
        {/* Header */}
        <div className="border-b border-divider px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50">
                <Rocket className="text-success" size={24} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-text">Makaleyi Yayınla</h2>
                <p className="text-xs text-text-muted">Yayınlama işlemini onaylayın</p>
              </div>
            </div>
          <button
            onClick={onCancel}
              className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-secondary hover:text-text"
          >
            <X size={20} />
          </button>
          </div>
        </div>

        <div className="px-6 py-5">
        {/* Content */}
          <div className="mb-5">
            <p className="mb-5 text-sm text-text-secondary">
              <strong className="text-text">"{revision.title}"</strong> başlıklı makaleyi yayınlamak
          istediğinize emin misiniz?
        </p>

            {/* Info Cards */}
            <div className="mb-5 space-y-3">
          <div
                className={`rounded-lg border p-4 text-sm ${
                  revision.isNewArticle
                    ? 'border-success-100 bg-success-50'
                    : 'border-accent-2-100 bg-accent-2-50'
                }`}
              >
                <div className="flex gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    revision.isNewArticle ? 'bg-success-100' : 'bg-accent-2-100'
                  }`}>
            {revision.isNewArticle ? (
                      <Rocket size={16} className="text-success" />
            ) : (
                      <Tag size={16} className="text-accent-2" />
            )}
          </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      revision.isNewArticle ? 'text-success-dark' : 'text-accent-2-dark'
                    }`}>
                      {revision.isNewArticle
                        ? 'İlk Yayın'
                        : 'Güncelleme'}
                    </p>
                    <p className={`mt-1 text-xs ${
                      revision.isNewArticle ? 'text-success-dark/80' : 'text-accent-2-dark/80'
                    }`}>
                      {revision.isNewArticle
                        ? 'Bu makale ilk kez yayınlanacak ve platformda görünecek.'
                        : 'Bu makale güncellenecek. Önceki versiyon değişecek.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-surface-elevated p-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-text-muted" />
                    <span className="text-text-secondary">
                      Yazar: <strong className="text-text">@{revision.author.username}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-text-muted" />
                    <span className="text-text-secondary">
                      Kategoriler:{' '}
                      <strong className="text-text">
                        {revision.categories.map((c) => c.name).join(', ') || 'Yok'}
                      </strong>
                    </span>
                  </div>
                </div>
          </div>
        </div>

        {/* Warning for banned author */}
        {revision.author.isBanned && (
              <div className="mb-5 rounded-lg border border-danger-100 bg-danger-50 p-4">
                <div className="flex gap-3">
                  <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-danger-dark">
                      Banlı Kullanıcı Uyarısı
                    </p>
                    <p className="mt-1 text-xs text-danger-dark/80">
                      Bu kullanıcı şu anda banlanmış durumda. Yayınlama işlemi
              yapılabilir ancak makale herkese açık olarak gösterilmeyecektir.
            </p>
                  </div>
                </div>
          </div>
        )}
          </div>

        {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-divider pt-5">
          <button
            onClick={onCancel}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-success px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-success-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Rocket size={16} />
            {isLoading ? 'Yayınlanıyor...' : 'Yayınla'}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

