import type {
  OpinionDTO,
  OpinionListResponse,
  OpinionListParams,
  CreateOpinionRequest,
  CreateOpinionResponse,
  UpdateOpinionRequest,
  OpinionLikeToggleResponse,
  CreateReplyRequest,
  UpdateReplyRequest,
  OpinionAuthorDTO,
  OpinionReplyDTO,
} from '@emc3/shared';
import { OPINION_EDIT_WINDOW_MS } from '@emc3/shared';

import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

// ═══════════════════════════════════════════════════════════
// Opinion Service
// ═══════════════════════════════════════════════════════════

/**
 * Get opinions for an article
 */
export async function getOpinions(
  articleId: string,
  viewerId: string | undefined,
  params: OpinionListParams
): Promise<OpinionListResponse> {
  // Validate article exists
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true, authorId: true },
  });

  if (!article) {
    throw AppError.notFound('Article not found');
  }

  const { sort = 'helpful', limit = 20, cursor } = params;
  const takeLimit = Math.min(limit, 50);

  // Build where clause
  const where: {
    articleId: string;
    removedAt: null;
    createdAt?: { lt?: Date };
  } = {
    articleId,
    removedAt: null,
  };

  // Cursor-based pagination
  if (cursor) {
    where.createdAt = { lt: new Date(cursor) };
  }

  // Get opinions with sorting
  const orderBy =
    sort === 'helpful'
      ? [{ likeCount: 'desc' as const }, { createdAt: 'desc' as const }]
      : [{ createdAt: 'desc' as const }];

  const [opinions, total, viewerOpinion] = await Promise.all([
    prisma.opinion.findMany({
      where,
      include: {
        author: {
          include: {
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
        likes: viewerId ? { where: { userId: viewerId } } : { where: { userId: { in: [] } } }, // Empty array if no viewerId
        reply: {
          include: {
            replier: {
              include: {
                profile: { select: { displayName: true, avatarUrl: true } },
              },
            },
          },
        },
      },
      orderBy,
      take: takeLimit + 1, // Fetch one extra to check if there's more
    }),
    prisma.opinion.count({ where: { articleId, removedAt: null } }),
    viewerId
      ? prisma.opinion.findFirst({
          where: {
            articleId,
            authorId: viewerId,
          },
          include: {
            author: {
              include: {
                profile: { select: { displayName: true, avatarUrl: true } },
              },
            },
            likes: { where: { userId: viewerId } },
            reply: {
              include: {
                replier: {
                  include: {
                    profile: { select: { displayName: true, avatarUrl: true } },
                  },
                },
              },
            },
          },
        })
      : null,
  ]);

  const hasMore = opinions.length > takeLimit;
  const items = opinions.slice(0, takeLimit);
  const lastItem = items.length > 0 ? items[items.length - 1] : null;

  return {
    items: items.map((op) => mapToOpinionDTO(op, viewerId, article.authorId)),
    meta: {
      total,
      nextCursor: hasMore && lastItem ? lastItem.createdAt.toISOString() : null,
      hasMore,
    },
    viewerOpinion: viewerOpinion
      ? mapToOpinionDTO(viewerOpinion, viewerId, article.authorId)
      : undefined,
  };
}

/**
 * Create opinion
 */
export async function createOpinion(
  articleId: string,
  authorId: string,
  input: CreateOpinionRequest
): Promise<CreateOpinionResponse> {
  // Validate article exists
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true, authorId: true },
  });

  if (!article) {
    throw AppError.notFound('Article not found');
  }

  // Check if user already has an opinion
  const existing = await prisma.opinion.findFirst({
    where: {
      articleId,
      authorId,
    },
  });

  if (existing) {
    throw AppError.conflict('You already have an opinion on this article');
  }

  // Create opinion
  const opinion = await prisma.opinion.create({
    data: {
      articleId,
      authorId,
      bodyMarkdown: input.bodyMarkdown,
    },
    include: {
      author: {
        include: {
          profile: { select: { displayName: true, avatarUrl: true } },
        },
      },
      likes: { where: { userId: authorId } },
      reply: true,
    },
  });

  return {
    opinion: mapToOpinionDTO(opinion, authorId, article.authorId),
  };
}

/**
 * Update opinion (within edit window)
 */
