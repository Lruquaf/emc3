import { z } from 'zod';
import {
  OPINION_BODY_MIN_LENGTH,
  OPINION_BODY_MAX_LENGTH,
  REPLY_BODY_MIN_LENGTH,
  REPLY_BODY_MAX_LENGTH,
} from '../constants/opinion.js';

// ═══════════════════════════════════════════════════════════
// OPINION SCHEMAS - FAZ 6
// ═══════════════════════════════════════════════════════════

// Basit markdown link doğrulama:
// - Sadece https:// ile başlayan linklere izin ver
// - Çok uzun veya aşırı sayıda linki reddet
const validateMarkdownLinks = (value: string, ctx: z.RefinementCtx) => {
  const urlRegex = /https?:\/\/[^\s)]+/gi;
  const matches = value.match(urlRegex) ?? [];

  const MAX_LINKS = 20;
  const MAX_URL_LENGTH = 1000;

  if (matches.length > MAX_LINKS) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Bir metinde en fazla ${MAX_LINKS} bağlantıya izin verilir.`,
      path: ['bodyMarkdown'],
    });
  }

  for (const raw of matches) {
    if (raw.length > MAX_URL_LENGTH) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bir bağlantı çok uzun. Lütfen URL\'yi kısaltın.',
        path: ['bodyMarkdown'],
      });
      break;
    }

    // Yalnızca https:// izin ver; http:// olanları reddet
    if (raw.toLowerCase().startsWith('http://')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bağlantılar yalnızca https:// ile başlamalıdır.',
        path: ['bodyMarkdown'],
      });
      break;
    }
  }
};

/**
 * Opinion list query params
 */
export const OpinionListQuerySchema = z.object({
  sort: z.enum(['helpful', 'new']).default('helpful'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

/**
 * Create opinion request
 */
export const CreateOpinionSchema = z.object({
  bodyMarkdown: z
    .string()
    .min(OPINION_BODY_MIN_LENGTH, `Mütalaa en az ${OPINION_BODY_MIN_LENGTH} karakter olmalıdır`)
    .max(OPINION_BODY_MAX_LENGTH, `Mütalaa en fazla ${OPINION_BODY_MAX_LENGTH} karakter olabilir`)
    .superRefine(validateMarkdownLinks),
});

/**
 * Update opinion request
 */
export const UpdateOpinionSchema = z.object({
  bodyMarkdown: z
    .string()
    .min(OPINION_BODY_MIN_LENGTH, `Mütalaa en az ${OPINION_BODY_MIN_LENGTH} karakter olmalıdır`)
    .max(OPINION_BODY_MAX_LENGTH, `Mütalaa en fazla ${OPINION_BODY_MAX_LENGTH} karakter olabilir`)
    .superRefine(validateMarkdownLinks),
});

/**
 * Create reply request
 */
export const CreateReplySchema = z.object({
  bodyMarkdown: z
    .string()
    .min(REPLY_BODY_MIN_LENGTH, `Cevap en az ${REPLY_BODY_MIN_LENGTH} karakter olmalıdır`)
    .max(REPLY_BODY_MAX_LENGTH, `Cevap en fazla ${REPLY_BODY_MAX_LENGTH} karakter olabilir`)
    .superRefine(validateMarkdownLinks),
});

/**
 * Update reply request
 */
export const UpdateReplySchema = z.object({
  bodyMarkdown: z
    .string()
    .min(REPLY_BODY_MIN_LENGTH, `Cevap en az ${REPLY_BODY_MIN_LENGTH} karakter olmalıdır`)
    .max(REPLY_BODY_MAX_LENGTH, `Cevap en fazla ${REPLY_BODY_MAX_LENGTH} karakter olabilir`)
    .superRefine(validateMarkdownLinks),
});

/**
 * Opinion ID param
 */
export const OpinionIdParamSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Article ID param (for opinions)
 */
export const ArticleOpinionsParamSchema = z.object({
  articleId: z.string().uuid(),
});

/**
 * Remove opinion request (with reason)
 */
export const RemoveOpinionSchema = z.object({
  reason: z.string().min(5).max(500).optional(),
});

