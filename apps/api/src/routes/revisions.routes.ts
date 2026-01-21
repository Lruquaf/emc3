import { Router } from 'express';

import * as revisionController from '../controllers/revision.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireVerifiedEmail } from '../middlewares/requireVerifiedEmail.js';
import { rejectBannedForWrites } from '../middlewares/rejectBannedForWrites.js';
import { validate, validateParams } from '../middlewares/validate.js';
import { rateLimit } from '../middlewares/rateLimit.js';
import { updateRevisionSchema, revisionIdParamSchema } from '@emc3/shared';

export const revisionsRouter = Router();

// ═══════════════════════════════════════════════════════════
// Protected Routes (Author)
// ═══════════════════════════════════════════════════════════

// Get single revision (for editing)
revisionsRouter.get(
  '/:id',
  requireAuth,
  validateParams(revisionIdParamSchema),
  revisionController.getRevision
);

// Update draft/changes_requested revision
revisionsRouter.put(
  '/:id',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(revisionIdParamSchema),
  validate(updateRevisionSchema),
  revisionController.updateRevision
);

// Delete draft revision
revisionsRouter.delete(
  '/:id',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(revisionIdParamSchema),
  revisionController.deleteRevision
);

// Submit revision to review
revisionsRouter.post(
  '/:id/submit',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  rateLimit('submit_review'),
  validateParams(revisionIdParamSchema),
  revisionController.submitToReview
);

// Withdraw from review
revisionsRouter.post(
  '/:id/withdraw',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  validateParams(revisionIdParamSchema),
  revisionController.withdrawFromReview
);

