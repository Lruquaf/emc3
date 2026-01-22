import { Check, X } from 'lucide-react';

import type { ReviewQueueItemDTO } from '@emc3/shared';

interface ApproveConfirmDialogProps {
  revision: Pick<ReviewQueueItemDTO, 'id' | 'title'>;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ApproveConfirmDialog({
  revision,
  isLoading,
  onConfirm,
  onCancel,
}: ApproveConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-surface shadow-2xl border border-border">
        {/* Header */}
        <div className="border-b border-divider px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50">
                <Check className="text-success" size={24} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-text">Revision'ı Onayla</h2>
                <p className="text-xs text-text-muted">Onay işlemini tamamlayın</p>
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
            <p className="mb-4 text-sm text-text-secondary">
              <strong className="text-text">"{revision.title}"</strong> başlıklı revision'ı onaylamak
          istediğinize emin misiniz?
        </p>

            <div className="rounded-lg border border-success-100 bg-success-50 p-4">
              <div className="flex gap-3">
                <Check className="mt-0.5 shrink-0 text-success" size={18} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-success-dark">
                    Onay Sonrası
                  </p>
                  <p className="mt-1 text-xs text-success-dark/80">
          Onaylanan revision Admin tarafından yayınlanmak üzere yayın
          kuyruğuna eklenecektir.
                  </p>
                </div>
              </div>
            </div>
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
            <Check size={16} />
            {isLoading ? 'Onaylanıyor...' : 'Onayla'}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

