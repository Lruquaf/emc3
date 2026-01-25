import type {
  PublishQueueItemDTO,
  PublishQueueResponse,
  PublishResponse,
  RevisionStatus,
} from '@emc3/shared';
import { AUDIT_ACTIONS } from '@emc3/shared';

import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

// ═══════════════════════════════════════════════════════════
// Get Publish Queue
// ═══════════════════════════════════════════════════════════

/**
 * Get publish queue (approved revisions waiting to be published)
 */
export async function getPublishQueue(options: {
  sort: string;
  limit: number;
  cursor?: string;
}): Promise<PublishQueueResponse> {
  const { sort, limit, cursor } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    status: 'REV_APPROVED',
  };

  if (cursor) {
    where.id = { lt: cursor };
  }

  // Get total count
  const totalCount = await prisma.revision.count({ where });

  // Get approved revisions
  const revisions = await prisma.revision.findMany({
    where,
    orderBy: {
      updatedAt: sort === 'oldest' ? 'asc' : 'desc',
    },
    take: limit + 1,
    include: {
      article: {
        include: {
          author: {
            include: {
              profile: { select: { displayName: true, avatarUrl: true } },
              ban: { select: { isBanned: true } },
            },
          },
        },
      },
      categories: {
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      },
      reviews: {
        where: { action: 'APPROVE' },
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          reviewer: { select: { id: true, username: true } },
        },
      },
    },
  });

  const hasMore = revisions.length > limit;
  const items = revisions.slice(0, limit);

  return {
    items: items.map((rev): PublishQueueItemDTO => {
      const approvalReview = rev.reviews[0];
      const isNewArticle = rev.article.publishedRevisionId === null;

      return {
        id: rev.id,
        articleId: rev.article.id,
        title: rev.title,
        summary: rev.summary,
        author: {
          id: rev.article.author.id,
          username: rev.article.author.username,
          displayName: rev.article.author.profile?.displayName ?? null,
          avatarUrl: rev.article.author.profile?.avatarUrl ?? null,
          isBanned: rev.article.author.ban?.isBanned ?? false,
        },
        categories: rev.categories.map((rc) => ({
          id: rc.category.id,
          name: rc.category.name,
          slug: rc.category.slug,
        })),
        approvedAt: approvalReview?.createdAt.toISOString() ?? rev.updatedAt.toISOString(),
        approvedBy: approvalReview
          ? {
              id: approvalReview.reviewer.id,
              username: approvalReview.reviewer.username,
            }
          : { id: '', username: 'unknown' },
        isNewArticle,
        isUpdate: !isNewArticle,
      };
    }),
    meta: {
      totalCount,
      nextCursor: hasMore && items.length > 0 ? items[items.length - 1]!.id : null,
      hasMore,
    },
  };
}

// ═══════════════════════════════════════════════════════════
// Publish Revision
// ═══════════════════════════════════════════════════════════

/**
 * Publish an approved revision
 */
export async function publishRevision(
  revisionId: string,
  adminId: string
): Promise<PublishResponse> {
  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: {
      article: {
        select: {
          id: true,
          slug: true,
          publishedRevisionId: true,
          firstPublishedAt: true,
        },
      },
    },
  });

  if (!revision) {
    throw AppError.notFound('Revision not found');
  }

  if (revision.status !== 'REV_APPROVED') {
    throw AppError.forbidden(
      `Cannot publish revision in ${revision.status} status. ` +
      'Only approved revisions can be published.'
    );
  }

  const now = new Date();
  const article = revision.article;
  const isFirstPublish = article.publishedRevisionId === null;
  const prevPublishedRevisionId = article.publishedRevisionId;

  // Transaction: update revision + update article + audit log
  await prisma.$transaction([
    // 1. Update revision status to PUBLISHED
    prisma.revision.update({
      where: { id: revisionId },
      data: { status: 'REV_PUBLISHED' },
    }),

    // 2. Update article
    prisma.article.update({
      where: { id: article.id },
      data: {
        publishedRevisionId: revisionId,
        status: 'PUBLISHED',
        firstPublishedAt: isFirstPublish ? now : article.firstPublishedAt,
        lastPublishedAt: now,
      },
    }),

    // 3. Audit log
    prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: AUDIT_ACTIONS.REV_PUBLISHED,
        targetType: 'revision',
        targetId: revisionId,
        meta: {
          articleId: article.id,
          isFirstPublish,
          prevPublishedRevisionId,
        },
      },
    }),
  ]);

  return {
    articleId: article.id,
    revisionId,
    isFirstPublish,
    firstPublishedAt: isFirstPublish ? now.toISOString() : article.firstPublishedAt!.toISOString(),
    lastPublishedAt: now.toISOString(),
  };
}

