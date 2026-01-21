import { Router } from 'express';

import * as meController from '../controllers/me.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { validateQuery } from '../middlewares/validate.js';
import { myRevisionsQuerySchema } from '@emc3/shared';

export const meRouter = Router();

// ═══════════════════════════════════════════════════════════
// My Revisions
// ═══════════════════════════════════════════════════════════

// List my revisions (drafts, in review, etc.)
meRouter.get(
  '/revisions',
  requireAuth,
  validateQuery(myRevisionsQuerySchema),
  meController.getMyRevisions
);

