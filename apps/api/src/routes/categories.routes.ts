import { Router } from 'express';

import * as categoriesController from '../controllers/categories.controller.js';
import { validateParams } from '../middlewares/validate.js';
import { categorySlugParamSchema } from '@emc3/shared';

export const categoriesRouter = Router();

// ═══════════════════════════════════════════════════════════
// Public Category Endpoints
// ═══════════════════════════════════════════════════════════

// Get category tree (public)
categoriesRouter.get('/tree', categoriesController.getCategoryTree);

// Get category by slug (public)
categoriesRouter.get(
  '/:slug',
  validateParams(categorySlugParamSchema),
  categoriesController.getCategoryBySlug
);

// Get category descendants by slug (for feed filtering)
categoriesRouter.get(
  '/:slug/descendants',
  validateParams(categorySlugParamSchema),
  categoriesController.getCategoryDescendants
);