export async function updateOpinion(
  opinionId: string,
  authorId: string,
  input: UpdateOpinionRequest
): Promise<OpinionDTO> {
  const opinion = await prisma.opinion.findUnique({
    where: { id: opinionId },
    include: {
      article: { select: { authorId: true } },
    },
  });

  if (!opinion) {
    throw AppError.notFound('Opinion not found');
  }

  if (opinion.authorId !== authorId) {
    throw AppError.forbidden('You can only edit your own opinions');
  }

  // Check edit window (10 minutes)
  const now = new Date();
  const createdAt = opinion.createdAt;
  const editWindowEnd = new Date(createdAt.getTime() + OPINION_EDIT_WINDOW_MS);

  if (now > editWindowEnd) {
    throw AppError.forbidden('Edit window has expired (10 minutes)');
  }

  // Update opinion
  const updated = await prisma.opinion.update({
    where: { id: opinionId },
    data: { bodyMarkdown: input.bodyMarkdown },
    include: {
      author: {
        include: {
          profile: { select: { displayName: true, avatarUrl: true } },
        },
      },
      likes: { where: { userId: authorId } },
      reply: {
        include: {
          replier: {
            include: {
              profile: { select: { displayName: true, avatarUrl: true } },
            },
          },
        },
      },
    },
  });

  return mapToOpinionDTO(updated, authorId, opinion.article.authorId);
}

/**
 * Like/unlike opinion
 */
export async function toggleOpinionLike(
  opinionId: string,
  userId: string
): Promise<OpinionLikeToggleResponse> {
  const opinion = await prisma.opinion.findUnique({
    where: { id: opinionId },
    select: { id: true, likeCount: true },
  });

  if (!opinion) {
    throw AppError.notFound('Opinion not found');
  }

    const existingLike = await prisma.opinionLike.findFirst({
      where: {
        userId,
        opinionId,
      },
    });

  if (existingLike) {
    // Unlike
    const [, updated] = await prisma.$transaction([
      prisma.opinionLike.delete({
        where: {
          userId_opinionId: { userId, opinionId },
        },
      }),
      prisma.opinion.update({
        where: { id: opinionId },
        data: { likeCount: { decrement: 1 } },
        select: { likeCount: true },
      }),
    ]);

    return {
      liked: false,
      likeCount: updated.likeCount,
    };
  } else {
    // Like
    const [, updated] = await prisma.$transaction([
      prisma.opinionLike.create({
        data: { userId, opinionId },
      }),
      prisma.opinion.update({
        where: { id: opinionId },
        data: { likeCount: { increment: 1 } },
        select: { likeCount: true },
      }),
    ]);

    return {
      liked: true,
      likeCount: updated.likeCount,
    };
  }
}

/**
 * Create author reply
 */
export async function createReply(
  opinionId: string,
  replierId: string,
  input: CreateReplyRequest
): Promise<OpinionReplyDTO> {
  const opinion = await prisma.opinion.findUnique({
    where: { id: opinionId },
    include: {
      article: { select: { authorId: true } },
      reply: true,
    },
  });

  if (!opinion) {
    throw AppError.notFound('Opinion not found');
  }

  // Check if replier is article author
  if (opinion.article.authorId !== replierId) {
    throw AppError.forbidden('Only the article author can reply');
  }

  // Check if reply already exists
  if (opinion.reply) {
    throw AppError.conflict('Reply already exists');
  }

  // Create reply
  const reply = await prisma.opinionReply.create({
    data: {
      opinionId,
      replierId,
      bodyMarkdown: input.bodyMarkdown,
    },
    include: {
      replier: {
        include: {
          profile: { select: { displayName: true, avatarUrl: true } },
        },
      },
    },
  });

  return mapToReplyDTO(reply, replierId);
}

/**
 * Update reply (within edit window)
 */
export async function updateReply(
  opinionId: string,
  replierId: string,
  input: UpdateReplyRequest
): Promise<OpinionReplyDTO> {
  const reply = await prisma.opinionReply.findUnique({
    where: { opinionId },
  });

  if (!reply) {
    throw AppError.notFound('Reply not found');
  }

  if (reply.replierId !== replierId) {
    throw AppError.forbidden('You can only edit your own replies');
  }

  // Check edit window (10 minutes)
  const now = new Date();
  const createdAt = reply.createdAt;
  const editWindowEnd = new Date(createdAt.getTime() + OPINION_EDIT_WINDOW_MS);

  if (now > editWindowEnd) {
    throw AppError.forbidden('Edit window has expired (10 minutes)');
  }

  // Update reply
  const updated = await prisma.opinionReply.update({
    where: { opinionId },
    data: { bodyMarkdown: input.bodyMarkdown },
    include: {
      replier: {
        include: {
          profile: { select: { displayName: true, avatarUrl: true } },
        },
      },
    },
  });

  return mapToReplyDTO(updated, replierId);
}

