import slugifyLib from "slugify";

import { prisma } from "../lib/prisma.js";

// ═══════════════════════════════════════════════════════════
// Turkish Character Mapping
// ═══════════════════════════════════════════════════════════

const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

/**
 * Replace Turkish characters with ASCII equivalents
 */
function replaceTurkishChars(text: string): string {
  return text
    .split("")
    .map((char) => TURKISH_CHAR_MAP[char] || char)
    .join("");
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
 * Note: Article slug was removed, this function is kept for compatibility but returns base slug only
 */
export async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugify(title);
  // Limit base slug length
  return baseSlug.slice(0, 200);
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
