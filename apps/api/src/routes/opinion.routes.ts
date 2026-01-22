import { Router } from 'express';
import {
  listOpinions,
  createOpinion,
  updateOpinion,
  removeOpinion,
  likeOpinion,
  unlikeOpinion,
  createReply,
  updateReply,
} from '../controllers/opinion.controller.js';
import { requireAuth, optionalAuth } from '../middlewares/requireAuth.js';
import { requireReviewer } from '../middlewares/requireRole.js';
import { requireVerifiedEmail } from '../middlewares/requireVerifiedEmail.js';
import { rejectBannedForWrites } from '../middlewares/rejectBannedForWrites.js';
import { validate, validateQuery, validateParams } from '../middlewares/validate.js';
import {
  OpinionListQuerySchema,
  CreateOpinionSchema,
  UpdateOpinionSchema,
  OpinionIdParamSchema,
  ArticleOpinionsParamSchema,
  RemoveOpinionSchema,
  CreateReplySchema,
  UpdateReplySchema,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// OPINION ROUTES - FAZ 6
// ═══════════════════════════════════════════════════════════

const router = Router();

// ═══════════════════════════════════════════════════════════
// ARTICLE OPINIONS ROUTES
// Prefix: /api/v1/articles/:articleId/opinions
// ═══════════════════════════════════════════════════════════

/**
 * List opinions for an article (public, optional auth for viewer state)
 * GET /api/v1/articles/:articleId/opinions
 */
router.get(
  '/articles/:articleId/opinions',
  optionalAuth,
  validateParams(ArticleOpinionsParamSchema),
  validateQuery(OpinionListQuerySchema),
  listOpinions
);

/**
 * Create a new opinion
 * POST /api/v1/articles/:articleId/opinions
 */
router.post(
  '/articles/:articleId/opinions',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(ArticleOpinionsParamSchema),
  validate(CreateOpinionSchema),
  createOpinion
);

// ═══════════════════════════════════════════════════════════
// OPINION CRUD ROUTES
// Prefix: /api/v1/opinions/:id
// ═══════════════════════════════════════════════════════════

/**
 * Update an opinion (10 minute window)
 * PUT /api/v1/opinions/:id
 */
router.put(
  '/opinions/:id',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(OpinionIdParamSchema),
  validate(UpdateOpinionSchema),
  updateOpinion
);

/**
 * Remove an opinion (soft delete - mod/admin only)
 * DELETE /api/v1/opinions/:id
 */
router.delete(
  '/opinions/:id',
  requireAuth,
  requireReviewer,
  validateParams(OpinionIdParamSchema),
  validate(RemoveOpinionSchema),
  removeOpinion
);

// ═══════════════════════════════════════════════════════════
// OPINION LIKE ROUTES
// ═══════════════════════════════════════════════════════════

/**
 * Like an opinion
 * POST /api/v1/opinions/:id/like
 */
router.post(
  '/opinions/:id/like',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(OpinionIdParamSchema),
  likeOpinion
);

/**
 * Unlike an opinion
 * DELETE /api/v1/opinions/:id/like
 */
router.delete(
  '/opinions/:id/like',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(OpinionIdParamSchema),
  unlikeOpinion
);

// ═══════════════════════════════════════════════════════════
// AUTHOR REPLY ROUTES
// ═══════════════════════════════════════════════════════════

/**
 * Create a reply to an opinion (article author only)
 * POST /api/v1/opinions/:id/reply
 */
router.post(
  '/opinions/:id/reply',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(OpinionIdParamSchema),
  validate(CreateReplySchema),
  createReply
);

/**
 * Update a reply (10 minute window)
 * PUT /api/v1/opinions/:id/reply
 */
router.put(
  '/opinions/:id/reply',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(OpinionIdParamSchema),
  validate(UpdateReplySchema),
  updateReply
);

export { router as opinionRouter };

