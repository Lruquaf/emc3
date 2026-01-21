import { Rocket, X, AlertCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-surface p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Rocket className="text-success" size={20} />
            Makaleyi Yayınla
          </h2>
          <button
            onClick={onCancel}
            className="rounded p-1 text-muted hover:bg-bg hover:text-text"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <p className="mb-4 text-muted">
          <strong>"{revision.title}"</strong> başlıklı makaleyi yayınlamak
          istediğinize emin misiniz?
        </p>

        {/* Info */}
        <div className="mb-4 space-y-2">
          <div
            className={`rounded-lg p-3 text-sm ${
              revision.isNewArticle ? 'bg-success/10' : 'bg-accent-2/10'
            }`}
          >
            {revision.isNewArticle ? (
              <p className="text-success">
                🎉 Bu makale ilk kez yayınlanacak.
              </p>
            ) : (
              <p className="text-accent-2">
                ♻️ Bu makale güncellenecek. Önceki versiyon değişecek.
              </p>
            )}
          </div>

          <div className="rounded-lg bg-bg p-3 text-sm">
            <p className="mb-1 text-muted">Yazar: @{revision.author.username}</p>
            <p className="text-muted">
              Kategoriler: {revision.categories.map((c) => c.name).join(', ') || 'Yok'}
            </p>
          </div>
        </div>

        {/* Warning for banned author */}
        {revision.author.isBanned && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <p>
              Dikkat: Bu kullanıcı şu anda banlanmış durumda. Yayınlama işlemi
              yapılabilir ancak makale herkese açık olarak gösterilmeyecektir.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm text-muted hover:text-text"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm text-white hover:bg-success/90 disabled:opacity-50"
          >
            <Rocket size={16} />
            {isLoading ? 'Yayınlanıyor...' : 'Yayınla'}
          </button>
        </div>
      </div>
    </div>
  );
}

