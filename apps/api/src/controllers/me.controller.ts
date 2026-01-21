import type { Request, Response, NextFunction } from 'express';

import * as revisionService from '../services/revision.service.js';

// ═══════════════════════════════════════════════════════════
// My Revisions
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/v1/me/revisions
 * Get my revisions/drafts
 */
export async function getMyRevisions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { status, limit, cursor } = req.query as {
      status?: string;
      limit?: string;
      cursor?: string;
    };

    const result = await revisionService.getMyRevisions(userId, {
      status,
      limit: Number(limit) || 20,
      cursor,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}

