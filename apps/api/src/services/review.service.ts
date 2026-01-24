import type {
  ReviewQueueItemDTO,
  ReviewQueueResponse,
  RevisionReviewDetailDTO,
  ReviewActionResponse,
  RevisionStatus,
} from '@emc3/shared';
import { AUDIT_ACTIONS } from '@emc3/shared';

import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

// ═══════════════════════════════════════════════════════════
// Get Review Queue
// ═══════════════════════════════════════════════════════════

/**
 * Get review queue with filtering and pagination
 */
export async function getReviewQueue(options: {
  status?: string;
  authorId?: string;
  categoryId?: string;
  sort: string;
  limit: number;
  cursor?: string;
}): Promise<ReviewQueueResponse> {
  const { status = 'REV_IN_REVIEW', authorId, categoryId, sort, limit, cursor } = options;

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    status,
  };

  if (authorId) {
    where.article = { authorId };
  }

  if (categoryId) {
    where.categories = {
      some: { categoryId },
    };
  }

  if (cursor) {
    where.id = { lt: cursor };
  }

  // Get total count
  const totalCount = await prisma.revision.count({ where });

  // Get revisions
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
        where: { action: 'FEEDBACK' },
        select: { id: true },
      },
    },
  });

  const hasMore = revisions.length > limit;
  const items = revisions.slice(0, limit);

  return {
    items: items.map((rev): ReviewQueueItemDTO => ({
      id: rev.id,
      articleId: rev.article.id,
      articleSlug: rev.article.slug,
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
      status: rev.status as RevisionStatus,
      submittedAt: rev.updatedAt.toISOString(),
      previousFeedbackCount: rev.reviews.length,
      isUpdate: rev.article.publishedRevisionId !== null,
    })),
    meta: {
      totalCount,
      nextCursor: hasMore && items.length > 0 ? items[items.length - 1]!.id : null,
      hasMore,
    },
  };
}

// ═══════════════════════════════════════════════════════════
// Get Revision Detail for Review
// ═══════════════════════════════════════════════════════════

/**
 * Get full revision detail for review
 */
export async function getRevisionDetail(revisionId: string): Promise<RevisionReviewDetailDTO> {
  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: {
      article: {
        include: {
          author: {
            include: {
              profile: { select: { displayName: true, avatarUrl: true } },
              ban: { select: { isBanned: true } },
            },
          },
          revisions: {
            where: { status: 'REV_PUBLISHED' },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { title: true },
          },
        },
      },
      categories: {
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: { select: { id: true, username: true } },
        },
      },
    },
  });

  if (!revision) {
    throw AppError.notFound('Revision not found');
  }

  // Check if this is a valid status for review
  if (!['REV_IN_REVIEW', 'REV_APPROVED', 'REV_CHANGES_REQUESTED'].includes(revision.status)) {
    throw AppError.badRequest('This revision is not in a reviewable state');
  }

  const publishedRevision = revision.article.revisions[0];
  const isNewArticle = revision.article.publishedRevisionId === null;

  // Find when it was submitted to review
  const submittedAt = revision.updatedAt; // Simplified, could track separately

  return {
    id: revision.id,
    articleId: revision.article.id,
    articleSlug: revision.article.slug,
    status: revision.status as RevisionStatus,
    
    title: revision.title,
    summary: revision.summary,
    contentMarkdown: revision.contentMarkdown,
    bibliography: revision.bibliography,
    categories: revision.categories.map((rc) => ({
      id: rc.category.id,
      name: rc.category.name,
      slug: rc.category.slug,
    })),
    
    author: {
      id: revision.article.author.id,
      username: revision.article.author.username,
      displayName: revision.article.author.profile?.displayName ?? null,
      avatarUrl: revision.article.author.profile?.avatarUrl ?? null,
      isBanned: revision.article.author.ban?.isBanned ?? false,
    },
    
    isNewArticle,
    currentPublishedTitle: publishedRevision?.title ?? null,
    
    feedbackHistory: revision.reviews.map((review) => ({
      id: review.id,
      reviewerId: review.reviewer.id,
      reviewerUsername: review.reviewer.username,
      action: review.action as 'FEEDBACK' | 'APPROVE',
      feedbackText: review.feedbackText,
      createdAt: review.createdAt.toISOString(),
    })),
    
    createdAt: revision.createdAt.toISOString(),
    submittedAt: submittedAt.toISOString(),
    updatedAt: revision.updatedAt.toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════
// Give Feedback (Changes Requested)
// ═══════════════════════════════════════════════════════════

/**
 * Give feedback and request changes
 */
export async function giveFeedback(
  revisionId: string,
  reviewerId: string,
  feedbackText: string
): Promise<ReviewActionResponse> {
  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: {
      article: { select: { id: true, slug: true } },
    },
  });

  if (!revision) {
    throw AppError.notFound('Revision not found');
  }

  if (revision.status !== 'REV_IN_REVIEW') {
    throw AppError.forbidden(
      `Cannot give feedback to revision in ${revision.status} status. ` +
      'Only revisions in REV_IN_REVIEW status can receive feedback.'
    );
  }

  // Transaction: update status + create review + audit log
  await prisma.$transaction([
    // 1. Update revision status
    prisma.revision.update({
      where: { id: revisionId },
      data: { status: 'REV_CHANGES_REQUESTED' },
    }),

    // 2. Create review record
    prisma.revisionReview.create({
      data: {
        revisionId,
        reviewerId,
        action: 'FEEDBACK',
        feedbackText,
      },
    }),

    // 3. Audit log
    prisma.auditLog.create({
      data: {
        actorId: reviewerId,
        action: AUDIT_ACTIONS.REV_FEEDBACK,
        targetType: 'revision',
        targetId: revisionId,
        meta: {
          articleId: revision.article.id,
          articleSlug: revision.article.slug,
          feedbackLength: feedbackText.length,
        },
      },
    }),
  ]);

  return {
    revisionId,
    newStatus: 'REV_CHANGES_REQUESTED',
    message: 'Geri bildirim başarıyla gönderildi.',
  };
}

// ═══════════════════════════════════════════════════════════
// Approve Revision
// ═══════════════════════════════════════════════════════════

/**
 * Approve a revision
 */
export async function approveRevision(
  revisionId: string,
  reviewerId: string
): Promise<ReviewActionResponse> {
  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: {
      article: { select: { id: true, slug: true } },
    },
  });

  if (!revision) {
    throw AppError.notFound('Revision not found');
  }

  if (revision.status !== 'REV_IN_REVIEW') {
    throw AppError.forbidden(
      `Cannot approve revision in ${revision.status} status. ` +
      'Only revisions in REV_IN_REVIEW status can be approved.'
    );
  }

  // Transaction: update status + create review + audit log
  await prisma.$transaction([
    // 1. Update revision status
    prisma.revision.update({
      where: { id: revisionId },
      data: { status: 'REV_APPROVED' },
    }),

    // 2. Create review record
    prisma.revisionReview.create({
      data: {
        revisionId,
        reviewerId,
        action: 'APPROVE',
        feedbackText: null,
      },
    }),

    // 3. Audit log
    prisma.auditLog.create({
      data: {
        actorId: reviewerId,
        action: AUDIT_ACTIONS.REV_APPROVED,
        targetType: 'revision',
        targetId: revisionId,
        meta: {
          articleId: revision.article.id,
          articleSlug: revision.article.slug,
        },
      },
    }),
  ]);

  return {
    revisionId,
    newStatus: 'REV_APPROVED',
    message: 'Revision başarıyla onaylandı. Yayın için Admin onayı bekliyor.',
  };
}

