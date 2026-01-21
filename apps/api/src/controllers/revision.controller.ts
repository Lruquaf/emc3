import type { Request, Response, NextFunction } from 'express';

import * as revisionService from '../services/revision.service.js';
import type { UpdateRevisionInput } from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// Revision CRUD
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/v1/revisions/:id
 * Get single revision (for editing)
 */
export async function getRevision(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: revisionId } = req.params;
    const requesterId = req.user!.id;
    const requesterRoles = req.user!.roles.map((r) => r.role);

    const revision = await revisionService.getRevision(
      revisionId,
      requesterId,
      requesterRoles
    );

    res.json(revision);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/revisions/:id
 * Update draft/changes_requested revision
 */
export async function updateRevision(
  req: Request<{ id: string }, unknown, UpdateRevisionInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: revisionId } = req.params;
    const authorId = req.user!.id;
    const input = req.body;

    const revision = await revisionService.updateRevision(
      revisionId,
      authorId,
      input
    );

    res.json(revision);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/revisions/:id
 * Delete draft revision
 */
export async function deleteRevision(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: revisionId } = req.params;
    const authorId = req.user!.id;

    await revisionService.deleteRevision(revisionId, authorId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// ═══════════════════════════════════════════════════════════
// Status Transitions
// ═══════════════════════════════════════════════════════════

/**
 * POST /api/v1/revisions/:id/submit
 * Submit revision to review
 */
export async function submitToReview(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: revisionId } = req.params;
    const authorId = req.user!.id;

    const result = await revisionService.submitToReview(revisionId, authorId);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/revisions/:id/withdraw
 * Withdraw from review
 */
export async function withdrawFromReview(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: revisionId } = req.params;
    const authorId = req.user!.id;

    const result = await revisionService.withdrawFromReview(revisionId, authorId);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

