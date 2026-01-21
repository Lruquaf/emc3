import { RequestHandler } from 'express';

import { verifyToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';
import { ERROR_CODES } from '@emc3/shared';

/**
 * Require authenticated user
 * Extracts and verifies JWT from cookies
 */
export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
      res.status(401).json({
        code: ERROR_CODES.UNAUTHENTICATED,
        message: 'Authentication required',
      });
      return;
    }

    // Verify and decode token
    const payload = verifyToken(accessToken);

    if (payload.type !== 'access') {
      res.status(401).json({
        code: ERROR_CODES.UNAUTHENTICATED,
        message: 'Invalid token type',
      });
      return;
    }

    // Get fresh user data (for ban status etc.)
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: true,
        ban: true,
      },
    });

    if (!user) {
      res.status(401).json({
        code: ERROR_CODES.UNAUTHENTICATED,
        message: 'User not found',
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      emailVerified: user.emailVerified,
      roles: user.roles,
      isBanned: user.ban?.isBanned ?? false,
    };

    next();
  } catch {
    res.status(401).json({
      code: ERROR_CODES.UNAUTHENTICATED,
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Optional auth - attaches user if token present, but doesn't require it
 */
export const optionalAuth: RequestHandler = async (req, res, next) => {
  try {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
      return next();
    }

    const payload = verifyToken(accessToken);

    if (payload.type !== 'access') {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: true,
        ban: true,
      },
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified,
        roles: user.roles,
        isBanned: user.ban?.isBanned ?? false,
      };
    }

    next();
  } catch {
    // Silently continue without user
    next();
  }
};

