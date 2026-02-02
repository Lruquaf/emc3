import { RequestHandler } from 'express';

import { ERROR_CODES } from '@emc3/shared';

/**
 * Reject content read operations for banned users.
 * Use after optionalAuth - when user is authenticated and banned,
 * block access to feed and article content.
 *
 * Banned users CANNOT:
 * - View feed (global, following)
 * - View articles
 * - Search users (they shouldn't browse)
 */
export const rejectBannedForContentRead: RequestHandler = (req, res, next) => {
  // Only applies when user is authenticated
  if (!req.user) {
    return next();
  }

  if (req.user.isBanned) {
    res.status(403).json({
      code: ERROR_CODES.BANNED,
      message:
        'Hesabınız askıya alındı. Sadece itiraz sayfasına erişebilirsiniz.',
    });
    return;
  }

  next();
};
