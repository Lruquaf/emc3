import type { Request, Response, NextFunction } from 'express';

import * as reviewService from '../services/review.service.js';
import * as publishService from '../services/publish.service.js';
import type { ReviewQueueQuery, PublishQueueQuery, FeedbackInput } from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// Review Queue
// ═══════════════════════════════════════════════════════════

/**
 * GET /admin/reviews
 * Get review queue
 */
export async function getReviewQueue(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = req.query as unknown as ReviewQueueQuery;
    const result = await reviewService.getReviewQueue(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /admin/revisions/:id
 * Get revision detail for review
 */
export async function getRevisionDetail(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const result = await reviewService.getRevisionDetail(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /admin/revisions/:id/feedback
 * Give feedback (changes requested)
 */
export async function giveFeedback(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { feedbackText } = req.body as FeedbackInput;
    const reviewerId = req.user!.id;

    const result = await reviewService.giveFeedback(id, reviewerId, feedbackText);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /admin/revisions/:id/approve
 * Approve revision
 */
export async function approveRevision(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const reviewerId = req.user!.id;

    const result = await reviewService.approveRevision(id, reviewerId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// ═══════════════════════════════════════════════════════════
// Publish Queue
// ═══════════════════════════════════════════════════════════

/**
 * GET /admin/publish-queue
 * Get publish queue
 */
export async function getPublishQueue(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = req.query as unknown as PublishQueueQuery;
    const result = await publishService.getPublishQueue(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /admin/revisions/:id/publish
 * Publish revision
 */
export async function publishRevision(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;

    const result = await publishService.publishRevision(id, adminId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

