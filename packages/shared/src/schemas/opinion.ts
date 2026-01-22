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
    .max(OPINION_BODY_MAX_LENGTH, `Mütalaa en fazla ${OPINION_BODY_MAX_LENGTH} karakter olabilir`),
});

/**
 * Update opinion request
 */
export const UpdateOpinionSchema = z.object({
  bodyMarkdown: z
    .string()
    .min(OPINION_BODY_MIN_LENGTH, `Mütalaa en az ${OPINION_BODY_MIN_LENGTH} karakter olmalıdır`)
    .max(OPINION_BODY_MAX_LENGTH, `Mütalaa en fazla ${OPINION_BODY_MAX_LENGTH} karakter olabilir`),
});

/**
 * Create reply request
 */
export const CreateReplySchema = z.object({
  bodyMarkdown: z
    .string()
    .min(REPLY_BODY_MIN_LENGTH, `Cevap en az ${REPLY_BODY_MIN_LENGTH} karakter olmalıdır`)
    .max(REPLY_BODY_MAX_LENGTH, `Cevap en fazla ${REPLY_BODY_MAX_LENGTH} karakter olabilir`),
});

/**
 * Update reply request
 */
export const UpdateReplySchema = z.object({
  bodyMarkdown: z
    .string()
    .min(REPLY_BODY_MIN_LENGTH, `Cevap en az ${REPLY_BODY_MIN_LENGTH} karakter olmalıdır`)
    .max(REPLY_BODY_MAX_LENGTH, `Cevap en fazla ${REPLY_BODY_MAX_LENGTH} karakter olabilir`),
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

