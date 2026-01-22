import { Router } from 'express';

import * as socialController from '../controllers/social.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireVerifiedEmail } from '../middlewares/requireVerifiedEmail.js';
import { rejectBannedForWrites } from '../middlewares/rejectBannedForWrites.js';
import { validateParams, validateQuery } from '../middlewares/validate.js';
import {
  ArticleIdParamSchema,
  SavedArticlesQuerySchema,
} from '@emc3/shared';

export const socialRouter = Router();

// ═══════════════════════════════════════════════════════════
// Like Routes (under /articles/:id)
// ═══════════════════════════════════════════════════════════

socialRouter.post(
  '/articles/:id/like',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(ArticleIdParamSchema),
  socialController.likeArticle
);

socialRouter.delete(
  '/articles/:id/like',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(ArticleIdParamSchema),
  socialController.unlikeArticle
);

// ═══════════════════════════════════════════════════════════
// Save Routes (under /articles/:id)
// ═══════════════════════════════════════════════════════════

socialRouter.post(
  '/articles/:id/save',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(ArticleIdParamSchema),
  socialController.saveArticle
);

socialRouter.delete(
  '/articles/:id/save',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(ArticleIdParamSchema),
  socialController.unsaveArticle
);

// ═══════════════════════════════════════════════════════════
// Saved Articles Route (under /me)
// ═══════════════════════════════════════════════════════════

socialRouter.get(
  '/me/saved',
  requireAuth,
  validateQuery(SavedArticlesQuerySchema),
  socialController.getSavedArticles
);

