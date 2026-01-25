import type {
  RevisionDTO,
  UpdateRevisionInput,
  RevisionListItemDTO,
  StatusChangeResponse,
  MyRevisionsResponse,
  RevisionStatus,
} from '@emc3/shared';
import { EDITABLE_STATUSES, canTransition } from '@emc3/shared';

import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

// ═══════════════════════════════════════════════════════════
// Get Revision by ID
// ═══════════════════════════════════════════════════════════

/**
 * Get revision by ID (for editing)
 */
export async function getRevision(
  revisionId: string,
  requesterId: string,
  requesterRoles: string[]
): Promise<RevisionDTO> {
  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: {
      article: {
        select: { id: true, slug: true, authorId: true },
      },
      categories: {
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          reviewer: { select: { id: true, username: true } },
        },
      },
    },
  });

  if (!revision) {
    throw AppError.notFound('Revision not found');
  }

  // Check access
  const isAuthor = revision.article.authorId === requesterId;
  const isReviewer = requesterRoles.includes('REVIEWER') || requesterRoles.includes('ADMIN');

  if (!isAuthor && !isReviewer) {
    throw AppError.forbidden('Access denied');
  }

  const lastReview = revision.reviews[0];

  return {
    id: revision.id,
    articleId: revision.article.id,
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
    lastReviewFeedback: lastReview
      ? {
          id: lastReview.id,
          reviewerId: lastReview.reviewer.id,
          reviewerUsername: lastReview.reviewer.username,
          action: lastReview.action as 'FEEDBACK' | 'APPROVE',
          feedbackText: lastReview.feedbackText,
          createdAt: lastReview.createdAt.toISOString(),
        }
      : null,
    createdAt: revision.createdAt.toISOString(),
    updatedAt: revision.updatedAt.toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════
// Update Revision
// ═══════════════════════════════════════════════════════════

/**
 * Update a revision (only editable statuses)
 */
export async function updateRevision(
  revisionId: string,
  authorId: string,
  input: UpdateRevisionInput
): Promise<RevisionDTO> {
  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: {
      article: { select: { authorId: true } },
    },
  });

  if (!revision) {
    throw AppError.notFound('Revision not found');
  }

  // Verify ownership
  if (revision.article.authorId !== authorId) {
    throw AppError.forbidden('You can only edit your own revisions');
  }

  // Check if revision is editable
  if (!EDITABLE_STATUSES.includes(revision.status as RevisionStatus)) {
    throw AppError.forbidden(
      `Cannot edit revision in ${revision.status} status`
    );
  }

  // Validate categories if provided
  if (input.categoryIds && input.categoryIds.length > 0) {
    const categories = await prisma.category.findMany({
      where: { id: { in: input.categoryIds } },
    });

    if (categories.length !== input.categoryIds.length) {
      throw AppError.badRequest('One or more categories not found');
    }
  }

  // Update revision
  await prisma.$transaction(async (tx) => {
    // Update revision fields
    await tx.revision.update({
      where: { id: revisionId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.summary !== undefined && { summary: input.summary }),
        ...(input.contentMarkdown !== undefined && {
          contentMarkdown: input.contentMarkdown,
        }),
        ...(input.bibliography !== undefined && {
          bibliography: input.bibliography,
        }),
      },
    });

    // Update categories if provided
    if (input.categoryIds && input.categoryIds.length > 0) {
      // Delete existing category links
      await tx.revisionCategory.deleteMany({
        where: { revisionId },
      });

      // Create new category links
      await tx.revisionCategory.createMany({
        data: input.categoryIds.map((categoryId) => ({
          revisionId,
          categoryId,
        })),
      });
    }
  });

  // Return updated revision
  return getRevision(revisionId, authorId, []);
}

// ═══════════════════════════════════════════════════════════
// Delete Draft Revision
// ═══════════════════════════════════════════════════════════

/**
 * Delete a draft revision
 */
export async function deleteRevision(
  revisionId: string,
  authorId: string
): Promise<void> {
  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: {
      article: { select: { authorId: true } },
    },
  });

  if (!revision) {
    throw AppError.notFound('Revision not found');
  }

  // Verify ownership
  if (revision.article.authorId !== authorId) {
    throw AppError.forbidden('You can only delete your own revisions');
  }

  // Only drafts can be deleted
  if (revision.status !== 'REV_DRAFT') {
    throw AppError.forbidden('Only draft revisions can be deleted');
  }

  // Delete revision (cascade deletes category links)
  await prisma.revision.delete({
    where: { id: revisionId },
  });
}

