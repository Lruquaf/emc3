/**
 * System category slug (cannot be deleted)
 */
export const SYSTEM_CATEGORY_SLUG = 'diger-genel';

/**
 * Maximum category depth
 */
export const MAX_CATEGORY_DEPTH = 3;

/**
 * Maximum categories per revision
 */
export const MAX_CATEGORIES_PER_REVISION = 5;

/**
 * Audit actions for categories
 */
export const CATEGORY_AUDIT_ACTIONS = {
  CATEGORY_CREATED: 'CATEGORY_CREATED',
  CATEGORY_UPDATED: 'CATEGORY_UPDATED',
  CATEGORY_DELETED_SUBTREE: 'CATEGORY_DELETED_SUBTREE',
  CATEGORY_REPARENTED: 'CATEGORY_REPARENTED',
} as const;

export type CategoryAuditAction = typeof CATEGORY_AUDIT_ACTIONS[keyof typeof CATEGORY_AUDIT_ACTIONS];

