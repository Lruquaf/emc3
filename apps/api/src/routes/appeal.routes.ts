import { Router } from 'express';

import * as appealController from '../controllers/appeal.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { validate, validateParams } from '../middlewares/validate.js';
import { createAppealSchema, appealMessageSchema, appealIdParamSchema } from '@emc3/shared';

export const appealRouter = Router();

// All appeal routes require auth
appealRouter.use(requireAuth);

// Get my appeal (banned user only)
appealRouter.get('/me', appealController.getMyAppeal);

// Create appeal (banned user only)
appealRouter.post(
  '/',
  validate(createAppealSchema),
  appealController.createAppeal
);

// Send message to my appeal
appealRouter.post(
  '/:id/message',
  validateParams(appealIdParamSchema),
  validate(appealMessageSchema),
  appealController.sendMessage
);
