import { AlertCircle, RefreshCw } from 'lucide-react';

import type { ApiError } from '../../api/client';

interface ErrorDisplayProps {
  error: Error | ApiError | unknown;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const message = error instanceof Error 
    ? error.message 
    : (error as ApiError)?.message ?? 'Bir hata oluştu';

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
        <AlertCircle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Bir Şeyler Ters Gitti
      </h3>
      <p className="mb-4 max-w-sm text-neutral-600 dark:text-neutral-400">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <RefreshCw size={16} />
          Tekrar Dene
        </button>
      )}
    </div>
  );
}

