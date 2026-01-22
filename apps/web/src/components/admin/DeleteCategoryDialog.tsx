import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, Trash2, X } from 'lucide-react';

import { adminCategoryApi } from '@/api/categories.api';
import type { ApiError } from '@/api/client';
import type { AdminCategoryDTO } from '@emc3/shared';

interface DeleteCategoryDialogProps {
  category: AdminCategoryDTO;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteCategoryDialog({
  category,
  onClose,
  onSuccess,
}: DeleteCategoryDialogProps) {
  const deleteMutation = useMutation({
    mutationFn: () => adminCategoryApi.delete(category.id),
    onSuccess: () => {
      onSuccess();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-surface p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-danger">
            <AlertTriangle size={20} />
            Kategoriyi Sil
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted hover:bg-bg hover:text-text"
          >
            <X size={20} />
          </button>
        </div>

        {/* Warning */}
        <div className="mb-4 rounded-lg bg-danger/10 p-4 text-sm text-danger">
          <p className="mb-2 font-medium">⚠️ Dikkat!</p>
          <p>
            Bu işlem <strong>"{category.name}"</strong> kategorisini ve tüm alt
            kategorilerini kalıcı olarak silecektir.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-4 space-y-2 rounded-lg bg-bg p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Alt kategori sayısı:</span>
            <span className="font-medium">{category.descendantCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Etkilenen revision sayısı:</span>
            <span className="font-medium">{category.revisionCount}</span>
          </div>
        </div>

        {/* Info */}
        <div className="mb-4 rounded-lg bg-accent/10 p-3 text-sm text-accent">
          Kategorisi kalmayan revision'lara otomatik olarak "Diğer/Genel"
          kategorisi atanacaktır.
        </div>

        {/* Error */}
        {deleteMutation.error && (
          <div className="mb-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">
            {(deleteMutation.error as unknown as ApiError)?.message || 'Silme işlemi başarısız'}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-muted hover:text-text"
          >
            İptal
          </button>
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm text-white hover:bg-danger/90 disabled:opacity-50"
          >
            <Trash2 size={16} />
            {deleteMutation.isPending ? 'Siliniyor...' : 'Evet, Sil'}
          </button>
        </div>
      </div>
    </div>
  );
}

