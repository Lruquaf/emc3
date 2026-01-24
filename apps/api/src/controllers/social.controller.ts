import type { Request, Response, NextFunction } from 'express';

import * as socialService from '../services/social.service.js';

// ═══════════════════════════════════════════════════════════
// Like Endpoints
// ═══════════════════════════════════════════════════════════

/**
 * POST /api/v1/articles/:id/like
 * Like an article
 */
export async function likeArticle(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: articleId } = req.params;
    const userId = req.user!.id;

    const result = await socialService.likeArticle(userId, articleId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/articles/:id/like
 * Unlike an article
 */
export async function unlikeArticle(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: articleId } = req.params;
    const userId = req.user!.id;

    const result = await socialService.unlikeArticle(userId, articleId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// ═══════════════════════════════════════════════════════════
// Save Endpoints
// ═══════════════════════════════════════════════════════════

/**
 * POST /api/v1/articles/:id/save
 * Save an article
 */
export async function saveArticle(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: articleId } = req.params;
    const userId = req.user!.id;

    const result = await socialService.saveArticle(userId, articleId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/articles/:id/save
 * Unsave an article
 */
export async function unsaveArticle(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: articleId } = req.params;
    const userId = req.user!.id;

    const result = await socialService.unsaveArticle(userId, articleId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/me/saved
 * Get user's saved articles
 */
export async function getSavedArticles(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { limit = 20, cursor } = req.query as { limit?: number; cursor?: string };

    const result = await socialService.getSavedArticles(userId, Number(limit), cursor);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
