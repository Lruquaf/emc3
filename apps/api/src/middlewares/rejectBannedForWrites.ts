import { RequestHandler } from 'express';

import { ERROR_CODES } from '@emc3/shared';

/**
 * Reject write operations for banned users
 * Must be used after requireAuth
 *
 * Banned users CAN:
 * - Read public content
 * - View their own content
 * - Create/send appeals
 *
 * Banned users CANNOT:
 * - Create articles/revisions
 * - Write opinions
 * - Like/save/follow
 * - Any other write operations
 */
export const rejectBannedForWrites: RequestHandler = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({
      code: ERROR_CODES.UNAUTHENTICATED,
      message: 'Authentication required',
    });
    return;
  }

  if (req.user.isBanned) {
    res.status(403).json({
      code: ERROR_CODES.BANNED,
      message:
        'Your account has been suspended. You can only view content and submit appeals.',
    });
    return;
  }

  next();
};

/**
 * Allow only banned users (for appeal endpoints)
 */
export const requireBanned: RequestHandler = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({
      code: ERROR_CODES.UNAUTHENTICATED,
      message: 'Authentication required',
    });
    return;
  }

  if (!req.user.isBanned) {
    res.status(403).json({
      code: ERROR_CODES.FORBIDDEN,
      message: 'This action is only available for suspended accounts',
    });
    return;
  }

  next();
};

