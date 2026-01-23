// ═══════════════════════════════════════════════════════════
// AUDIT LOG DTOs
// ═══════════════════════════════════════════════════════════

import type { AuditAction } from '../constants/audit.js';

/**
 * Audit target types
 */
export type AuditTargetType =
  | 'user'
  | 'article'
  | 'revision'
  | 'opinion'
  | 'opinion_reply'
  | 'category'
  | 'appeal';

/**
 * Audit log DTO
 */
export interface AuditLogDTO {
  id: string;
  actor: {
    id: string;
    username: string;
    displayName: string | null;
  } | null;
  action: AuditAction;
  targetType: AuditTargetType | null;
  targetId: string | null;
  reason: string | null;
  meta: Record<string, unknown>;
  createdAt: string;
}

/**
 * Audit log list response
 */
export interface AuditLogListResponse {
  items: AuditLogDTO[];
  meta: {
    total: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
}

/**
 * Audit log list params
 */
export interface AuditLogListParams {
  action?: AuditAction;
  targetType?: AuditTargetType;
  targetId?: string;
  actorId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  cursor?: string;
}
