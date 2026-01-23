import type { Prisma } from '@prisma/client';

import { prisma } from '../lib/prisma.js';
import { auditService } from './audit.service.js';
import {
  AUDIT_ACTIONS,
  type AdminUserDTO,
  type AdminUserListResponse,
  type AdminUserListQuery,
  type AdminArticleDTO,
  type AdminArticleListResponse,
  type AdminArticleListQuery,
  type BanUserResponse,
  type UpdateRoleResponse,
  type RoleName,
  type AdminDashboardStats,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// ERROR CLASSES
// ═══════════════════════════════════════════════════════════

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════════════════════

export async function getDashboardStats(): Promise<AdminDashboardStats> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [
    totalUsers,
    newUsersThisWeek,
    bannedUsers,
    totalArticles,
    publishedArticles,
    removedArticles,
    pendingReviews,
    approvedThisWeek,
    openAppeals,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    prisma.userBan.count({ where: { isBanned: true } }),
    prisma.article.count(),
    prisma.article.count({ where: { status: 'PUBLISHED' } }),
    prisma.article.count({ where: { status: 'REMOVED' } }),
    prisma.revision.count({ where: { status: 'REV_IN_REVIEW' } }),
    prisma.revision.count({
      where: {
        status: 'REV_APPROVED',
        updatedAt: { gte: oneWeekAgo },
      },
    }),
    prisma.appeal.count({ where: { status: 'OPEN' } }),
  ]);

  return {
    users: {
      total: totalUsers,
      newThisWeek: newUsersThisWeek,
      banned: bannedUsers,
    },
    articles: {
      total: totalArticles,
      published: publishedArticles,
      removed: removedArticles,
    },
    reviews: {
      pending: pendingReviews,
      approvedThisWeek: approvedThisWeek,
    },
    appeals: {
      open: openAppeals,
    },
  };
}

// ═══════════════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════════════

