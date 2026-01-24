import type { Request, Response, NextFunction } from 'express';

import * as opinionService from '../services/opinion.service.js';
import type {
  CreateOpinionRequest,
  UpdateOpinionRequest,
  CreateReplyRequest,
  UpdateReplyRequest,
  OpinionListParams,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// Public Endpoints
// ═══════════════════════════════════════════════════════════

/**
 * GET /articles/:id/opinions
 * Get opinions for an article
 */
export async function getOpinions(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: articleId } = req.params;
    const viewerId = req.user?.id;
    const query = req.query as unknown as OpinionListParams;

    const result = await opinionService.getOpinions(articleId, viewerId, query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// ═══════════════════════════════════════════════════════════
// Protected Endpoints
// ═══════════════════════════════════════════════════════════

/**
 * POST /articles/:id/opinions
 * Create opinion
 */
export async function createOpinion(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: articleId } = req.params;
    const authorId = req.user!.id;
    const input = req.body as CreateOpinionRequest;

    const result = await opinionService.createOpinion(articleId, authorId, input);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /opinions/:id
 * Update opinion
 */
export async function updateOpinion(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: opinionId } = req.params;
    const authorId = req.user!.id;
    const input = req.body as UpdateOpinionRequest;

    const result = await opinionService.updateOpinion(opinionId, authorId, input);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /opinions/:id/like
 * Like opinion
 */
export async function likeOpinion(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: opinionId } = req.params;
    const userId = req.user!.id;

    const result = await opinionService.toggleOpinionLike(opinionId, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /opinions/:id/like
 * Unlike opinion
 */
export async function unlikeOpinion(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: opinionId } = req.params;
    const userId = req.user!.id;

    const result = await opinionService.toggleOpinionLike(opinionId, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /opinions/:id/reply
 * Create author reply
 */
export async function createReply(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: opinionId } = req.params;
    const replierId = req.user!.id;
    const input = req.body as CreateReplyRequest;

    const result = await opinionService.createReply(opinionId, replierId, input);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /opinions/:id/reply
 * Update author reply
 */
export async function updateReply(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: opinionId } = req.params;
    const replierId = req.user!.id;
    const input = req.body as UpdateReplyRequest;

    const result = await opinionService.updateReply(opinionId, replierId, input);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /opinions/:id
 * Delete opinion (by author)
 */
export async function deleteOpinion(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: opinionId } = req.params;
    const authorId = req.user!.id;

    await opinionService.deleteOpinion(opinionId, authorId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
