import { ArticleStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';
import { auditService } from './audit.service.js';
import {
  OPINION_EDIT_WINDOW_MS,
  AUDIT_ACTIONS,
  type OpinionDTO,
  type OpinionListResponse,
  type OpinionListParams,
  type CreateOpinionResponse,
  type OpinionLikeToggleResponse,
  type OpinionReplyDTO,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// OPINION SERVICE - FAZ 6
// ═══════════════════════════════════════════════════════════

export class OpinionService {
  // ═══════════════════════════════════════════════════════════
  // LIST OPINIONS
  // ═══════════════════════════════════════════════════════════

  async listOpinions(
    articleId: string,
    params: OpinionListParams,
    viewerId?: string
  ): Promise<OpinionListResponse> {
    const { sort = 'helpful', limit = 20, cursor } = params;

    // Verify article exists and is published
    const article = await this.getPublishedArticle(articleId);

    // Build where clause
    const where: Prisma.OpinionWhereInput = {
      articleId,
      removedAt: null, // Exclude removed opinions
    };

    // Cursor handling
    if (cursor) {
      const cursorData = this.decodeCursor(cursor);
      if (sort === 'helpful') {
        where.OR = [
          { likeCount: { lt: cursorData.likeCount } },
          {
            likeCount: cursorData.likeCount,
            createdAt: { lt: new Date(cursorData.createdAt) },
          },
        ];
      } else {
        where.createdAt = { lt: new Date(cursorData.createdAt) };
      }
    }

    // Sort order
    const orderBy: Prisma.OpinionOrderByWithRelationInput[] =
      sort === 'helpful'
        ? [{ likeCount: 'desc' }, { createdAt: 'desc' }]
        : [{ createdAt: 'desc' }];

    // Get opinions
    const opinions = await prisma.opinion.findMany({
      where,
      include: {
        author: {
          include: { profile: true },
        },
        reply: {
          include: {
            replier: {
              include: { profile: true },
            },
          },
        },
        likes: viewerId
          ? {
              where: { userId: viewerId },
              select: { userId: true },
            }
          : false,
      },
      orderBy,
      take: limit + 1,
    });

    // Get viewer's own opinion (if exists)
    let viewerOpinion: OpinionDTO | undefined;
    if (viewerId) {
      const ownOpinion = await prisma.opinion.findUnique({
        where: {
          articleId_authorId: { articleId, authorId: viewerId },
        },
        include: {
          author: {
            include: { profile: true },
          },
          reply: {
            include: {
              replier: {
                include: { profile: true },
              },
            },
          },
          likes: {
            where: { userId: viewerId },
            select: { userId: true },
          },
        },
      });

      if (ownOpinion && !ownOpinion.removedAt) {
        viewerOpinion = this.mapToOpinionDTO(
          ownOpinion,
          viewerId,
          article.authorId
        );
      }
    }

    // Get total count
    const total = await prisma.opinion.count({
      where: { articleId, removedAt: null },
    });

    const hasMore = opinions.length > limit;
    const items = opinions.slice(0, limit);

    return {
      items: items.map((opinion) =>
        this.mapToOpinionDTO(opinion, viewerId, article.authorId)
      ),
      meta: {
        total,
        nextCursor: hasMore
          ? this.encodeCursor(items[items.length - 1], sort)
          : null,
        hasMore,
      },
      viewerOpinion,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // CREATE OPINION
  // ═══════════════════════════════════════════════════════════

  async createOpinion(
    articleId: string,
    authorId: string,
    bodyMarkdown: string
  ): Promise<CreateOpinionResponse> {
    // Verify article exists and is published
    const article = await this.getPublishedArticle(articleId);

    // Check if user already has an opinion on this article
    const existingOpinion = await prisma.opinion.findUnique({
      where: {
        articleId_authorId: { articleId, authorId },
      },
    });

    if (existingOpinion) {
      throw AppError.conflict('You have already posted an opinion on this article');
    }

    // Create opinion
    const opinion = await prisma.opinion.create({
      data: {
        articleId,
        authorId,
        bodyMarkdown,
      },
      include: {
        author: {
          include: { profile: true },
        },
        reply: true,
        likes: false,
      },
    });

    return {
      opinion: this.mapToOpinionDTO(opinion, authorId, article.authorId),
    };
  }

  // ═══════════════════════════════════════════════════════════
  // UPDATE OPINION
  // ═══════════════════════════════════════════════════════════

  async updateOpinion(
    opinionId: string,
    userId: string,
    bodyMarkdown: string
  ): Promise<OpinionDTO> {
    const opinion = await this.getOpinionWithArticle(opinionId);

    // Check ownership
    if (opinion.authorId !== userId) {
      throw AppError.forbidden('You can only edit your own opinion');
    }

    // Check edit window
    if (!this.canEdit(opinion.createdAt)) {
      throw AppError.forbidden(
        'Edit window has expired. Opinions can only be edited within 10 minutes of posting.'
      );
    }

    // Update
    const updated = await prisma.opinion.update({
      where: { id: opinionId },
      data: { bodyMarkdown },
      include: {
        author: {
          include: { profile: true },
        },
        reply: {
          include: {
            replier: {
              include: { profile: true },
            },
          },
        },
        likes: {
          where: { userId },
          select: { userId: true },
        },
      },
    });

    return this.mapToOpinionDTO(updated, userId, opinion.article.authorId);
  }

  // ═══════════════════════════════════════════════════════════
  // REMOVE OPINION (Soft Delete)
  // ═══════════════════════════════════════════════════════════

  async removeOpinion(
    opinionId: string,
    moderatorId: string,
    reason?: string
  ): Promise<void> {
    const opinion = await prisma.opinion.findUnique({
      where: { id: opinionId },
    });

    if (!opinion) {
      throw AppError.notFound('Opinion not found');
    }

    if (opinion.removedAt) {
      throw AppError.conflict('Opinion is already removed');
    }

    // Soft delete
    await prisma.opinion.update({
      where: { id: opinionId },
      data: { removedAt: new Date() },
    });

    // Audit log
    await auditService.log({
      actorId: moderatorId,
      action: AUDIT_ACTIONS.OPINION_REMOVED,
      targetType: 'opinion',
      targetId: opinionId,
      reason,
      meta: { articleId: opinion.articleId, authorId: opinion.authorId },
    });
  }

  // ═══════════════════════════════════════════════════════════
  // LIKE / UNLIKE
  // ═══════════════════════════════════════════════════════════

  async likeOpinion(
    opinionId: string,
    userId: string
  ): Promise<OpinionLikeToggleResponse> {
    const opinion = await this.getActiveOpinion(opinionId);

    // Check if already liked
    const existingLike = await prisma.opinionLike.findUnique({
      where: {
        userId_opinionId: { userId, opinionId },
      },
    });

    if (existingLike) {
      return {
        liked: true,
        likeCount: opinion.likeCount,
      };
    }

    // Create like (use transaction to ensure count is accurate)
    await prisma.$transaction(async (tx) => {
      await tx.opinionLike.create({
        data: { userId, opinionId },
      });
      await tx.opinion.update({
        where: { id: opinionId },
        data: { likeCount: { increment: 1 } },
      });
    });

    // Get updated count
    const updated = await prisma.opinion.findUnique({
      where: { id: opinionId },
      select: { likeCount: true },
    });

    return {
      liked: true,
      likeCount: updated?.likeCount ?? opinion.likeCount + 1,
    };
  }

  async unlikeOpinion(
    opinionId: string,
    userId: string
  ): Promise<OpinionLikeToggleResponse> {
    const opinion = await this.getActiveOpinion(opinionId);

    // Check if liked
    const existingLike = await prisma.opinionLike.findUnique({
      where: {
        userId_opinionId: { userId, opinionId },
      },
    });

    if (!existingLike) {
      return {
        liked: false,
        likeCount: opinion.likeCount,
      };
    }

    // Delete like (use transaction to ensure count is accurate)
    await prisma.$transaction(async (tx) => {
      await tx.opinionLike.delete({
        where: {
          userId_opinionId: { userId, opinionId },
        },
      });
      await tx.opinion.update({
        where: { id: opinionId },
        data: { likeCount: { decrement: 1 } },
      });
    });

    // Get updated count
    const updated = await prisma.opinion.findUnique({
      where: { id: opinionId },
      select: { likeCount: true },
    });

    return {
      liked: false,
      likeCount: Math.max(0, updated?.likeCount ?? opinion.likeCount - 1),
    };
  }

  // ═══════════════════════════════════════════════════════════
  // AUTHOR REPLY
  // ═══════════════════════════════════════════════════════════

  async createReply(
    opinionId: string,
    replierId: string,
    bodyMarkdown: string
  ): Promise<OpinionReplyDTO> {
    const opinion = await this.getOpinionWithArticle(opinionId);

    // Check if replier is article author
    if (opinion.article.authorId !== replierId) {
      throw AppError.forbidden('Only the article author can reply to opinions');
    }

    // Check if reply already exists
    const existingReply = await prisma.opinionReply.findUnique({
      where: { opinionId },
    });

    if (existingReply) {
      throw AppError.conflict('You have already replied to this opinion');
    }

    // Create reply
    const reply = await prisma.opinionReply.create({
      data: {
        opinionId,
        replierId,
        bodyMarkdown,
      },
      include: {
        replier: {
          include: { profile: true },
        },
      },
    });

    return this.mapToReplyDTO(reply, replierId);
  }

  async updateReply(
    opinionId: string,
    replierId: string,
    bodyMarkdown: string
  ): Promise<OpinionReplyDTO> {
    const reply = await prisma.opinionReply.findUnique({
      where: { opinionId },
      include: {
        replier: {
          include: { profile: true },
        },
      },
    });

    if (!reply) {
      throw AppError.notFound('Reply not found');
    }

    // Check ownership
    if (reply.replierId !== replierId) {
      throw AppError.forbidden('You can only edit your own reply');
    }

    // Check edit window
    if (!this.canEdit(reply.createdAt)) {
      throw AppError.forbidden(
        'Edit window has expired. Replies can only be edited within 10 minutes.'
      );
    }

    // Update
    const updated = await prisma.opinionReply.update({
      where: { opinionId },
      data: { bodyMarkdown },
      include: {
        replier: {
          include: { profile: true },
        },
      },
    });

    return this.mapToReplyDTO(updated, replierId);
  }

  // ═══════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════

  private async getPublishedArticle(articleId: string) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, status: true, authorId: true },
    });

    if (!article) {
      throw AppError.notFound('Article not found');
    }

    if (article.status !== ArticleStatus.PUBLISHED) {
      throw AppError.forbidden('Cannot add opinions to unpublished articles');
    }

    return article;
  }

  private async getOpinionWithArticle(opinionId: string) {
    const opinion = await prisma.opinion.findUnique({
      where: { id: opinionId },
      include: {
        article: {
          select: { id: true, authorId: true },
        },
      },
    });

    if (!opinion) {
      throw AppError.notFound('Opinion not found');
    }

    if (opinion.removedAt) {
      throw AppError.notFound('Opinion has been removed');
    }

    return opinion;
  }

  private async getActiveOpinion(opinionId: string) {
    const opinion = await prisma.opinion.findUnique({
      where: { id: opinionId },
      select: { id: true, likeCount: true, removedAt: true },
    });

    if (!opinion) {
      throw AppError.notFound('Opinion not found');
    }

    if (opinion.removedAt) {
      throw AppError.notFound('Opinion has been removed');
    }

    return opinion;
  }

  private canEdit(createdAt: Date): boolean {
    const now = Date.now();
    const created = createdAt.getTime();
    return now - created <= OPINION_EDIT_WINDOW_MS;
  }

  private mapToOpinionDTO(
    opinion: any,
    viewerId?: string,
    articleAuthorId?: string
  ): OpinionDTO {
    const isAuthor = viewerId === opinion.authorId;
    const isArticleAuthor = viewerId === articleAuthorId;
    const canEdit = isAuthor && this.canEdit(opinion.createdAt);
    const canReply = isArticleAuthor && !opinion.reply;

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
      viewerHasLiked: Array.isArray(opinion.likes) && opinion.likes.length > 0,
      canEdit,
      canReply,
      removedAt: opinion.removedAt?.toISOString() ?? null,
      createdAt: opinion.createdAt.toISOString(),
      updatedAt: opinion.updatedAt.toISOString(),
      reply: opinion.reply ? this.mapToReplyDTO(opinion.reply, viewerId) : null,
    };
  }

  private mapToReplyDTO(reply: any, viewerId?: string): OpinionReplyDTO {
    const isReplier = viewerId === reply.replierId;
    const canEdit = isReplier && this.canEdit(reply.createdAt);

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

  private encodeCursor(opinion: any, sort: 'helpful' | 'new'): string {
    const data = {
      likeCount: opinion.likeCount,
      createdAt: opinion.createdAt.toISOString(),
    };
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  private decodeCursor(cursor: string): {
    likeCount: number;
    createdAt: string;
  } {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  }
}

// Singleton instance
export const opinionService = new OpinionService();

