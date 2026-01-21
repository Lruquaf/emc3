import { Router } from 'express';

import * as adminController from '../controllers/admin.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole, requireAdmin, requireReviewer } from '../middlewares/requireRole.js';
import { validate, validateParams, validateQuery } from '../middlewares/validate.js';
import {
  reviewQueueQuerySchema,
  publishQueueQuerySchema,
  revisionIdParamSchema,
  feedbackSchema,
} from '@emc3/shared';

export const adminRouter = Router();

// All admin routes require authentication
adminRouter.use(requireAuth);

// ═══════════════════════════════════════════════════════════
// Review Queue (REVIEWER or ADMIN)
// ═══════════════════════════════════════════════════════════

// Get review queue
adminRouter.get(
  '/reviews',
  requireReviewer,
  validateQuery(reviewQueueQuerySchema),
  adminController.getReviewQueue
);

// Get revision detail for review
adminRouter.get(
  '/revisions/:id',
  requireReviewer,
  validateParams(revisionIdParamSchema),
  adminController.getRevisionDetail
);

// Give feedback (changes requested)
adminRouter.post(
  '/revisions/:id/feedback',
  requireReviewer,
  validateParams(revisionIdParamSchema),
  validate(feedbackSchema),
  adminController.giveFeedback
);

// Approve revision
adminRouter.post(
  '/revisions/:id/approve',
  requireReviewer,
  validateParams(revisionIdParamSchema),
  adminController.approveRevision
);

// ═══════════════════════════════════════════════════════════
// Publish Queue (ADMIN only)
// ═══════════════════════════════════════════════════════════

// Get publish queue
adminRouter.get(
  '/publish-queue',
  requireAdmin,
  validateQuery(publishQueueQuerySchema),
  adminController.getPublishQueue
);

// Publish revision
adminRouter.post(
  '/revisions/:id/publish',
  requireAdmin,
  validateParams(revisionIdParamSchema),
  adminController.publishRevision
);

