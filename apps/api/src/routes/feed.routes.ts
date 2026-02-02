import { Router } from 'express';

import * as feedController from '../controllers/feed.controller.js';
import { requireAuth, optionalAuth } from '../middlewares/requireAuth.js';
import { rejectBannedForWrites } from '../middlewares/rejectBannedForWrites.js';
import { rejectBannedForContentRead } from '../middlewares/rejectBannedForContentRead.js';
import { validateQuery } from '../middlewares/validate.js';
import {
  GlobalFeedQuerySchema,
  FollowingFeedQuerySchema,
  UserSearchQuerySchema,
} from '@emc3/shared';

export const feedRouter = Router();

// ═══════════════════════════════════════════════════════════
// Feed Routes
// ═══════════════════════════════════════════════════════════

// Global feed (public, optional auth for viewer interactions; banned users blocked)
feedRouter.get(
  '/feed/global',
  optionalAuth,
  rejectBannedForContentRead,
  validateQuery(GlobalFeedQuerySchema),
  feedController.getGlobalFeed
);

// Following feed (auth required)
feedRouter.get(
  '/feed/following',
  requireAuth,
  rejectBannedForWrites,
  validateQuery(FollowingFeedQuerySchema),
  feedController.getFollowingFeed
);

// ═══════════════════════════════════════════════════════════
// Search Routes
// ═══════════════════════════════════════════════════════════

// Search users (banned users blocked)
feedRouter.get(
  '/search/users',
  optionalAuth,
  rejectBannedForContentRead,
  validateQuery(UserSearchQuerySchema),
  feedController.searchUsers
);

