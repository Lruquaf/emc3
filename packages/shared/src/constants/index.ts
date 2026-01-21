import type { RevisionStatus } from '../types/article.js';

// Re-export audit constants
export * from './audit.js';

/**
 * Revision status transitions
 */
export const REVISION_TRANSITIONS: Record<string, string[]> = {
  REV_DRAFT: ['REV_IN_REVIEW'],
  REV_IN_REVIEW: ['REV_CHANGES_REQUESTED', 'REV_APPROVED', 'REV_WITHDRAWN'],
  REV_CHANGES_REQUESTED: ['REV_IN_REVIEW'],
  REV_APPROVED: ['REV_PUBLISHED'],
  REV_WITHDRAWN: [],
  REV_PUBLISHED: [],
};

/**
 * Check if a state transition is allowed
 */
export function canTransition(from: string, to: string): boolean {
  return REVISION_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Status descriptions (Turkish)
 */
export const REVISION_STATUS_LABELS: Record<RevisionStatus, string> = {
  REV_DRAFT: 'Taslak',
  REV_IN_REVIEW: 'İncelemede',
  REV_CHANGES_REQUESTED: 'Düzenleme İstendi',
  REV_APPROVED: 'Onaylandı',
  REV_WITHDRAWN: 'Geri Çekildi',
  REV_PUBLISHED: 'Yayınlandı',
};

/**
 * Statuses that allow editing
 */
export const EDITABLE_STATUSES: RevisionStatus[] = ['REV_DRAFT', 'REV_CHANGES_REQUESTED'];

/**
 * Statuses that indicate pending (not yet published, in review pipeline)
 */
export const PENDING_STATUSES: RevisionStatus[] = ['REV_IN_REVIEW', 'REV_APPROVED'];

/**
 * API error codes
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  BANNED: 'BANNED',
  CONTENT_RESTRICTED: 'CONTENT_RESTRICTED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

/**
 * Rate limit defaults
 */
export const RATE_LIMITS = {
  LOGIN: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 per 15 min
  REGISTER: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 per hour
  ARTICLE_CREATE: { windowMs: 60 * 60 * 1000, max: 5 }, // 5 per hour
  SUBMIT_REVIEW: { windowMs: 10 * 60 * 1000, max: 3 }, // 3 per 10 min
  FOLLOW: { windowMs: 60 * 1000, max: 20 }, // 20 per minute
  GENERAL: { windowMs: 60 * 1000, max: 100 }, // 100 per minute
} as const;

/**
 * Opinion edit window (milliseconds)
 */
export const OPINION_EDIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

