import type { Request, Response, NextFunction } from 'express';

import * as feedService from '../services/feed.service.js';
import type { GlobalFeedParams, FollowingFeedParams } from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// Feed Endpoints
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/v1/feed/global
 * Get global feed (public)
 */
export async function getGlobalFeed(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const viewerId = req.user?.id;
    const params = req.query as unknown as GlobalFeedParams;

    const result = await feedService.getGlobalFeed(params, viewerId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/feed/following
 * Get following feed (auth required)
 */
export async function getFollowingFeed(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const params = req.query as unknown as FollowingFeedParams;

    const result = await feedService.getFollowingFeed(userId, params);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// ═══════════════════════════════════════════════════════════
// Search Endpoints
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/v1/search/users
 * Search users by username or display name
 */
export async function searchUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const viewerId = req.user?.id;
    const { query, limit = 20, cursor } = req.query as unknown as { query: string; limit?: number; cursor?: string };

    const result = await feedService.searchUsers(query, Number(limit), cursor, viewerId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

