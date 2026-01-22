import { z } from 'zod';

// ═══════════════════════════════════════════════════════════
// Category Slug Validation
// ═══════════════════════════════════════════════════════════

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const categorySlugSchema = z
  .string()
  .min(2, 'Slug en az 2 karakter olmalı')
  .max(50, 'Slug en fazla 50 karakter olabilir')
  .regex(slugRegex, 'Slug sadece küçük harf, rakam ve tire içerebilir')
  .optional();

// ═══════════════════════════════════════════════════════════
// Admin Schemas
// ═══════════════════════════════════════════════════════════

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Kategori adı en az 2 karakter olmalı')
    .max(100, 'Kategori adı en fazla 100 karakter olabilir')
    .trim(),
  slug: categorySlugSchema,
  parentId: z.string().uuid().nullable().optional(),
});

export type CreateCategorySchemaInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Kategori adı en az 2 karakter olmalı')
    .max(100, 'Kategori adı en fazla 100 karakter olabilir')
    .trim()
    .optional(),
  slug: categorySlugSchema,
});

export type UpdateCategorySchemaInput = z.infer<typeof updateCategorySchema>;

export const reparentCategorySchema = z.object({
  newParentId: z.string().uuid().nullable(),
});

export type ReparentCategorySchemaInput = z.infer<typeof reparentCategorySchema>;

// ═══════════════════════════════════════════════════════════
// Param Schemas
// ═══════════════════════════════════════════════════════════

export const categoryIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const categorySlugParamSchema = z.object({
  slug: z.string().min(2).max(50),
});

