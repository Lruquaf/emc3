import { Bookmark } from 'lucide-react';

import { useSave } from '../../hooks/useSave';
import { cn } from '../../utils/cn';

interface SaveButtonProps {
  articleId: string;
  initialSaved: boolean;
  initialCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  variant?: 'default' | 'minimal';
  className?: string;
}

export function SaveButton({
  articleId,
  initialSaved,
  initialCount = 0,
  size = 'md',
  showCount = false,
  variant = 'default',
  className,
}: SaveButtonProps) {
  const { saved, saveCount, toggle, isLoading } = useSave({
    articleId,
    initialSaved,
    initialCount,
  });

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggle}
        disabled={isLoading}
        className={cn(
          'rounded-full p-2 transition-all',
          'hover:bg-neutral-100 focus:outline-none focus:ring-2',
          'focus:ring-emerald-500 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          saved && 'text-amber-600',
          className
        )}
        aria-label={saved ? 'Kaydı kaldır' : 'Kaydet'}
        aria-pressed={saved}
      >
        <Bookmark
          size={iconSizes[size]}
          className={cn(saved && 'fill-amber-500')}
        />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg border transition-all',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        saved
          ? 'border-amber-500 bg-amber-50 text-amber-600 hover:bg-amber-100'
          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-amber-500',
        showCount ? 'gap-2 px-3' : '',
        sizeClasses[size],
        className
      )}
      aria-label={saved ? 'Kaydı kaldır' : 'Kaydet'}
      aria-pressed={saved}
    >
      <Bookmark
        size={iconSizes[size]}
        className={cn(saved && 'fill-amber-500', isLoading && 'animate-pulse')}
      />
      {showCount && (
        <span className="tabular-nums">{saveCount}</span>
      )}
    </button>
  );
}

