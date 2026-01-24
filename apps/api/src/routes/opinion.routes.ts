import { Router } from 'express';

import * as opinionController from '../controllers/opinion.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireVerifiedEmail } from '../middlewares/requireVerifiedEmail.js';
import { rejectBannedForWrites } from '../middlewares/rejectBannedForWrites.js';
import { validate, validateParams, validateQuery } from '../middlewares/validate.js';
import {
  articleIdParamSchema,
  OpinionIdParamSchema,
  OpinionListQuerySchema,
  CreateOpinionSchema,
  UpdateOpinionSchema,
  CreateReplySchema,
  UpdateReplySchema,
} from '@emc3/shared';

export const opinionRouter = Router();

// ═══════════════════════════════════════════════════════════
// Public Routes
// ═══════════════════════════════════════════════════════════

// Get opinions for article
opinionRouter.get(
  '/articles/:id/opinions',
  validateParams(articleIdParamSchema),
  validateQuery(OpinionListQuerySchema),
  opinionController.getOpinions
);

// ═══════════════════════════════════════════════════════════
// Protected Routes
// ═══════════════════════════════════════════════════════════

// Create opinion
opinionRouter.post(
  '/articles/:id/opinions',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(articleIdParamSchema),
  validate(CreateOpinionSchema),
  opinionController.createOpinion
);

// Update opinion
opinionRouter.put(
  '/opinions/:id',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(OpinionIdParamSchema),
  validate(UpdateOpinionSchema),
  opinionController.updateOpinion
);

// Delete opinion
opinionRouter.delete(
  '/opinions/:id',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(OpinionIdParamSchema),
  opinionController.deleteOpinion
);

// Like opinion
opinionRouter.post(
  '/opinions/:id/like',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(OpinionIdParamSchema),
  opinionController.likeOpinion
);

// Unlike opinion
opinionRouter.delete(
  '/opinions/:id/like',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(OpinionIdParamSchema),
  opinionController.unlikeOpinion
);

// Create reply
opinionRouter.post(
  '/opinions/:id/reply',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(OpinionIdParamSchema),
  validate(CreateReplySchema),
  opinionController.createReply
);

// Update reply
opinionRouter.put(
  '/opinions/:id/reply',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(OpinionIdParamSchema),
  validate(UpdateReplySchema),
  opinionController.updateReply
);
