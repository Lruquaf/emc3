import { useState } from 'react';
import { Send, X } from 'lucide-react';

import { cn } from '../../utils/cn';
import { REPLY_BODY_MIN_LENGTH, REPLY_BODY_MAX_LENGTH } from '@emc3/shared';

interface AuthorReplyComposerProps {
  onSubmit: (bodyMarkdown: string) => Promise<void>;
  onCancel: () => void;
}

export function AuthorReplyComposer({
  onSubmit,
  onCancel,
}: AuthorReplyComposerProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const charCount = content.length;
  const isValid =
    charCount >= REPLY_BODY_MIN_LENGTH && charCount <= REPLY_BODY_MAX_LENGTH;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-700">Cevap Yaz</span>
        <button
          onClick={onCancel}
          className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
        >
          <X size={16} />
        </button>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Cevabınızı yazın..."
        rows={3}
        disabled={isSubmitting}
        className="w-full rounded-lg border border-neutral-200 bg-white p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />

      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-xs text-neutral-500',
            charCount > REPLY_BODY_MAX_LENGTH && 'text-rose-500'
          )}
        >
          {charCount} / {REPLY_BODY_MAX_LENGTH}
        </span>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
          </button>
        </div>
      </div>
    </div>
  );
}

