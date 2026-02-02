import { Router } from 'express';

import * as articleController from '../controllers/article.controller.js';
import { optionalAuth, requireAuth } from '../middlewares/requireAuth.js';
import { requireVerifiedEmail } from '../middlewares/requireVerifiedEmail.js';
import { rejectBannedForWrites } from '../middlewares/rejectBannedForWrites.js';
import { rejectBannedForContentRead } from '../middlewares/rejectBannedForContentRead.js';
import { validate, validateParams } from '../middlewares/validate.js';
import { rateLimit } from '../middlewares/rateLimit.js';
import {
  createArticleSchema,
  articleIdParamSchema,
} from '@emc3/shared';

export const articlesRouter = Router();

// ═══════════════════════════════════════════════════════════
// Public Routes
// ═══════════════════════════════════════════════════════════

// Read article by ID (public; optionalAuth for viewerInteraction; banned users blocked)
articlesRouter.get(
  '/:id',
  optionalAuth,
  rejectBannedForContentRead,
  validateParams(articleIdParamSchema),
  articleController.getArticleById
);

// ═══════════════════════════════════════════════════════════
// Protected Routes (Author)
// ═══════════════════════════════════════════════════════════

// Create new article with initial draft
articlesRouter.post(
  '/',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  rateLimit('article_create'),
  validate(createArticleSchema),
  articleController.createArticle
);

// Create new revision for existing article (start edit)
articlesRouter.post(
  '/:id/revisions',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(articleIdParamSchema),
  articleController.createNewRevision
);

// Get revision history for article (author or reviewer)
articlesRouter.get(
  '/:id/revisions',
  requireAuth,
  validateParams(articleIdParamSchema),
  articleController.getRevisionHistory
);

