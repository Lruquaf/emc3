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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl bg-surface shadow-2xl border border-border">
        {/* Header */}
        <div className="border-b border-divider px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warn-50">
                <AlertTriangle className="text-warn" size={24} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-text">Düzenleme Talebi</h2>
                <p className="text-xs text-text-muted">Yazara geri bildirim gönderin</p>
              </div>
            </div>
          <button
            onClick={onClose}
              className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-secondary hover:text-text"
          >
            <X size={20} />
          </button>
        </div>
        </div>

        <div className="px-6 py-5">
          {/* Info Alert */}
          <div className="mb-5 rounded-lg border border-warn-100 bg-warn-50 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 shrink-0 text-warn" size={18} />
              <div className="flex-1">
                <p className="text-sm font-medium text-warn-dark">
                  Önemli Bilgi
                </p>
                <p className="mt-1 text-xs text-warn-dark/80">
                  Bu işlem revision'ı <strong>CHANGES_REQUESTED</strong> durumuna
                  geçirecek ve yazara düzenleme yapması için bildirim gönderecektir.
                </p>
              </div>
            </div>
          </div>

          {/* Revision Info */}
          <div className="mb-5 rounded-lg border border-border bg-surface-elevated p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-1">
              Makale
            </p>
            <p className="font-medium text-text">{revision.title}</p>
          </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-text">
                Geri Bildirim Metni <span className="text-danger">*</span>
            </label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Yazara iletmek istediğiniz düzenleme taleplerini detaylı olarak yazın. Hangi bölümlerin değiştirilmesi gerektiğini, ne tür düzenlemeler istediğinizi belirtin..."
                rows={8}
                className="w-full resize-none rounded-lg border border-border bg-bg px-4 py-3 text-sm leading-relaxed placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              required
              minLength={10}
                maxLength={5000}
            />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-text-muted">
                  En az 10 karakter gerekli. Açıklayıcı ve yapıcı geri bildirim yazın.
                </p>
                <p className={`text-xs font-medium ${
                  feedbackText.length < 10 
                    ? 'text-text-muted' 
                    : feedbackText.length > 4500
                    ? 'text-danger'
                    : 'text-text-secondary'
                }`}>
                  {feedbackText.length}/5000
            </p>
              </div>
          </div>

          {/* Error */}
          {feedbackMutation.error && (
              <div className="mb-5 rounded-lg border border-danger-100 bg-danger-50 p-4">
                <p className="text-sm font-medium text-danger">
              Bir hata oluştu. Lütfen tekrar deneyin.
                </p>
            </div>
          )}

          {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-divider pt-5">
            <button
              type="button"
              onClick={onClose}
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={feedbackText.trim().length < 10 || feedbackMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-warn px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-warn-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={16} />
              {feedbackMutation.isPending ? 'Gönderiliyor...' : 'Geri Bildirim Gönder'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}

