import { RequestHandler } from 'express';

import { ERROR_CODES } from '@emc3/shared';

/**
 * Require email to be verified
 * Must be used after requireAuth
 */
export const requireVerifiedEmail: RequestHandler = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({
      code: ERROR_CODES.UNAUTHENTICATED,
      message: 'Authentication required',
    });
    return;
  }

  if (!req.user.emailVerified) {
    res.status(403).json({
      code: ERROR_CODES.EMAIL_NOT_VERIFIED,
      message: 'Email verification required to perform this action',
    });
    return;
  }

  next();
};

