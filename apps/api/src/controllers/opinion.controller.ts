import { Request, Response, NextFunction } from 'express';
import { opinionService } from '../services/opinion.service.js';
import type {
  OpinionListParams,
  CreateOpinionRequest,
  UpdateOpinionRequest,
  CreateReplyRequest,
  UpdateReplyRequest,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// OPINION CONTROLLER - FAZ 6
// ═══════════════════════════════════════════════════════════

/**
 * List opinions for an article
 * GET /api/v1/articles/:articleId/opinions
 */
export async function listOpinions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const articleId = req.params.articleId as string;
    const viewerId = req.user?.id;
    const params = req.query as unknown as OpinionListParams;

    const result = await opinionService.listOpinions(articleId, params, viewerId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new opinion
 * POST /api/v1/articles/:articleId/opinions
 */
export async function createOpinion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const articleId = req.params.articleId as string;
    const authorId = req.user!.id;
    const { bodyMarkdown } = req.body as CreateOpinionRequest;

    const result = await opinionService.createOpinion(
      articleId,
      authorId,
      bodyMarkdown
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Update an opinion (10 minute window)
 * PUT /api/v1/opinions/:id
 */
export async function updateOpinion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const opinionId = req.params.id as string;
    const userId = req.user!.id;
    const { bodyMarkdown } = req.body as UpdateOpinionRequest;

    const result = await opinionService.updateOpinion(
      opinionId,
      userId,
      bodyMarkdown
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Remove an opinion (soft delete - mod/admin only)
 * DELETE /api/v1/opinions/:id
 */
export async function removeOpinion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const opinionId = req.params.id as string;
    const moderatorId = req.user!.id;
    const { reason } = req.body;

    await opinionService.removeOpinion(opinionId, moderatorId, reason);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/**
 * Like an opinion
 * POST /api/v1/opinions/:id/like
 */
export async function likeOpinion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const opinionId = req.params.id as string;
    const userId = req.user!.id;

    const result = await opinionService.likeOpinion(opinionId, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Unlike an opinion
 * DELETE /api/v1/opinions/:id/like
 */
export async function unlikeOpinion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const opinionId = req.params.id as string;
    const userId = req.user!.id;

    const result = await opinionService.unlikeOpinion(opinionId, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Create an author reply
 * POST /api/v1/opinions/:id/reply
 */
export async function createReply(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const opinionId = req.params.id as string;
    const replierId = req.user!.id;
    const { bodyMarkdown } = req.body as CreateReplyRequest;

    const result = await opinionService.createReply(
      opinionId,
      replierId,
      bodyMarkdown
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Update an author reply (10 minute window)
 * PUT /api/v1/opinions/:id/reply
 */
export async function updateReply(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const opinionId = req.params.id as string;
    const replierId = req.user!.id;
    const { bodyMarkdown } = req.body as UpdateReplyRequest;

    const result = await opinionService.updateReply(
      opinionId,
      replierId,
      bodyMarkdown
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}
