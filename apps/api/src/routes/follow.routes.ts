import { Router } from 'express';

import * as followController from '../controllers/follow.controller.js';
import { optionalAuth, requireAuth } from '../middlewares/requireAuth.js';
import { requireVerifiedEmail } from '../middlewares/requireVerifiedEmail.js';
import { rejectBannedForWrites } from '../middlewares/rejectBannedForWrites.js';
import { validateParams, validateQuery } from '../middlewares/validate.js';
import { rateLimit } from '../middlewares/rateLimit.js';
import {
  UserIdParamSchema,
  UsernameParamSchema,
  FollowListQuerySchema,
} from '@emc3/shared';

export const followRouter = Router();

// ═══════════════════════════════════════════════════════════
// Follow/Unfollow Routes
// ═══════════════════════════════════════════════════════════

// Follow a user
followRouter.post(
  '/users/:id/follow',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  rateLimit('follow'),
  validateParams(UserIdParamSchema),
  followController.followUser
);

// Unfollow a user
followRouter.delete(
  '/users/:id/follow',
  requireAuth,
  requireVerifiedEmail,
  rejectBannedForWrites,
  rateLimit('follow'),
  validateParams(UserIdParamSchema),
  followController.unfollowUser
);

// ═══════════════════════════════════════════════════════════
// Follower/Following List Routes
// ═══════════════════════════════════════════════════════════

// Get user's followers
followRouter.get(
  '/users/:username/followers',
  optionalAuth,
  validateParams(UsernameParamSchema),
  validateQuery(FollowListQuerySchema),
  followController.getFollowers
);

// Get users that a user is following
followRouter.get(
  '/users/:username/following',
  optionalAuth,
  validateParams(UsernameParamSchema),
  validateQuery(FollowListQuerySchema),
  followController.getFollowing
);

