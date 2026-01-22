import type { Request, Response, NextFunction } from 'express';

import * as appealService from '../services/appeal.service.js';
import type { CreateAppealInput, AppealMessageInput } from '@emc3/shared';
import { ERROR_CODES } from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// User Appeal Endpoints
// ═══════════════════════════════════════════════════════════

/**
 * GET /appeals/me
 * Get my appeal (banned user only)
 */
export async function getMyAppeal(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const isBanned = req.user!.isBanned;

    // Only banned users can access appeal
    if (!isBanned) {
      res.status(403).json({
        code: ERROR_CODES.FORBIDDEN,
        message: 'Only banned users can access appeals',
      });
      return;
    }

    const result = await appealService.getMyAppeal(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /appeals
 * Create appeal (banned user only)
 */
export async function createAppeal(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const isBanned = req.user!.isBanned;
    const { message } = req.body as CreateAppealInput;

    // Only banned users can create appeal
    if (!isBanned) {
      res.status(403).json({
        code: ERROR_CODES.FORBIDDEN,
        message: 'Only banned users can create appeals',
      });
      return;
    }

    const result = await appealService.createAppeal(userId, message);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /appeals/:id/message
 * Send message to my appeal
 */
export async function sendMessage(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: appealId } = req.params;
    const { message } = req.body as AppealMessageInput;
    const userId = req.user!.id;

    // Verify user owns this appeal
    await appealService.verifyOwnership(appealId, userId);

    const result = await appealService.sendMessage(
      appealId,
      userId,
      message,
      false // isAdmin
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
