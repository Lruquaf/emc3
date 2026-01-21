import { z } from 'zod';

// ═══════════════════════════════════════════════════════════
// Parameter Schemas
// ═══════════════════════════════════════════════════════════

export const articleSlugParamSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(300)
    .regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
});

export type ArticleSlugParam = z.infer<typeof articleSlugParamSchema>;

export const articleIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type ArticleIdParam = z.infer<typeof articleIdParamSchema>;

export const revisionIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type RevisionIdParam = z.infer<typeof revisionIdParamSchema>;

// ═══════════════════════════════════════════════════════════
// Query Schemas
// ═══════════════════════════════════════════════════════════

export const myRevisionsQuerySchema = z.object({
  status: z
    .enum([
      'REV_DRAFT',
      'REV_IN_REVIEW',
      'REV_CHANGES_REQUESTED',
      'REV_APPROVED',
      'REV_WITHDRAWN',
    ])
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export type MyRevisionsQuery = z.infer<typeof myRevisionsQuerySchema>;