export async function listUsers(
  params: AdminUserListQuery
): Promise<AdminUserListResponse> {
  const { query, role, isBanned, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  // Search by username or email
  if (query) {
    where.OR = [
      { username: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
      { profile: { displayName: { contains: query, mode: 'insensitive' } } },
    ];
  }

  // Filter by role
  if (role) {
    where.roles = { some: { role } };
  }

  // Filter by ban status
  if (isBanned !== undefined) {
    if (isBanned) {
      where.ban = { isBanned: true };
    } else {
      where.OR = [
        ...(where.OR || []),
        { ban: null },
        { ban: { isBanned: false } },
      ];
      // Reset OR if it was only ban filter
      if (!query) {
        delete where.OR;
        where.OR = [{ ban: null }, { ban: { isBanned: false } }];
      }
    }
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        profile: true,
        roles: true,
        ban: true,
        _count: {
          select: {
            articles: true,
            opinions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: users.map(mapToAdminUserDTO),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getUserDetail(userId: string): Promise<AdminUserDTO> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      roles: true,
      ban: true,
      _count: {
        select: {
          articles: true,
          opinions: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return mapToAdminUserDTO(user);
}

export async function banUser(
  targetUserId: string,
  actorId: string,
  reason: string
): Promise<BanUserResponse> {
  // Cannot ban yourself
  if (targetUserId === actorId) {
    throw new ForbiddenError('Cannot ban yourself');
  }

  // Check target exists
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { ban: true, roles: true },
  });

  if (!targetUser) {
    throw new NotFoundError('User not found');
  }

  // Check if already banned
  if (targetUser.ban?.isBanned) {
    throw new ConflictError('User is already banned');
  }

  // Cannot ban admin (unless you're also admin)
  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    include: { roles: true },
  });

  const targetIsAdmin = targetUser.roles.some((r) => r.role === 'ADMIN');
  const actorIsAdmin = actor?.roles.some((r) => r.role === 'ADMIN');

  if (targetIsAdmin && !actorIsAdmin) {
    throw new ForbiddenError('Only admins can ban other admins');
  }

  const now = new Date();

  // Upsert ban record
  await prisma.userBan.upsert({
    where: { userId: targetUserId },
    create: {
      userId: targetUserId,
      isBanned: true,
      reason,
      bannedById: actorId,
      bannedAt: now,
    },
    update: {
      isBanned: true,
      reason,
      bannedById: actorId,
      bannedAt: now,
      unbannedById: null,
      unbannedAt: null,
    },
  });

  // Audit log
  await auditService.log({
    actorId,
    action: AUDIT_ACTIONS.USER_BANNED,
    targetType: 'user',
    targetId: targetUserId,
    reason,
    meta: { targetUsername: targetUser.username },
  });

  return {
    userId: targetUserId,
    isBanned: true,
    reason,
    bannedAt: now.toISOString(),
    bannedBy: actorId,
  };
}

export async function unbanUser(
  targetUserId: string,
  actorId: string
): Promise<BanUserResponse> {
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { ban: true },
  });

  if (!targetUser) {
    throw new NotFoundError('User not found');
  }

  if (!targetUser.ban?.isBanned) {
    throw new ConflictError('User is not banned');
  }

  const now = new Date();

  // Update ban record
  await prisma.userBan.update({
    where: { userId: targetUserId },
    data: {
      isBanned: false,
      unbannedById: actorId,
      unbannedAt: now,
    },
  });

  // Audit log
  await auditService.log({
    actorId,
    action: AUDIT_ACTIONS.USER_UNBANNED,
    targetType: 'user',
    targetId: targetUserId,
    meta: { targetUsername: targetUser.username },
  });

  return {
    userId: targetUserId,
    isBanned: false,
    reason: targetUser.ban.reason,
    bannedAt: targetUser.ban.bannedAt?.toISOString() ?? null,
    bannedBy: targetUser.ban.bannedById,
  };
}

export async function updateUserRole(
  targetUserId: string,
  actorId: string,
  role: RoleName,
  action: 'grant' | 'revoke'
): Promise<UpdateRoleResponse> {
  // Cannot modify own role
  if (targetUserId === actorId) {
    throw new ForbiddenError('Cannot modify your own role');
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { roles: true },
  });

  if (!targetUser) {
    throw new NotFoundError('User not found');
  }

  const hasRole = targetUser.roles.some((r) => r.role === role);

  if (action === 'grant') {
    if (hasRole) {
      throw new ConflictError(`User already has ${role} role`);
    }

    await prisma.userRole.create({
      data: { userId: targetUserId, role },
    });
  } else {
    if (!hasRole) {
      throw new ConflictError(`User does not have ${role} role`);
    }

    // Don't allow removing the last admin
    if (role === 'ADMIN') {
      const adminCount = await prisma.userRole.count({
        where: { role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        throw new ForbiddenError('Cannot remove the last admin');
      }
    }

    await prisma.userRole.delete({
      where: { userId_role: { userId: targetUserId, role } },
    });
  }

  // Audit log
  await auditService.log({
    actorId,
    action:
      action === 'grant'
        ? AUDIT_ACTIONS.USER_ROLE_ADDED
        : AUDIT_ACTIONS.USER_ROLE_REMOVED,
    targetType: 'user',
    targetId: targetUserId,
    meta: { role, targetUsername: targetUser.username },
  });

  // Get updated roles
  const updatedRoles = await prisma.userRole.findMany({
    where: { userId: targetUserId },
    select: { role: true },
  });

  return {
    userId: targetUserId,
    roles: updatedRoles.map((r) => r.role as RoleName),
  };
}

// ═══════════════════════════════════════════════════════════
// ARTICLE MODERATION
// ═══════════════════════════════════════════════════════════

export async function listArticles(
  params: AdminArticleListQuery
): Promise<AdminArticleListResponse> {
  const { query, status, authorId, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.ArticleWhereInput = {
    // Only show articles that have been actually published (have a published revision)
    publishedRevisionId: { not: null },
  };

  if (query) {
    where.revisions = {
      some: {
        status: 'REV_PUBLISHED',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
        ],
      },
    };
  }

  if (status) {
    where.status = status;
  }

  if (authorId) {
    where.authorId = authorId;
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        author: {
          include: {
            profile: true,
            ban: true,
          },
        },
        revisions: {
          where: { status: 'REV_PUBLISHED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            likes: true,
            saves: true,
            views: true,
            opinions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return {
    items: articles.map(mapToAdminArticleDTO),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function removeArticle(
  articleId: string,
  actorId: string,
  reason: string
): Promise<void> {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { author: true },
  });

  if (!article) {
    throw new NotFoundError('Article not found');
  }

  if (article.status === 'REMOVED') {
    throw new ConflictError('Article is already removed');
  }

  await prisma.article.update({
    where: { id: articleId },
    data: { status: 'REMOVED' },
  });

  // Audit log
  await auditService.log({
    actorId,
    action: AUDIT_ACTIONS.ARTICLE_REMOVED,
    targetType: 'article',
    targetId: articleId,
    reason,
    meta: {
      slug: article.slug,
      authorId: article.authorId,
      authorUsername: article.author.username,
    },
  });
}

export async function restoreArticle(
  articleId: string,
  actorId: string
): Promise<void> {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { author: true },
  });

  if (!article) {
    throw new NotFoundError('Article not found');
  }

  if (article.status !== 'REMOVED') {
    throw new ConflictError('Article is not removed');
  }

  // Restore to PUBLISHED if has published revision
  const newStatus = article.publishedRevisionId ? 'PUBLISHED' : 'PUBLISHED';

  await prisma.article.update({
    where: { id: articleId },
    data: { status: newStatus },
  });

  // Audit log
  await auditService.log({
    actorId,
    action: AUDIT_ACTIONS.ARTICLE_RESTORED,
    targetType: 'article',
    targetId: articleId,
    meta: {
      slug: article.slug,
      restoredStatus: newStatus,
    },
  });
}

// ═══════════════════════════════════════════════════════════
// OPINION MODERATION
// ═══════════════════════════════════════════════════════════

/**
 * Remove opinion (soft delete)
 */
export async function removeOpinion(
  opinionId: string,
  actorId: string,
  reason: string
): Promise<void> {
  const opinion = await prisma.opinion.findUnique({
    where: { id: opinionId },
    include: {
      author: true,
      article: {
        select: { id: true, slug: true },
      },
    },
  });

  if (!opinion) {
    throw new NotFoundError('Opinion not found');
  }

  if (opinion.removedAt) {
    throw new ConflictError('Opinion is already removed');
  }

  await prisma.opinion.update({
    where: { id: opinionId },
    data: { removedAt: new Date() },
  });

  // Audit log
  await auditService.log({
    actorId,
    action: AUDIT_ACTIONS.OPINION_REMOVED,
    targetType: 'opinion',
    targetId: opinionId,
    reason,
    meta: {
      articleId: opinion.articleId,
      articleSlug: opinion.article.slug,
      authorId: opinion.authorId,
      authorUsername: opinion.author.username,
    },
  });
}

/**
 * Remove opinion reply (soft delete)
 */
export async function removeOpinionReply(
  opinionId: string,
  actorId: string,
  reason: string
): Promise<void> {
  const reply = await prisma.opinionReply.findUnique({
    where: { opinionId },
    include: {
      replier: true,
      opinion: {
        include: {
          article: {
            select: { id: true, slug: true },
          },
        },
      },
    },
  });

  if (!reply) {
    throw new NotFoundError('Opinion reply not found');
  }

  if (reply.removedAt) {
    throw new ConflictError('Opinion reply is already removed');
  }

  await prisma.opinionReply.update({
    where: { opinionId },
    data: { removedAt: new Date() },
  });

  // Audit log
  await auditService.log({
    actorId,
    action: AUDIT_ACTIONS.OPINION_REPLY_REMOVED,
    targetType: 'opinion_reply',
    targetId: opinionId,
    reason,
    meta: {
      opinionId: reply.opinionId,
      articleId: reply.opinion.articleId,
      articleSlug: reply.opinion.article.slug,
      replierId: reply.replierId,
      replierUsername: reply.replier.username,
    },
  });
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function mapToAdminUserDTO(user: {
  id: string;
  email: string;
  username: string;
  emailVerified: boolean;
  createdAt: Date;
  profile: { displayName: string | null; avatarUrl: string | null } | null;
  roles: { role: string }[];
  ban: { isBanned: boolean; reason: string | null; bannedAt: Date | null } | null;
  _count: { articles: number; opinions: number };
}): AdminUserDTO {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    emailVerified: user.emailVerified,
    roles: user.roles.map((r) => r.role as RoleName),
    isBanned: user.ban?.isBanned ?? false,
    banReason: user.ban?.reason ?? null,
    bannedAt: user.ban?.bannedAt?.toISOString() ?? null,
    profile: user.profile
      ? {
          displayName: user.profile.displayName,
          avatarUrl: user.profile.avatarUrl,
        }
      : null,
    stats: {
      articleCount: user._count.articles,
      opinionCount: user._count.opinions,
    },
    createdAt: user.createdAt.toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToAdminArticleDTO(article: any): AdminArticleDTO {
  const publishedRevision = article.revisions?.[0];

  return {
    id: article.id,
    slug: article.slug,
    status: article.status as 'PUBLISHED' | 'REMOVED',
    author: {
      id: article.author.id,
      username: article.author.username,
      displayName: article.author.profile?.displayName ?? null,
      isBanned: article.author.ban?.isBanned ?? false,
    },
    title: publishedRevision?.title ?? 'Untitled',
    summary: publishedRevision?.summary ?? '',
    publishedAt: article.lastPublishedAt?.toISOString() ?? null,
    counts: {
      likes: article._count.likes,
      saves: article._count.saves,
      views: Number(article.viewCount),
      opinions: article._count.opinions,
    },
    createdAt: article.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: article.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}
