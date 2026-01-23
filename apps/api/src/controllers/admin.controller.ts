import type { Request, Response, NextFunction } from 'express';

import * as reviewService from '../services/review.service.js';
import * as publishService from '../services/publish.service.js';
import * as moderationService from '../services/moderation.service.js';
import * as appealService from '../services/appeal.service.js';
import { auditService } from '../services/audit.service.js';
import type {
  ReviewQueueQuery,
  PublishQueueQuery,
  FeedbackInput,
  AdminUserListQuery,
  AdminArticleListQuery,
  BanUserInput,
  UpdateRoleInput,
  RemoveArticleInput,
  AuditLogListQuery,
  AppealListQuery,
  AppealMessageInput,
  CloseAppealInput,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// Dashboard
// ═══════════════════════════════════════════════════════════

/**
 * GET /admin/dashboard/stats
 * Get dashboard statistics
 */
export async function getDashboardStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await moderationService.getDashboardStats();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// ═══════════════════════════════════════════════════════════
// User Management
// ═══════════════════════════════════════════════════════════

/**
 * GET /admin/users
 * List users
 */
export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = req.query as unknown as AdminUserListQuery;
    const result = await moderationService.listUsers(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /admin/users/:id
 * Get user detail
 */
export async function getUserDetail(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const result = await moderationService.getUserDetail(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /admin/users/:id/ban
 * Ban user
 */
export async function banUser(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: targetUserId } = req.params;
    const { reason } = req.body as BanUserInput;
    const actorId = req.user!.id;

    const result = await moderationService.banUser(targetUserId, actorId, reason);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /admin/users/:id/unban
 * Unban user
 */
export async function unbanUser(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: targetUserId } = req.params;
    const actorId = req.user!.id;

    const result = await moderationService.unbanUser(targetUserId, actorId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /admin/users/:id/role
 * Grant/revoke role
 */
export async function updateUserRole(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: targetUserId } = req.params;
    const { role, action } = req.body as UpdateRoleInput;
    const actorId = req.user!.id;

    const result = await moderationService.updateUserRole(
      targetUserId,
      actorId,
      role,
      action
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// ═══════════════════════════════════════════════════════════
// Article Moderation
// ═══════════════════════════════════════════════════════════

/**
 * GET /admin/articles
 * List articles
 */
export async function listArticles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = req.query as unknown as AdminArticleListQuery;
    const result = await moderationService.listArticles(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /admin/articles/:id/remove
 * Remove article
 */
export async function removeArticle(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: articleId } = req.params;
    const { reason } = req.body as RemoveArticleInput;
    const actorId = req.user!.id;

    await moderationService.removeArticle(articleId, actorId, reason);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/**
 * POST /admin/articles/:id/restore
 * Restore article
 */
export async function restoreArticle(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: articleId } = req.params;
    const actorId = req.user!.id;

    await moderationService.restoreArticle(articleId, actorId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// ═══════════════════════════════════════════════════════════
// Audit Logs
// ═══════════════════════════════════════════════════════════

/**
 * GET /admin/audit
 * Get audit logs
 */
export async function getAuditLogs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = req.query as unknown as AuditLogListQuery;
    const result = await auditService.getAuditLogs(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// ═══════════════════════════════════════════════════════════
// Appeals (Admin)
// ═══════════════════════════════════════════════════════════

/**
 * GET /admin/appeals
 * List appeals
 */
export async function listAppeals(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = req.query as unknown as AppealListQuery;
    const result = await appealService.listAppeals(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /admin/appeals/:id
 * Get appeal detail
 */
export async function getAppealDetail(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const result = await appealService.getAppealDetail(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /admin/appeals/:id/message
 * Send message to appeal
 */
export async function sendAppealMessage(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: appealId } = req.params;
    const { message } = req.body as AppealMessageInput;
    const senderId = req.user!.id;

    const result = await appealService.sendMessage(
      appealId,
      senderId,
      message,
      true // isAdmin
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /admin/appeals/:id/close
 * Close appeal
 */
export async function closeAppeal(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: appealId } = req.params;
    const { resolution, message } = req.body as CloseAppealInput;
    const actorId = req.user!.id;

    await appealService.closeAppeal(appealId, actorId, resolution, message);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

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

// ═══════════════════════════════════════════════════════════
// Opinion Moderation
// ═══════════════════════════════════════════════════════════

/**
 * POST /admin/opinions/:id/remove
 * Remove opinion
 */
export async function removeOpinion(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: opinionId } = req.params;
    const { reason } = req.body as { reason: string };
    const actorId = req.user!.id;

    await moderationService.removeOpinion(opinionId, actorId, reason);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/**
 * POST /admin/opinions/:id/reply/remove
 * Remove opinion reply
 */
export async function removeOpinionReply(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: opinionId } = req.params;
    const { reason } = req.body as { reason: string };
    const actorId = req.user!.id;

    await moderationService.removeOpinionReply(opinionId, actorId, reason);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

