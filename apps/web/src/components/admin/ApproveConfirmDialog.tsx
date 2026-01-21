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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-surface p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Check className="text-success" size={20} />
            Revision'ı Onayla
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
          <strong>"{revision.title}"</strong> başlıklı revision'ı onaylamak
          istediğinize emin misiniz?
        </p>

        <div className="mb-4 rounded-lg bg-success/10 p-3 text-sm text-success">
          Onaylanan revision Admin tarafından yayınlanmak üzere yayın
          kuyruğuna eklenecektir.
        </div>

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
            <Check size={16} />
            {isLoading ? 'Onaylanıyor...' : 'Onayla'}
          </button>
        </div>
      </div>
    </div>
  );
}

