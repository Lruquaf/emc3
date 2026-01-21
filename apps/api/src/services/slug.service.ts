import slugifyLib from 'slugify';

import { prisma } from '../lib/prisma.js';

// ═══════════════════════════════════════════════════════════
// Turkish Character Mapping
// ═══════════════════════════════════════════════════════════

const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  İ: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
};

/**
 * Replace Turkish characters with ASCII equivalents
 */
function replaceTurkishChars(text: string): string {
  return text
    .split('')
    .map((char) => TURKISH_CHAR_MAP[char] || char)
    .join('');
}

// ═══════════════════════════════════════════════════════════
// Slugify Function
// ═══════════════════════════════════════════════════════════

/**
 * Generate a URL-friendly slug from text
 */
export function slugify(text: string): string {
  // First replace Turkish characters
  const normalized = replaceTurkishChars(text);

  // Then use slugify library
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const slugifyFn = (slugifyLib as any).default || slugifyLib;
  return slugifyFn(normalized, {
    lower: true,
    strict: true,
    trim: true,
  });
}

// ═══════════════════════════════════════════════════════════
// Unique Slug Generation
// ═══════════════════════════════════════════════════════════

/**
 * Generate a unique slug for an article
 * If the base slug exists, append a numeric suffix
 */
export async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugify(title);

  // Limit base slug length to allow room for suffix
  const truncatedBase = baseSlug.slice(0, 200);

  let slug = truncatedBase;
  let suffix = 0;

  while (true) {
    const existing = await prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }

    suffix++;
    slug = `${truncatedBase}-${suffix}`;

    // Safety limit to prevent infinite loop
    if (suffix > 1000) {
      // Fallback: add timestamp
      slug = `${truncatedBase}-${Date.now()}`;
      break;
    }
  }

  return slug;
}

// ═══════════════════════════════════════════════════════════
// Slug Validation
// ═══════════════════════════════════════════════════════════

/**
 * Check if a string is a valid slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

