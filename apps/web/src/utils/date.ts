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

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/**
 * Hybrid date format: within 24h → "X dakika önce" / "X saat önce";
 * after 24h → exact date-time (tr-TR).
 * Returns "—" when the input is empty or invalid.
 */
export function formatHybridDateSafe(
  value: string | null | undefined
): string {
  const date = parseDateSafe(value);
  if (!date) return INVALID_PLACEHOLDER;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return date.toLocaleString('tr-TR', dateTimeFormatOptions);

  if (diffMs < MS_PER_DAY) {
    const hours = Math.floor(diffMs / MS_PER_HOUR);
    if (hours === 0) {
      const minutes = Math.max(1, Math.floor(diffMs / MS_PER_MINUTE));
      return `${minutes} dakika önce`;
    }
    return `${hours} saat önce`;
  }

  return date.toLocaleString('tr-TR', dateTimeFormatOptions);
}

const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

/**
 * Format a date as relative time ("X dakika önce", "Dün", ...) or full locale date.
 * Returns "—" when the input is empty or invalid, so "Invalid Date" never appears in the UI.
 * @deprecated Prefer formatHybridDateSafe for feed/article/opinion dates.
 */
export function formatRelativeDateSafe(
  value: string | null | undefined
): string {
  const date = parseDateSafe(value);
  if (!date) return INVALID_PLACEHOLDER;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / MS_PER_DAY);

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / MS_PER_HOUR);
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / MS_PER_MINUTE);
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
