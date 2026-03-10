import { z } from 'zod';

import { uuidSchema } from './common.js';

// Markdown içindeki bağlantıları doğrulamak için yardımcı fonksiyon:
// - Yalnızca https:// ile başlayan linklere izin ver
// - Çok uzun veya aşırı sayıda linki reddet
const validateArticleLinks = (value: string, ctx: z.RefinementCtx) => {
  const urlRegex = /https?:\/\/[^\s)]+/gi;
  const matches = value.match(urlRegex) ?? [];

  const MAX_LINKS = 50;
  const MAX_URL_LENGTH = 2000;

  if (matches.length > MAX_LINKS) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Bir makalede en fazla ${MAX_LINKS} bağlantıya izin verilir.`,
      path: ['contentMarkdown'],
    });
  }

  for (const raw of matches) {
    if (raw.length > MAX_URL_LENGTH) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bir bağlantı çok uzun. Lütfen URL\'yi kısaltın.',
        path: ['contentMarkdown'],
      });
      break;
    }

    if (raw.toLowerCase().startsWith('http://')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Makalelerdeki bağlantılar yalnızca https:// ile başlamalıdır.',
        path: ['contentMarkdown'],
      });
      break;
    }
  }
};

/**
 * Create article schema
 */
export const createArticleSchema = z.object({
  title: z
    .string()
    .min(5, 'Başlık en az 5 karakter olmalı')
    .max(200, 'Başlık en fazla 200 karakter olabilir'),
  summary: z
    .string()
    .max(500, 'Özet en fazla 500 karakter olabilir')
    .optional()
    .default(''),
  contentMarkdown: z
    .string()
    .min(100, 'İçerik en az 100 karakter olmalı')
    .max(100000)
    .superRefine(validateArticleLinks),
  bibliography: z.string().max(10000).optional().default(''),
  categoryIds: z
    .array(uuidSchema)
    .min(1, 'En az bir kategori seçmelisiniz')
    .max(5, 'En fazla 5 kategori seçebilirsiniz'),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;

/**
 * Update revision schema
 */
export const updateRevisionSchema = createArticleSchema.partial();

export type UpdateRevisionInput = z.infer<typeof updateRevisionSchema>;

/**
 * Feed query schema
 */
export const feedQuerySchema = z.object({
  query: z.string().max(100).optional(),
  category: z.string().optional(),
  sort: z.enum(['new', 'popular']).default('new'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export type FeedQueryInput = z.infer<typeof feedQuerySchema>;

