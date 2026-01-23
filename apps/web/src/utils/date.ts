const INVALID_PLACEHOLDER = '—';

/**
 * Parse a date string safely. Returns null for empty, invalid, or non-parseable values.
 */
export function parseDateSafe(
  value: string | null | undefined
): Date | null {
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Format a date as relative time ("X dakika önce", "Dün", ...) or full locale date.
 * Returns "—" when the input is empty or invalid, so "Invalid Date" never appears in the UI.
 */
export function formatRelativeDateSafe(
  value: string | null | undefined
): string {
  const date = parseDateSafe(value);
  if (!date) return INVALID_PLACEHOLDER;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} dakika önce`;
    }
    return `${diffHours} saat önce`;
  }

  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;

  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
