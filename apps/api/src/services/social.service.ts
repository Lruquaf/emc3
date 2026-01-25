import { ArticleStatus } from '@prisma/client';
import type {
  LikeToggleResponse,
  SaveToggleResponse,
  SavedArticlesResponse,
  FeedItemDTO,
} from '@emc3/shared';

import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

// ═══════════════════════════════════════════════════════════
// Social Service - Like & Save Operations
// ═══════════════════════════════════════════════════════════

/**
 * Like an article
 */
export async function likeArticle(
  userId: string,
  articleId: string
): Promise<LikeToggleResponse> {
  // Validate article exists and is published
  const article = await validatePublishedArticle(articleId);

  // Check if already liked
  const existingLike = await prisma.articleLike.findUnique({
    where: {
      userId_articleId: { userId, articleId },
    },
  });

  if (existingLike) {
    // Already liked, return current state
    return {
      liked: true,
      likeCount: article.likeCount,
    };
  }

  // Create like and increment counter atomically
  const [, updatedArticle] = await prisma.$transaction([
    prisma.articleLike.create({
      data: { userId, articleId },
    }),
    prisma.article.update({
      where: { id: articleId },
      data: { likeCount: { increment: 1 } },
      select: { likeCount: true },
    }),
  ]);

  return {
    liked: true,
    likeCount: updatedArticle.likeCount,
  };
}

/**
 * Unlike an article
 */
export async function unlikeArticle(
  userId: string,
  articleId: string
): Promise<LikeToggleResponse> {
  const article = await validatePublishedArticle(articleId);

  // Check if liked
  const existingLike = await prisma.articleLike.findUnique({
    where: {
      userId_articleId: { userId, articleId },
    },
  });

  if (!existingLike) {
    // Not liked, return current state
    return {
      liked: false,
      likeCount: article.likeCount,
    };
  }

  // Delete like and decrement counter atomically
  const [, updatedArticle] = await prisma.$transaction([
    prisma.articleLike.delete({
      where: {
        userId_articleId: { userId, articleId },
      },
    }),
    prisma.article.update({
      where: { id: articleId },
      data: { likeCount: { decrement: 1 } },
      select: { likeCount: true },
    }),
  ]);

  return {
    liked: false,
    likeCount: Math.max(0, updatedArticle.likeCount), // Ensure non-negative
  };
}

/**
 * Save an article
 */
export async function saveArticle(
  userId: string,
  articleId: string
): Promise<SaveToggleResponse> {
  const article = await validatePublishedArticle(articleId);

  const existingSave = await prisma.articleSave.findUnique({
    where: {
      userId_articleId: { userId, articleId },
    },
  });

  if (existingSave) {
    return {
      saved: true,
      saveCount: article.saveCount,
    };
  }

  const [, updatedArticle] = await prisma.$transaction([
    prisma.articleSave.create({
      data: { userId, articleId },
    }),
    prisma.article.update({
      where: { id: articleId },
      data: { saveCount: { increment: 1 } },
      select: { saveCount: true },
    }),
  ]);

  return {
    saved: true,
    saveCount: updatedArticle.saveCount,
  };
}

/**
 * Unsave an article
 */
export async function unsaveArticle(
  userId: string,
  articleId: string
): Promise<SaveToggleResponse> {
  const article = await validatePublishedArticle(articleId);

  const existingSave = await prisma.articleSave.findUnique({
    where: {
      userId_articleId: { userId, articleId },
    },
  });

  if (!existingSave) {
    return {
      saved: false,
      saveCount: article.saveCount,
    };
  }

  const [, updatedArticle] = await prisma.$transaction([
    prisma.articleSave.delete({
      where: {
        userId_articleId: { userId, articleId },
      },
    }),
    prisma.article.update({
      where: { id: articleId },
      data: { saveCount: { decrement: 1 } },
      select: { saveCount: true },
    }),
  ]);

  return {
    saved: false,
    saveCount: Math.max(0, updatedArticle.saveCount),
  };
}

/**
 * Get user's saved articles
 */
export async function getSavedArticles(
  userId: string,
  limit: number,
  cursor?: string
): Promise<SavedArticlesResponse> {
  const cursorDate = cursor ? new Date(cursor) : undefined;

  const saves = await prisma.articleSave.findMany({
    where: {
      userId,
      ...(cursorDate && {
        createdAt: { lt: cursorDate },
      }),
      article: {
        status: ArticleStatus.PUBLISHED,
        revisions: { some: { status: 'REV_PUBLISHED' } },
        author: { ban: null },
      },
    },
    include: {
      article: {
        include: {
          author: {
            include: {
              profile: true,
              ban: true,
            },
          },
          revisions: {
            where: { status: 'REV_PUBLISHED' },
            include: {
              categories: {
                include: {
                  category: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          likes: {
            where: { userId },
            select: { userId: true },
          },
          saves: {
            where: { userId },
            select: { userId: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
  });

  const valid = saves.filter(
    (s) =>
      s.article.revisions?.length > 0 &&
      s.article.firstPublishedAt != null &&
      s.article.lastPublishedAt != null
  );
  const hasMore = valid.length > limit;
  const items = valid.slice(0, limit);

  return {
    items: items.map((save) => ({
      article: mapToFeedItem(save.article, userId),
      savedAt: save.createdAt.toISOString(),
    })),
    meta: {
      nextCursor: hasMore
        ? items[items.length - 1]!.createdAt.toISOString()
        : null,
      hasMore,
    },
  };
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Validate article exists and is published
 */
async function validatePublishedArticle(articleId: string) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      status: true,
      likeCount: true,
      saveCount: true,
    },
  });

  if (!article) {
    throw AppError.notFound('Article not found');
  }

  if (article.status !== ArticleStatus.PUBLISHED) {
    throw AppError.forbidden('Cannot interact with unpublished article');
  }

  return article;
}

/**
 * Map article to FeedItemDTO
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapToFeedItem(article: any, viewerId?: string): FeedItemDTO {
  const revision = article.revisions?.[0];
  const categories =
    revision?.categories?.map(
      (rc: { category: { id: string; name: string; slug: string } }) => ({
        id: rc.category.id,
        name: rc.category.name,
        slug: rc.category.slug,
      })
    ) ?? [];

  return {
    id: article.id,
    author: {
      id: article.author.id,
      username: article.author.username,
      displayName: article.author.profile?.displayName ?? null,
      avatarUrl: article.author.profile?.avatarUrl ?? null,
      isBanned: !!article.author.ban,
      isDeleted: article.author.isDeleted ?? false,
    },
    title: revision?.title ?? '',
    summary: revision?.summary ?? '',
    categories,
    counts: {
      likes: article.likeCount,
      saves: article.saveCount,
      views: Number(article.viewCount),
    },
    viewerInteraction: viewerId
      ? {
          hasLiked: (article.likes?.length ?? 0) > 0,
          hasSaved: (article.saves?.length ?? 0) > 0,
        }
      : undefined,
    firstPublishedAt: article.firstPublishedAt?.toISOString() ?? '',
    lastPublishedAt: article.lastPublishedAt?.toISOString() ?? '',
    isUpdated:
      article.firstPublishedAt?.getTime() !==
      article.lastPublishedAt?.getTime(),
  };
}

