import type { Request, Response, NextFunction } from 'express';

import * as articleService from '../services/article.service.js';
import * as viewService from '../services/view.service.js';
import type { CreateArticleInput } from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// Public Endpoints
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/v1/articles/:slug
 * Get article by slug (public)
 */
export async function getArticleBySlug(
  req: Request<{ slug: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug } = req.params;
    const viewerId = req.user?.id;

    const article = await articleService.getArticleBySlug(slug, viewerId);

    // Track view in background (don't await)
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    viewService.trackView(article.article.id, viewerId ?? null, ip, userAgent).catch((err) => {
      console.error('Failed to track view:', err);
    });

    res.json(article);
  } catch (error) {
    next(error);
  }
}

// ═══════════════════════════════════════════════════════════
// Protected Endpoints (Author)
// ═══════════════════════════════════════════════════════════

/**
 * POST /api/v1/articles
 * Create new article with initial draft
 */
export async function createArticle(
  req: Request<unknown, unknown, CreateArticleInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authorId = req.user!.id;
    const input = req.body;

    const result = await articleService.createArticle(authorId, input);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/articles/:id/revisions
 * Create new revision for existing article (start edit)
 */
export async function createNewRevision(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: articleId } = req.params;
    const authorId = req.user!.id;

    const result = await articleService.createNewRevision(articleId, authorId);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/articles/:id/revisions
 * Get revision history for article
 */
export async function getRevisionHistory(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: articleId } = req.params;
    const requesterId = req.user!.id;
    const requesterRoles = req.user!.roles.map((r) => r.role);

    const history = await articleService.getRevisionHistory(
      articleId,
      requesterId,
      requesterRoles
    );

    res.json(history);
  } catch (error) {
    next(error);
  }
}

