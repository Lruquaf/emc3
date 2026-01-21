import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Send, AlertTriangle } from 'lucide-react';

import { adminReviewApi } from '@/api/admin.api';
import type { ReviewQueueItemDTO } from '@emc3/shared';

interface FeedbackModalProps {
  revision: Pick<ReviewQueueItemDTO, 'id' | 'title'>;
  onClose: () => void;
  onSuccess: () => void;
}

export function FeedbackModal({ revision, onClose, onSuccess }: FeedbackModalProps) {
  const [feedbackText, setFeedbackText] = useState('');
  const queryClient = useQueryClient();

  const feedbackMutation = useMutation({
    mutationFn: () => adminReviewApi.giveFeedback(revision.id, { feedbackText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
      queryClient.invalidateQueries({ queryKey: ['revisionDetail', revision.id] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackText.trim().length < 10) return;
    feedbackMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-surface p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <AlertTriangle className="text-warn" size={20} />
            Düzenleme Talebi
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted hover:bg-bg hover:text-text"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info */}
        <div className="mb-4 rounded-lg bg-warn/10 p-3">
          <p className="text-sm text-warn">
            Bu işlem revision'ı <strong>CHANGES_REQUESTED</strong> durumuna
            geçirecek ve yazara düzenleme yapması için bildirim gönderecek.
          </p>
        </div>

        <p className="mb-4 text-sm text-muted">
          Makale: <strong>{revision.title}</strong>
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              Geri Bildirim <span className="text-danger">*</span>
            </label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Yazara iletmek istediğiniz düzenleme taleplerini yazın..."
              rows={6}
              className="w-full resize-none rounded-lg border border-border bg-bg px-4 py-3 text-sm placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              required
              minLength={10}
            />
            <p className="mt-1 text-xs text-muted">
              En az 10 karakter ({feedbackText.length}/5000)
            </p>
          </div>

          {/* Error */}
          {feedbackMutation.error && (
            <div className="mb-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">
              Bir hata oluştu. Lütfen tekrar deneyin.
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-muted hover:text-text"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={feedbackText.trim().length < 10 || feedbackMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-warn px-4 py-2 text-sm text-white hover:bg-warn/90 disabled:opacity-50"
            >
              <Send size={16} />
              {feedbackMutation.isPending ? 'Gönderiliyor...' : 'Geri Bildirim Gönder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

