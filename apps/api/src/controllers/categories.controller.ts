import { Request, Response, NextFunction } from 'express';

import { CategoryService } from '../services/category.service.js';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  ReparentCategoryInput,
} from '@emc3/shared';

const categoryService = new CategoryService();

// ═══════════════════════════════════════════════════════════
// Public Endpoints
// ═══════════════════════════════════════════════════════════

/**
 * Get category tree (hierarchical)
 * GET /categories/tree
 */
export async function getCategoryTree(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await categoryService.getCategoryTree();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get category by slug
 * GET /categories/:slug
 */
export async function getCategoryBySlug(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const slug = req.params.slug!;
    const result = await categoryService.getCategoryBySlug(slug);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get category descendants (for feed filtering)
 * GET /categories/:slug/descendants
 */
export async function getCategoryDescendants(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const slug = req.params.slug!;
    const result = await categoryService.getCategoryDescendants(slug);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// ═══════════════════════════════════════════════════════════
// Admin Endpoints
// ═══════════════════════════════════════════════════════════

/**
 * Get all categories with admin stats
 * GET /admin/categories
 */
export async function getAdminCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await categoryService.getAdminCategories();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Create category
 * POST /admin/categories
 */
export async function createCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = req.body as CreateCategoryInput;
    const adminId = req.user!.id;
    const result = await categoryService.createCategory(input, adminId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Update category
 * PUT /admin/categories/:id
 */
export async function updateCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id!;
    const input = req.body as UpdateCategoryInput;
    const adminId = req.user!.id;
    const result = await categoryService.updateCategory(id, input, adminId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Reparent category (move in tree)
 * PUT /admin/categories/:id/parent
 */
export async function reparentCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id!;
    const { newParentId } = req.body as ReparentCategoryInput;
    const adminId = req.user!.id;
    const result = await categoryService.reparentCategory(id, newParentId, adminId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete category and subtree
 * DELETE /admin/categories/:id
 */
export async function deleteCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id!;
    const adminId = req.user!.id;
    const result = await categoryService.deleteCategory(id, adminId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

