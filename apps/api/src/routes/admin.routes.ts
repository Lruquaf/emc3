import { Router } from 'express';

import * as adminController from '../controllers/admin.controller.js';
import * as categoriesController from '../controllers/categories.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireAdmin, requireReviewer } from '../middlewares/requireRole.js';
import { validate, validateParams, validateQuery } from '../middlewares/validate.js';
import {
  reviewQueueQuerySchema,
  publishQueueQuerySchema,
  revisionIdParamSchema,
  feedbackSchema,
  createCategorySchema,
  updateCategorySchema,
  reparentCategorySchema,
  categoryIdParamSchema,
  adminUserListQuerySchema,
  adminArticleListQuerySchema,
  banUserSchema,
  updateRoleSchema,
  restoreUserSchema,
  removeArticleSchema,
  removeOpinionSchema,
  removeOpinionReplySchema,
  auditLogListQuerySchema,
  appealListQuerySchema,
  appealMessageSchema,
  closeAppealSchema,
  userIdParamSchema,
  appealIdParamSchema,
  articleIdParamSchema,
  OpinionIdParamSchema,
} from '@emc3/shared';

export const adminRouter = Router();

// All admin routes require authentication
adminRouter.use(requireAuth);

// Dashboard (REVIEWER or ADMIN)
adminRouter.get(
  '/dashboard/stats',
  requireReviewer,
  adminController.getDashboardStats
);

// User Management (REVIEWER or ADMIN)
adminRouter.get(
  '/users',
  requireReviewer,
  validateQuery(adminUserListQuerySchema),
  adminController.listUsers
);

adminRouter.get(
  '/users/:id',
  requireReviewer,
  validateParams(userIdParamSchema),
  adminController.getUserDetail
);

adminRouter.post(
  '/users/:id/ban',
  requireReviewer,
  validateParams(userIdParamSchema),
  validate(banUserSchema),
  adminController.banUser
);

adminRouter.post(
  '/users/:id/unban',
  requireReviewer,
  validateParams(userIdParamSchema),
  adminController.unbanUser
);

// Role management (ADMIN only)
adminRouter.post(
  '/users/:id/role',
  requireAdmin,
  validateParams(userIdParamSchema),
  validate(updateRoleSchema),
  adminController.updateUserRole
);

// Restore deleted user (ADMIN only)
adminRouter.post(
  '/users/:id/restore',
  requireAdmin,
  validateParams(userIdParamSchema),
  validate(restoreUserSchema),
  adminController.restoreUser
);

// Article Moderation (REVIEWER or ADMIN)
adminRouter.get(
  '/articles',
  requireReviewer,
  validateQuery(adminArticleListQuerySchema),
  adminController.listArticles
);

adminRouter.post(
  '/articles/:id/remove',
  requireReviewer,
  validateParams(articleIdParamSchema),
  validate(removeArticleSchema),
  adminController.removeArticle
);

adminRouter.post(
  '/articles/:id/restore',
  requireReviewer,
  validateParams(articleIdParamSchema),
  adminController.restoreArticle
);

// Audit Logs (REVIEWER or ADMIN)
adminRouter.get(
  '/audit',
  requireReviewer,
  validateQuery(auditLogListQuerySchema),
  adminController.getAuditLogs
);

// Appeals (REVIEWER or ADMIN)
adminRouter.get(
  '/appeals',
  requireReviewer,
  validateQuery(appealListQuerySchema),
  adminController.listAppeals
);

adminRouter.get(
  '/appeals/:id',
  requireReviewer,
  validateParams(appealIdParamSchema),
  adminController.getAppealDetail
);

adminRouter.post(
  '/appeals/:id/message',
  requireReviewer,
  validateParams(appealIdParamSchema),
  validate(appealMessageSchema),
  adminController.sendAppealMessage
);

adminRouter.post(
  '/appeals/:id/close',
  requireReviewer,
  validateParams(appealIdParamSchema),
  validate(closeAppealSchema),
  adminController.closeAppeal
);

// Review Queue (REVIEWER or ADMIN)
adminRouter.get(
  '/reviews',
  requireReviewer,
  validateQuery(reviewQueueQuerySchema),
  adminController.getReviewQueue
);

adminRouter.get(
  '/revisions/:id',
  requireReviewer,
  validateParams(revisionIdParamSchema),
  adminController.getRevisionDetail
);

adminRouter.post(
  '/revisions/:id/feedback',
  requireReviewer,
  validateParams(revisionIdParamSchema),
  validate(feedbackSchema),
  adminController.giveFeedback
);

adminRouter.post(
  '/revisions/:id/approve',
  requireReviewer,
  validateParams(revisionIdParamSchema),
  adminController.approveRevision
);

// Publish Queue (ADMIN only)
adminRouter.get(
  '/publish-queue',
  requireAdmin,
  validateQuery(publishQueueQuerySchema),
  adminController.getPublishQueue
);

adminRouter.post(
  '/revisions/:id/publish',
  requireAdmin,
  validateParams(revisionIdParamSchema),
  adminController.publishRevision
);

// Category Admin Routes (ADMIN only)
adminRouter.get(
  '/categories',
  requireAdmin,
  categoriesController.getAdminCategories
);

adminRouter.post(
  '/categories',
  requireAdmin,
  validate(createCategorySchema),
  categoriesController.createCategory
);

adminRouter.put(
  '/categories/:id',
  requireAdmin,
  validateParams(categoryIdParamSchema),
  validate(updateCategorySchema),
  categoriesController.updateCategory
);

adminRouter.put(
  '/categories/:id/parent',
  requireAdmin,
  validateParams(categoryIdParamSchema),
  validate(reparentCategorySchema),
  categoriesController.reparentCategory
);

adminRouter.delete(
  '/categories/:id',
  requireAdmin,
  validateParams(categoryIdParamSchema),
  categoriesController.deleteCategory
);

// Opinion Moderation (REVIEWER or ADMIN)
adminRouter.post(
  '/opinions/:id/remove',
  requireReviewer,
  validateParams(OpinionIdParamSchema),
  validate(removeOpinionSchema),
  adminController.removeOpinion
);

adminRouter.post(
  '/opinions/:id/reply/remove',
  requireReviewer,
  validateParams(OpinionIdParamSchema),
  validate(removeOpinionReplySchema),
  adminController.removeOpinionReply
);
