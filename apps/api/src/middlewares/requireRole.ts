import { RequestHandler } from 'express';
import { RoleName } from '@prisma/client';

import { ERROR_CODES } from '@emc3/shared';

/**
 * Require specific role(s)
 * Must be used after requireAuth
 */
export function requireRole(...allowedRoles: RoleName[]): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        code: ERROR_CODES.UNAUTHENTICATED,
        message: 'Authentication required',
      });
      return;
    }

    const userRoles = req.user.roles.map((r) => r.role);
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      res.status(403).json({
        code: ERROR_CODES.FORBIDDEN,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
}

/**
 * Shorthand: require ADMIN role
 */
export const requireAdmin = requireRole('ADMIN');

/**
 * Shorthand: require REVIEWER or ADMIN role
 */
export const requireReviewer = requireRole('REVIEWER', 'ADMIN');

