import { Router } from 'express';

import * as meController from '../controllers/me.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { validate, validateQuery } from '../middlewares/validate.js';
import {
  myRevisionsQuerySchema,
  updateProfileSchema,
  changePasswordSchema,
  deactivateAccountSchema,
} from '@emc3/shared';

export const meRouter = Router();

// ═══════════════════════════════════════════════════════════
// My Profile
// ═══════════════════════════════════════════════════════════

meRouter.patch(
  '/profile',
  requireAuth,
  validate(updateProfileSchema),
  meController.updateProfile
);

// ═══════════════════════════════════════════════════════════
// My Revisions
// ═══════════════════════════════════════════════════════════

meRouter.get(
  '/revisions',
  requireAuth,
  validateQuery(myRevisionsQuerySchema),
  meController.getMyRevisions
);

// ═══════════════════════════════════════════════════════════
// Account Management
// ═══════════════════════════════════════════════════════════

meRouter.post(
  '/change-password',
  requireAuth,
  validate(changePasswordSchema),
  meController.changePassword
);

meRouter.post(
  '/deactivate',
  requireAuth,
  validate(deactivateAccountSchema),
  meController.deactivateAccount
);

