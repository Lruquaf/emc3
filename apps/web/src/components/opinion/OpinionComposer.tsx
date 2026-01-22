import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, AlertCircle } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';
import { OPINION_BODY_MIN_LENGTH, OPINION_BODY_MAX_LENGTH } from '@emc3/shared';

interface OpinionComposerProps {
  onSubmit: (bodyMarkdown: string) => Promise<void>;
  hasExistingOpinion: boolean;
  disabled?: boolean;
}

export function OpinionComposer({
  onSubmit,
  hasExistingOpinion,
  disabled = false,
}: OpinionComposerProps) {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = content.length;
  const isValidLength =
    charCount >= OPINION_BODY_MIN_LENGTH && charCount <= OPINION_BODY_MAX_LENGTH;

  const handleSubmit = async () => {
    if (!isValidLength || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(content);
      setContent('');
    } catch (err: any) {
      setError(err.message || 'Mütalaa gönderilemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center">
        <p className="text-neutral-600">
          Mütalaa yazmak için{' '}
          <Link to="/login" className="text-emerald-600 hover:underline">
            giriş yapın
          </Link>
          .
        </p>
      </div>
    );
  }

  // Email not verified
  if (!user?.emailVerified) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
        <AlertCircle className="mx-auto mb-2 h-6 w-6 text-amber-500" />
        <p className="text-amber-700">
          Mütalaa yazmak için email adresinizi doğrulamalısınız.
        </p>
      </div>
    );
  }

  // Already has opinion
  if (hasExistingOpinion) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-emerald-700">
          Bu makaleye zaten bir mütalaa yazdınız.
          <br />
          <span className="text-sm text-emerald-600">
            Her kullanıcı bir makaleye yalnızca bir mütalaa yazabilir.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <h3 className="mb-4 font-semibold text-neutral-900">Mütalaa Yaz</h3>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Düşüncelerinizi paylaşın... (Markdown desteklenir)"
        rows={5}
        disabled={disabled || isSubmitting}
        className={cn(
          'w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20',
          error
            ? 'border-rose-300 focus:border-rose-500'
            : 'border-neutral-200 focus:border-emerald-500'
        )}
      />

      {/* Character count */}
      <div className="mt-2 flex items-center justify-between text-sm">
        <span
          className={cn(
            'text-neutral-500',
            charCount > OPINION_BODY_MAX_LENGTH && 'text-rose-500',
            charCount < OPINION_BODY_MIN_LENGTH && charCount > 0 && 'text-amber-500'
          )}
        >
          {charCount} / {OPINION_BODY_MAX_LENGTH} karakter
          {charCount < OPINION_BODY_MIN_LENGTH && charCount > 0 && (
            <span className="ml-2">
              (en az {OPINION_BODY_MIN_LENGTH} karakter gerekli)
            </span>
          )}
        </span>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-rose-500">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Submit button */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-neutral-500">
          ⚠️ Makale başına sadece 1 mütalaa yazabilirsiniz.
        </p>
        <button
          onClick={handleSubmit}
          disabled={!isValidLength || isSubmitting || disabled}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            'Gönderiliyor...'
          ) : (
            <>
              <Send size={16} />
              Gönder
            </>
          )}
        </button>
      </div>
    </div>
  );
}

