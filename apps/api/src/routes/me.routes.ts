import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';

import * as meController from '../controllers/me.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { rejectBannedForWrites } from '../middlewares/rejectBannedForWrites.js';
import { validate, validateQuery } from '../middlewares/validate.js';
import { AppError } from '../utils/errors.js';
import {
  myRevisionsQuerySchema,
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from '@emc3/shared';

export const meRouter = Router();

// Multer instance: memory storage, 5 MB limit
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Translate multer LIMIT_FILE_SIZE into a readable AppError
const handleMulterError = (
  err: unknown,
  _req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (err && typeof err === 'object' && 'code' in err) {
    const e = err as { code: string };
    if (e.code === 'LIMIT_FILE_SIZE') {
      return next(AppError.badRequest("Resim boyutu 5MB'dan küçük olmalıdır.", { field: 'avatar' }));
    }
  }
  next(err);
};

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

meRouter.post(
  '/avatar',
  requireAuth,
  rejectBannedForWrites,
  avatarUpload.single('avatar'),
  handleMulterError,
  meController.uploadAvatar
);

meRouter.delete(
  '/avatar',
  requireAuth,
  rejectBannedForWrites,
  meController.deleteAvatar
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

