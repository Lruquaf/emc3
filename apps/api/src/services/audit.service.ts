import type { Prisma } from '@prisma/client';

import { prisma } from '../lib/prisma.js';
import type {
  AuditAction,
  AuditLogDTO,
  AuditLogListResponse,
  AuditLogListQuery,
  AuditTargetType,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// AUDIT SERVICE - FAZ 6 + FAZ 7
// ═══════════════════════════════════════════════════════════

export interface AuditLogEntry {
  actorId: string;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  reason?: string;
  meta?: Record<string, unknown>;
}

export class AuditService {
  /**
   * Create an audit log entry
   */
  async log(entry: AuditLogEntry): Promise<void> {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        targetType: entry.targetType ?? null,
        targetId: entry.targetId ?? null,
        reason: entry.reason ?? null,
        meta: (entry.meta ?? {}) as object,
      },
    });
  }

  /**
   * Get audit logs with cursor-based pagination (FAZ 7)
   */
  async getAuditLogs(params: AuditLogListQuery): Promise<AuditLogListResponse> {
    const {
      action,
      targetType,
      targetId,
      actorId,
      startDate,
      endDate,
      limit = 50,
      cursor,
    } = params;

    const where: Prisma.AuditLogWhereInput = {};

    if (action) {
      where.action = action;
    }

    if (targetType) {
      where.targetType = targetType;
    }

    if (targetId) {
      where.targetId = targetId;
    }

    if (actorId) {
      where.actorId = actorId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Cursor-based pagination
    if (cursor) {
      where.createdAt = {
        ...(where.createdAt as Prisma.DateTimeFilter<'AuditLog'>),
        lt: new Date(cursor),
      };
    }

    // Get total count without cursor filter
    const countWhere = { ...where };
    delete countWhere.createdAt;
    if (startDate || endDate) {
      countWhere.createdAt = {};
      if (startDate) {
        (countWhere.createdAt as Prisma.DateTimeFilter<'AuditLog'>).gte = new Date(startDate);
      }
      if (endDate) {
        (countWhere.createdAt as Prisma.DateTimeFilter<'AuditLog'>).lte = new Date(endDate);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              profile: {
                select: { displayName: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
      }),
      prisma.auditLog.count({ where: countWhere }),
    ]);

    const hasMore = logs.length > limit;
    const items = logs.slice(0, limit);
    const lastItem = items[items.length - 1];

    return {
      items: items.map(this.mapToAuditLogDTO),
      meta: {
        total,
        nextCursor: hasMore && lastItem
          ? lastItem.createdAt.toISOString()
          : null,
        hasMore,
      },
    };
  }

  /**
   * Get audit logs with offset pagination (legacy)
   */
  async getLogs(options: {
    targetType?: string;
    targetId?: string;
    actorId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { targetType, targetId, actorId, limit = 50, offset = 0 } = options;

    const where: Record<string, unknown> = {};
    if (targetType) where.targetType = targetType;
    if (targetId) where.targetId = targetId;
    if (actorId) where.actorId = actorId;

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              profile: {
                select: { displayName: true },
              },
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  }

  private mapToAuditLogDTO(log: {
    id: string;
    action: string;
    targetType: string | null;
    targetId: string | null;
    reason: string | null;
    meta: unknown;
    createdAt: Date;
    actor: {
      id: string;
      username: string;
      profile: { displayName: string | null } | null;
    } | null;
  }): AuditLogDTO {
    return {
      id: log.id,
      actor: log.actor
        ? {
            id: log.actor.id,
            username: log.actor.username,
            displayName: log.actor.profile?.displayName ?? null,
          }
        : null,
      action: log.action as AuditAction,
      targetType: log.targetType as AuditTargetType | null,
      targetId: log.targetId,
      reason: log.reason,
      meta: log.meta as Record<string, unknown>,
      createdAt: log.createdAt.toISOString(),
    };
  }
}

// Singleton instance
export const auditService = new AuditService();