/**
 * Delete opinion (soft delete by author)
 * Also deletes the reply if it exists
 */
export async function deleteOpinion(
  opinionId: string,
  authorId: string
): Promise<void> {
  const opinion = await prisma.opinion.findUnique({
    where: { id: opinionId },
    include: {
      reply: true,
    },
  });

  if (!opinion) {
    throw AppError.notFound('Opinion not found');
  }

  if (opinion.authorId !== authorId) {
    throw AppError.forbidden('You can only delete your own opinions');
  }

  if (opinion.removedAt) {
    throw AppError.conflict('Opinion is already deleted');
  }

  const now = new Date();

  // Soft delete opinion and reply (if exists) in a transaction
  await prisma.$transaction(async (tx) => {
    // Soft delete opinion
    await tx.opinion.update({
      where: { id: opinionId },
      data: { removedAt: now },
    });

    // Soft delete reply if it exists and is not already deleted
    if (opinion.reply && !opinion.reply.removedAt) {
      await tx.opinionReply.update({
        where: { opinionId },
        data: { removedAt: now },
      });
    }
  });
}

// ═══════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════

function mapToOpinionDTO(
  opinion: {
    id: string;
    articleId: string;
    bodyMarkdown: string;
    likeCount: number;
    removedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    author: {
      id: string;
      username: string;
      profile: { displayName: string | null; avatarUrl: string | null } | null;
    };
    likes: { userId: string }[];
    reply: {
      opinionId: string;
      bodyMarkdown: string;
      createdAt: Date;
      updatedAt: Date;
      replier: {
        id: string;
        username: string;
        profile: { displayName: string | null; avatarUrl: string | null } | null;
      };
    } | null;
  },
  viewerId: string | undefined,
  articleAuthorId: string
): OpinionDTO {
  const now = new Date();
  const createdAt = opinion.createdAt;
  const editWindowEnd = new Date(createdAt.getTime() + OPINION_EDIT_WINDOW_MS);
  const canEdit = opinion.author.id === viewerId && now <= editWindowEnd;

  const reply = opinion.reply
    ? mapToReplyDTO(opinion.reply, viewerId)
    : null;

  return {
    id: opinion.id,
    articleId: opinion.articleId,
    author: {
      id: opinion.author.id,
      username: opinion.author.username,
      displayName: opinion.author.profile?.displayName ?? null,
      avatarUrl: opinion.author.profile?.avatarUrl ?? null,
    },
    bodyMarkdown: opinion.bodyMarkdown,
    likeCount: opinion.likeCount,
    viewerHasLiked: opinion.likes.length > 0,
    canEdit,
    canReply: articleAuthorId === viewerId && !reply,
    removedAt: opinion.removedAt?.toISOString() ?? null,
    createdAt: opinion.createdAt.toISOString(),
    updatedAt: opinion.updatedAt.toISOString(),
    reply,
  };
}

function mapToReplyDTO(
  reply: {
    bodyMarkdown: string;
    createdAt: Date;
    updatedAt: Date;
    replier: {
      id: string;
      username: string;
      profile: { displayName: string | null; avatarUrl: string | null } | null;
    };
  },
  viewerId: string | undefined
): OpinionReplyDTO {
  const now = new Date();
  const createdAt = reply.createdAt;
  const editWindowEnd = new Date(createdAt.getTime() + OPINION_EDIT_WINDOW_MS);
  const canEdit = reply.replier.id === viewerId && now <= editWindowEnd;

  return {
    replier: {
      id: reply.replier.id,
      username: reply.replier.username,
      displayName: reply.replier.profile?.displayName ?? null,
      avatarUrl: reply.replier.profile?.avatarUrl ?? null,
    },
    bodyMarkdown: reply.bodyMarkdown,
    createdAt: reply.createdAt.toISOString(),
    updatedAt: reply.updatedAt.toISOString(),
    canEdit,
  };
}
