// ═══════════════════════════════════════════════════════════
// Audit Action Constants
// ═══════════════════════════════════════════════════════════

/**
 * Audit action constants
 */
export const AUDIT_ACTIONS = {
  // Review actions (FAZ 3)
  REV_FEEDBACK: 'REV_FEEDBACK',
  REV_APPROVED: 'REV_APPROVED',
  REV_PUBLISHED: 'REV_PUBLISHED',
  
  // Author actions (FAZ 2)
  REV_SUBMITTED: 'REV_SUBMITTED',
  REV_WITHDRAWN: 'REV_WITHDRAWN',
  
  // Article actions
  ARTICLE_CREATED: 'ARTICLE_CREATED',
  ARTICLE_REMOVED: 'ARTICLE_REMOVED',
  ARTICLE_RESTORED: 'ARTICLE_RESTORED',
  
  // User actions
  USER_BANNED: 'USER_BANNED',
  USER_UNBANNED: 'USER_UNBANNED',
  USER_ROLE_ADDED: 'USER_ROLE_ADDED',
  USER_ROLE_REMOVED: 'USER_ROLE_REMOVED',
  USER_RESTORED: 'USER_RESTORED',
  
  // Opinion actions
  OPINION_REMOVED: 'OPINION_REMOVED',
  OPINION_REPLY_REMOVED: 'OPINION_REPLY_REMOVED',
  
  // Category actions (FAZ 4)
  CATEGORY_DELETED_SUBTREE: 'CATEGORY_DELETED_SUBTREE',
  
  // Appeal actions (FAZ 7)
  APPEAL_OPENED: 'APPEAL_OPENED',
  APPEAL_MESSAGE: 'APPEAL_MESSAGE',
  APPEAL_CLOSED: 'APPEAL_CLOSED',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

// ═══════════════════════════════════════════════════════════
// Review State Transitions (FAZ 3)
// ═══════════════════════════════════════════════════════════

/**
 * Review state transitions (FAZ 3)
 */
export const REVIEW_TRANSITIONS: Record<string, { 
  allowedStatuses: string[];
  requiredRole: 'REVIEWER' | 'ADMIN';
  audit: string;
}> = {
  feedback: {
    allowedStatuses: ['REV_IN_REVIEW'],
    requiredRole: 'REVIEWER', // or ADMIN
    audit: 'REV_FEEDBACK',
  },
  approve: {
    allowedStatuses: ['REV_IN_REVIEW'],
    requiredRole: 'REVIEWER', // or ADMIN
    audit: 'REV_APPROVED',
  },
  publish: {
    allowedStatuses: ['REV_APPROVED'],
    requiredRole: 'ADMIN', // only ADMIN
    audit: 'REV_PUBLISHED',
  },
};

