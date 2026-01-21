import rateLimit from 'express-rate-limit';
import { RequestHandler } from 'express';

import { env } from '../config/env.js';
import { ERROR_CODES, RATE_LIMITS } from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// Rate Limit Configurations
// ═══════════════════════════════════════════════════════════

type RateLimitType =
  | 'login'
  | 'register'
  | 'general'
  | 'article_create'
  | 'submit_review'
  | 'follow';

const limitConfigs: Record<RateLimitType, { windowMs: number; max: number }> = {
  login: RATE_LIMITS.LOGIN,
  register: RATE_LIMITS.REGISTER,
  general: RATE_LIMITS.GENERAL,
  article_create: RATE_LIMITS.ARTICLE_CREATE,
  submit_review: RATE_LIMITS.SUBMIT_REVIEW,
  follow: RATE_LIMITS.FOLLOW,
};

// ═══════════════════════════════════════════════════════════
// Create Rate Limiter
// ═══════════════════════════════════════════════════════════

const limiters: Partial<Record<RateLimitType, RequestHandler>> = {};

function createLimiter(type: RateLimitType): RequestHandler {
  if (!env.RATE_LIMIT_ENABLED) {
    return (_req, _res, next) => next();
  }

  if (!limiters[type]) {
    const config = limitConfigs[type];

    limiters[type] = rateLimit({
      windowMs: config.windowMs,
      max: config.max,
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: type === 'login', // Only count failed attempts for login
      keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise use IP
        if (req.user) {
          return `${type}:user:${req.user.id}`;
        }
        return `${type}:ip:${req.ip}`;
      },
      handler: (_req, res) => {
        const limitConfig = limitConfigs[type];
        const retryAfterSeconds = Math.ceil(limitConfig.windowMs / 1000);

        res.status(429).json({
          code: ERROR_CODES.RATE_LIMITED,
          message: 'Too many requests. Please try again later.',
          details: {
            retryAfterSeconds,
          },
        });
      },
    });
  }

  return limiters[type]!;
}

// ═══════════════════════════════════════════════════════════
// Export Rate Limiters
// ═══════════════════════════════════════════════════════════

export function rateLimitMiddleware(type: RateLimitType): RequestHandler {
  return createLimiter(type);
}

// Convenience export
export { rateLimitMiddleware as rateLimit };

// ═══════════════════════════════════════════════════════════
// Global Rate Limiter (for all routes)
// ═══════════════════════════════════════════════════════════

export const globalRateLimit = createLimiter('general');

