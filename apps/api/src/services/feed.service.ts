import { ArticleStatus, Prisma } from '@prisma/client';
import type {
  FeedResponse,
  GlobalFeedParams,
  FollowingFeedParams,
  UserSearchResponse,
} from '@emc3/shared';

import { prisma } from '../lib/prisma.js';
import { mapToFeedItem } from './social.service.js';

// ═══════════════════════════════════════════════════════════
// Feed Service
// ═══════════════════════════════════════════════════════════

/**
 * Get global feed (all published articles).
 * Only includes articles with at least one REV_PUBLISHED revision (actually published).
 * Excludes drafts and in-review articles.
 */
export async function getGlobalFeed(
  params: GlobalFeedParams,
  viewerId?: string
): Promise<FeedResponse> {
  const { query, category, sort = 'new', limit = 20, cursor, authorUsername } = params;

  // Base: must have a published revision (excludes draft / in-review)
  const revisionFilter: Prisma.RevisionWhereInput = {
    status: 'REV_PUBLISHED',
  };

  if (query) {
    revisionFilter.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { summary: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (category) {
    const categoryIds = await getCategoryWithDescendants(category);
    if (categoryIds.length > 0) {
      revisionFilter.categories = {
        some: { categoryId: { in: categoryIds } },
      };
    }
  }

  const authorFilter: Prisma.UserWhereInput = { ban: null };
  if (authorUsername) {
    authorFilter.username = authorUsername;
  }

  const where: Prisma.ArticleWhereInput = {
    status: ArticleStatus.PUBLISHED,
    author: authorFilter,
    revisions: { some: revisionFilter },
  };

  // Cursor handling for keyset pagination
  if (cursor) {
    const [timestamp, id] = decodeCursor(cursor);
    if (sort === 'popular') {
      // For popular sort, we need different cursor logic
      const cursorArticle = await prisma.article.findUnique({
        where: { id },
        select: { likeCount: true, lastPublishedAt: true },
      });
      if (cursorArticle) {
        where.OR = [
          { likeCount: { lt: cursorArticle.likeCount } },
          {
            likeCount: cursorArticle.likeCount,
            lastPublishedAt: { lt: new Date(timestamp) },
          },
          {
            likeCount: cursorArticle.likeCount,
            lastPublishedAt: new Date(timestamp),
            id: { lt: id },
          },
        ];
      }
    } else {
      where.OR = [
        { lastPublishedAt: { lt: new Date(timestamp) } },
        {
          lastPublishedAt: new Date(timestamp),
          id: { lt: id },
        },
      ];
    }
  }

  // Sort
  const orderBy: Prisma.ArticleOrderByWithRelationInput[] =
    sort === 'popular'
      ? [{ likeCount: 'desc' }, { lastPublishedAt: 'desc' }, { id: 'desc' }]
      : [{ lastPublishedAt: 'desc' }, { id: 'desc' }];

  // Query
  const articles = await prisma.article.findMany({
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
      likes: viewerId
        ? {
            where: { userId: viewerId },
            select: { userId: true },
          }
        : false,
      saves: viewerId
        ? {
            where: { userId: viewerId },
            select: { userId: true },
          }
        : false,
    },
    orderBy,
    take: limit + 1,
  });

  // Exclude any article without published revision or valid dates (belt-and-suspenders)
  const valid = articles.filter(
    (a) =>
      a.revisions?.length > 0 &&
      a.firstPublishedAt != null &&
      a.lastPublishedAt != null
  );
  const hasMore = valid.length > limit;
  const items = valid.slice(0, limit);

  return {
    items: items.map((article) => mapToFeedItem(article, viewerId)),
    meta: {
      nextCursor: hasMore ? encodeCursor(items[items.length - 1]!) : null,
      hasMore,
    },
  };
}

/**
 * Get following feed (articles from followed users)
 */
export async function getFollowingFeed(
  userId: string,
  params: FollowingFeedParams
): Promise<FeedResponse> {
  const { limit = 20, cursor } = params;

  // Get followed user IDs
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followedId: true },
  });

  const followedIds = following.map((f) => f.followedId);

  if (followedIds.length === 0) {
    return { items: [], meta: { nextCursor: null, hasMore: false } };
  }

  const where: Prisma.ArticleWhereInput = {
    status: ArticleStatus.PUBLISHED,
    authorId: { in: followedIds },
    author: { ban: null },
    revisions: { some: { status: 'REV_PUBLISHED' } },
  };

  if (cursor) {
    const [timestamp, id] = decodeCursor(cursor);
    where.OR = [
      { lastPublishedAt: { lt: new Date(timestamp) } },
      {
        lastPublishedAt: new Date(timestamp),
        id: { lt: id },
      },
    ];
  }

  const articles = await prisma.article.findMany({
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
    orderBy: [{ lastPublishedAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
  });

  const valid = articles.filter(
    (a) =>
      a.revisions?.length > 0 &&
      a.firstPublishedAt != null &&
      a.lastPublishedAt != null
  );
  const hasMore = valid.length > limit;
  const items = valid.slice(0, limit);

  return {
    items: items.map((article) => mapToFeedItem(article, userId)),
    meta: {
      nextCursor: hasMore ? encodeCursor(items[items.length - 1]!) : null,
      hasMore,
    },
  };
}

/**
 * Search users by username or display name
 */
export async function searchUsers(
  query: string,
  limit: number,
  cursor?: string,
  viewerId?: string
): Promise<UserSearchResponse> {
  const cursorDate = cursor ? new Date(cursor) : undefined;

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        {
          profile: {
            displayName: { contains: query, mode: 'insensitive' },
          },
        },
      ],
      ...(cursorDate && {
        createdAt: { lt: cursorDate },
      }),
    },
    include: {
      profile: true,
      ban: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
  });

  const hasMore = users.length > limit;
  const items = users.slice(0, limit);

  // Get viewer's following status
  let viewerFollowing: Set<string> = new Set();
  if (viewerId && items.length > 0) {
    const follows = await prisma.follow.findMany({
      where: {
        followerId: viewerId,
        followedId: { in: items.map((u) => u.id) },
      },
      select: { followedId: true },
    });
    viewerFollowing = new Set(follows.map((f) => f.followedId));
  }

  return {
    items: items.map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.profile?.displayName ?? null,
      avatarUrl: user.profile?.avatarUrl ?? null,
      about: user.profile?.about ?? null,
      isFollowing: viewerFollowing.has(user.id),
      isBanned: user.ban?.isBanned ?? false,
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

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Get category and all its descendants using closure table
 */
async function getCategoryWithDescendants(
  categorySlugOrId: string
): Promise<string[]> {
  const bySlug = { slug: categorySlugOrId };
  const byId = UUID_REGEX.test(categorySlugOrId)
    ? { id: categorySlugOrId }
    : null;
  const category = await prisma.category.findFirst({
    where: {
      OR: byId ? [bySlug, byId] : [bySlug],
    },
  });

  if (!category) {
    return [];
  }

  // Get all descendants using closure table
  const descendants = await prisma.categoryClosure.findMany({
    where: { ancestorId: category.id },
    select: { descendantId: true },
  });

  return descendants.map((d) => d.descendantId);
}

/**
 * Encode cursor for pagination
 */
function encodeCursor(article: { lastPublishedAt: Date | null; id: string }): string {
  const timestamp = article.lastPublishedAt?.toISOString() ?? '';
  return Buffer.from(`${timestamp}|${article.id}`).toString('base64');
}

/**
 * Decode cursor for pagination
 */
function decodeCursor(cursor: string): [string, string] {
  const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
  const [timestamp, id] = decoded.split('|');
  return [timestamp ?? '', id ?? ''];
}