// ═══════════════════════════════════════════════════════════
// Submit to Review
// ═══════════════════════════════════════════════════════════

/**
 * Submit a revision to review
 */
export async function submitToReview(
  revisionId: string,
  authorId: string
): Promise<StatusChangeResponse> {
  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: {
      article: { select: { id: true, authorId: true } },
    },
  });

  if (!revision) {
    throw AppError.notFound('Revision not found');
  }

  // Verify ownership
  if (revision.article.authorId !== authorId) {
    throw AppError.forbidden('You can only submit your own revisions');
  }

  // Check transition is allowed
  if (!canTransition(revision.status, 'REV_IN_REVIEW')) {
    throw AppError.forbidden(
      `Cannot submit revision from ${revision.status} status`
    );
  }

  // Update status
  await prisma.$transaction([
    prisma.revision.update({
      where: { id: revisionId },
      data: { status: 'REV_IN_REVIEW' },
    }),
    // Audit log
    prisma.auditLog.create({
      data: {
        actorId: authorId,
        action: 'REV_SUBMITTED',
        targetType: 'revision',
        targetId: revisionId,
        meta: {
          articleId: revision.article.id,
        },
      },
    }),
  ]);

  return { status: 'REV_IN_REVIEW' };
}

// ═══════════════════════════════════════════════════════════
// Withdraw from Review
// ═══════════════════════════════════════════════════════════

/**
 * Withdraw a revision from review
 */
export async function withdrawFromReview(
  revisionId: string,
  authorId: string
): Promise<StatusChangeResponse> {
  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: {
      article: { select: { id: true, authorId: true } },
    },
  });

  if (!revision) {
    throw AppError.notFound('Revision not found');
  }

  // Verify ownership
  if (revision.article.authorId !== authorId) {
    throw AppError.forbidden('You can only withdraw your own revisions');
  }

  // Check transition is allowed
  if (!canTransition(revision.status, 'REV_WITHDRAWN')) {
    throw AppError.forbidden(
      `Cannot withdraw revision from ${revision.status} status`
    );
  }

  // Update status
  await prisma.$transaction([
    prisma.revision.update({
      where: { id: revisionId },
      data: { status: 'REV_WITHDRAWN' },
    }),
    // Audit log
    prisma.auditLog.create({
      data: {
        actorId: authorId,
        action: 'REV_WITHDRAWN',
        targetType: 'revision',
        targetId: revisionId,
        meta: {
          articleId: revision.article.id,
        },
      },
    }),
  ]);

  return { status: 'REV_WITHDRAWN' };
}

// ═══════════════════════════════════════════════════════════
// Get My Revisions
// ═══════════════════════════════════════════════════════════

/**
 * Get user's own revisions (for drafts page)
 */
export async function getMyRevisions(
  userId: string,
  options: { status?: string; limit: number; cursor?: string }
): Promise<MyRevisionsResponse> {
  const { status, limit, cursor } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    article: { authorId: userId },
  };

  if (status) {
    where.status = status;
  }

  if (cursor) {
    where.id = { lt: cursor };
  }

  const revisions = await prisma.revision.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take: limit + 1, // Get one extra to check if there's more
    include: {
      article: { select: { id: true } },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  const hasMore = revisions.length > limit;
  const items = revisions.slice(0, limit);

  const mappedItems: RevisionListItemDTO[] = items.map((rev) => ({
    id: rev.id,
    articleId: rev.article.id,
    title: rev.title,
    status: rev.status as RevisionStatus,
    hasUnreadFeedback:
      rev.status === 'REV_CHANGES_REQUESTED' &&
      rev.reviews[0] !== undefined &&
      rev.reviews[0].createdAt > rev.updatedAt,
    createdAt: rev.createdAt.toISOString(),
    updatedAt: rev.updatedAt.toISOString(),
  }));

  return {
    items: mappedItems,
    meta: {
      nextCursor: hasMore && items.length > 0 ? items[items.length - 1]!.id : null,
      hasMore,
    },
  };
}

