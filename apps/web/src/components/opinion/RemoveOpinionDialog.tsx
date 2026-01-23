import { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

import { adminOpinionsApi } from '../../api/admin.api';
import { cn } from '../../utils/cn';

interface RemoveOpinionDialogProps {
  opinionId: string;
  isReply?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RemoveOpinionDialog({
  opinionId,
  isReply = false,
  onClose,
  onSuccess,
}: RemoveOpinionDialogProps) {
  const [reason, setReason] = useState('');
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async () => {
    if (reason.trim().length < 10) {
      setError('Kaldırma sebebi en az 10 karakter olmalıdır');
      return;
    }

    setIsRemoving(true);
    setError(null);

    try {
      if (isReply) {
        await adminOpinionsApi.removeOpinionReply(opinionId, reason.trim());
      } else {
        await adminOpinionsApi.removeOpinion(opinionId, reason.trim());
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Kaldırma işlemi başarısız oldu');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-rose-600">
            <AlertTriangle size={20} />
            {isReply ? 'Yazar Cevabını Kaldır' : 'Mütalaayı Kaldır'}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            disabled={isRemoving}
          >
            <X size={20} />
          </button>
        </div>

        {/* Warning */}
        <div className="mb-4 rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
          <p className="mb-2 font-medium">⚠️ Dikkat!</p>
          <p>
            Bu işlem {isReply ? 'yazar cevabını' : 'mütalaayı'} kaldıracaktır. Kaldırma sebebi
            zorunludur ve audit log'a kaydedilecektir.
          </p>
        </div>

        {/* Reason input */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Kaldırma Sebebi <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="Mütalaayı neden kaldırdığınızı açıklayın (en az 10 karakter)..."
            rows={4}
            disabled={isRemoving}
            className={cn(
              'w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20',
              error
                ? 'border-rose-300 focus:border-rose-500'
                : 'border-neutral-200 focus:border-rose-500'
            )}
          />
          <div className="mt-1 flex items-center justify-between">
            <span
              className={cn(
                'text-xs',
                reason.length < 10 && reason.length > 0
                  ? 'text-amber-500'
                  : reason.length >= 10
                    ? 'text-neutral-500'
                    : 'text-neutral-400'
              )}
            >
              {reason.length} / 500 karakter
            </span>
            {reason.length < 10 && reason.length > 0 && (
              <span className="text-xs text-amber-500">
                En az 10 karakter gerekli
              </span>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isRemoving}
            className="rounded-lg px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
          >
            İptal
          </button>
          <button
            onClick={handleRemove}
            disabled={isRemoving || reason.trim().length < 10}
            className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700 disabled:opacity-50"
          >
            <Trash2 size={16} />
            {isRemoving ? 'Kaldırılıyor...' : 'Kaldır'}
          </button>
        </div>
      </div>
    </div>
  );
}
