import { z } from 'zod';

// Note: revisionIdParamSchema is already defined in revision.ts, reuse it

// ═══════════════════════════════════════════════════════════
// Param Schemas
// ═══════════════════════════════════════════════════════════

export const userIdParamSchema = z.object({
  id: z.string().uuid('Geçersiz kullanıcı ID'),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;

// articleIdParamSchema is imported from revision.ts

export const appealIdParamSchema = z.object({
  id: z.string().uuid('Geçersiz itiraz ID'),
});

export type AppealIdParam = z.infer<typeof appealIdParamSchema>;

// ═══════════════════════════════════════════════════════════
// User Moderation Schemas
// ═══════════════════════════════════════════════════════════

export const banUserSchema = z.object({
  reason: z
    .string()
    .min(10, 'Ban sebebi en az 10 karakter olmalıdır')
    .max(500, 'Ban sebebi en fazla 500 karakter olabilir')
    .trim(),
});

export type BanUserInput = z.infer<typeof banUserSchema>;

export const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'REVIEWER']),
  action: z.enum(['grant', 'revoke']),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export const adminUserListQuerySchema = z.object({
  query: z.string().max(100).optional(),
  role: z.enum(['ADMIN', 'REVIEWER']).optional(),
  isBanned: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type AdminUserListQuery = z.infer<typeof adminUserListQuerySchema>;

// ═══════════════════════════════════════════════════════════
// Article Moderation Schemas
// ═══════════════════════════════════════════════════════════

export const removeArticleSchema = z.object({
  reason: z
    .string()
    .min(10, 'Kaldırma sebebi en az 10 karakter olmalıdır')
    .max(500, 'Kaldırma sebebi en fazla 500 karakter olabilir')
    .trim(),
});

export type RemoveArticleInput = z.infer<typeof removeArticleSchema>;

export const removeOpinionSchema = z.object({
  reason: z
    .string()
    .min(10, 'Kaldırma sebebi en az 10 karakter olmalıdır')
    .max(500, 'Kaldırma sebebi en fazla 500 karakter olabilir')
    .trim(),
});

export type RemoveOpinionInput = z.infer<typeof removeOpinionSchema>;

export const removeOpinionReplySchema = z.object({
  reason: z
    .string()
    .min(10, 'Kaldırma sebebi en az 10 karakter olmalıdır')
    .max(500, 'Kaldırma sebebi en fazla 500 karakter olabilir')
    .trim(),
});

export type RemoveOpinionReplyInput = z.infer<typeof removeOpinionReplySchema>;

export const adminArticleListQuerySchema = z.object({
  query: z.string().max(200).optional(),
  status: z.enum(['PUBLISHED', 'REMOVED']).optional(),
  authorId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type AdminArticleListQuery = z.infer<typeof adminArticleListQuerySchema>;

// ═══════════════════════════════════════════════════════════
// Audit Log Schemas
// ═══════════════════════════════════════════════════════════

export const auditLogListQuerySchema = z.object({
  action: z.string().optional(),
  targetType: z
    .enum(['user', 'article', 'revision', 'opinion', 'opinion_reply', 'category', 'appeal'])
    .optional(),
  targetId: z.string().uuid().optional(),
  actorId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

export type AuditLogListQuery = z.infer<typeof auditLogListQuerySchema>;

// ═══════════════════════════════════════════════════════════
// Appeal Schemas
// ═══════════════════════════════════════════════════════════

export const appealListQuerySchema = z.object({
  status: z.enum(['OPEN', 'CLOSED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type AppealListQuery = z.infer<typeof appealListQuerySchema>;

export const createAppealSchema = z.object({
  message: z
    .string()
    .min(20, 'İtiraz mesajı en az 20 karakter olmalıdır')
    .max(2000, 'İtiraz mesajı en fazla 2000 karakter olabilir')
    .trim(),
});

export type CreateAppealInput = z.infer<typeof createAppealSchema>;

export const appealMessageSchema = z.object({
  message: z
    .string()
    .min(5, 'Mesaj en az 5 karakter olmalıdır')
    .max(2000, 'Mesaj en fazla 2000 karakter olabilir')
    .trim(),
});

export type AppealMessageInput = z.infer<typeof appealMessageSchema>;

export const closeAppealSchema = z.object({
  resolution: z.enum(['upheld', 'overturned']).optional(),
  message: z.string().max(500).optional(),
});

export type CloseAppealInput = z.infer<typeof closeAppealSchema>;

// ═══════════════════════════════════════════════════════════
// Review Queue Schemas
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
// Review Body Schemas
// ═══════════════════════════════════════════════════════════

export const feedbackSchema = z.object({
  feedbackText: z
    .string()
    .min(10, 'Geri bildirim en az 10 karakter olmalı')
    .max(5000, 'Geri bildirim en fazla 5000 karakter olabilir')
    .trim(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

