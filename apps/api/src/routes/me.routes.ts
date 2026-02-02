import { Router } from 'express';

import * as meController from '../controllers/me.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { rejectBannedForWrites } from '../middlewares/rejectBannedForWrites.js';
import { validate, validateQuery } from '../middlewares/validate.js';
import {
  myRevisionsQuerySchema,
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from '@emc3/shared';

export const meRouter = Router();

// ═══════════════════════════════════════════════════════════
// My Profile
// ═══════════════════════════════════════════════════════════

meRouter.patch(
  '/profile',
  requireAuth,
  rejectBannedForWrites,
  validate(updateProfileSchema),
  meController.updateProfile
);

meRouter.get(
  '/avatar/upload-signature',
  requireAuth,
  rejectBannedForWrites,
  meController.getAvatarUploadSignature
);

// ═══════════════════════════════════════════════════════════
// My Revisions
// ═══════════════════════════════════════════════════════════

meRouter.get(
  '/revisions',
  requireAuth,
  rejectBannedForWrites,
  validateQuery(myRevisionsQuerySchema),
  meController.getMyRevisions
);

// ═══════════════════════════════════════════════════════════
// Account Management
// ═══════════════════════════════════════════════════════════

meRouter.post(
  '/change-password',
  requireAuth,
  rejectBannedForWrites,
  validate(changePasswordSchema),
  meController.changePassword
);

meRouter.post(
  '/delete-account',
  requireAuth,
  validate(deleteAccountSchema),
  meController.deleteAccount
);

