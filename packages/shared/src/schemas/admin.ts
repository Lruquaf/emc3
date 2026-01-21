import { z } from 'zod';

// Note: revisionIdParamSchema is already defined in revision.ts, reuse it

// ═══════════════════════════════════════════════════════════
// Query Schemas
// ═══════════════════════════════════════════════════════════

export const reviewQueueQuerySchema = z.object({
  status: z
    .enum(['REV_IN_REVIEW', 'REV_CHANGES_REQUESTED'])
    .optional()
    .default('REV_IN_REVIEW'),
  authorId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  sort: z.enum(['oldest', 'newest']).optional().default('oldest'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export type ReviewQueueQuery = z.infer<typeof reviewQueueQuerySchema>;

export const publishQueueQuerySchema = z.object({
  sort: z.enum(['oldest', 'newest']).optional().default('oldest'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export type PublishQueueQuery = z.infer<typeof publishQueueQuerySchema>;

// ═══════════════════════════════════════════════════════════
// Body Schemas
// ═══════════════════════════════════════════════════════════

export const feedbackSchema = z.object({
  feedbackText: z
    .string()
    .min(10, 'Geri bildirim en az 10 karakter olmalı')
    .max(5000, 'Geri bildirim en fazla 5000 karakter olabilir')
    .trim(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

