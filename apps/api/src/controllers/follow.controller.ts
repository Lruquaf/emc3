import type { Request, Response, NextFunction } from 'express';

import * as followService from '../services/follow.service.js';

// ═══════════════════════════════════════════════════════════
// Follow/Unfollow Endpoints
// ═══════════════════════════════════════════════════════════

/**
 * POST /api/v1/users/:id/follow
 * Follow a user
 */
export async function followUser(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const followerId = req.user!.id;
    const { id: followedId } = req.params;

    const result = await followService.followUser(followerId, followedId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/users/:id/follow
 * Unfollow a user
 */
export async function unfollowUser(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const followerId = req.user!.id;
    const { id: followedId } = req.params;

    const result = await followService.unfollowUser(followerId, followedId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// ═══════════════════════════════════════════════════════════
// Follower/Following List Endpoints
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/v1/users/:username/followers
 * Get user's followers
 */
export async function getFollowers(
  req: Request<{ username: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username } = req.params;
    const { limit = 20, cursor } = req.query as { limit?: number; cursor?: string };
    const viewerId = req.user?.id;

    const result = await followService.getFollowers(
      username,
      Number(limit),
      cursor,
      viewerId
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/users/:username/following
 * Get users that a user is following
 */
export async function getFollowing(
  req: Request<{ username: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username } = req.params;
    const { limit = 20, cursor } = req.query as { limit?: number; cursor?: string };
    const viewerId = req.user?.id;

    const result = await followService.getFollowing(
      username,
      Number(limit),
      cursor,
      viewerId
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

