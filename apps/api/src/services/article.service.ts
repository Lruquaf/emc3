import type {
  ArticleReadDTO,
  CreateArticleInput,
  CreateArticleResponse,
  CreateRevisionResponse,
  RevisionHistoryItemDTO,
  RevisionStatus,
} from '@emc3/shared';

import { prisma } from '../lib/prisma.js';
import { generateUniqueSlug } from './slug.service.js';
import { AppError } from '../utils/errors.js';

// ═══════════════════════════════════════════════════════════
// Article Service
// ═══════════════════════════════════════════════════════════

/**
 * Create a new article with initial draft revision
 */
export async function createArticle(
  authorId: string,
  input: CreateArticleInput
): Promise<CreateArticleResponse> {
  const { title, summary, contentMarkdown, bibliography, categoryIds } = input;

  // Validate categories exist
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
  });

  if (categories.length !== categoryIds.length) {
    throw AppError.badRequest('One or more categories not found');
  }

  // Generate unique slug
  const slug = await generateUniqueSlug(title);

  // Create article with initial revision in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create article
    const article = await tx.article.create({
      data: {
        slug,
        authorId,
        status: 'PUBLISHED', // Default, will show when has published revision
      },
    });

    // Create initial draft revision
    const revision = await tx.revision.create({
      data: {
        articleId: article.id,
        title,
        summary: summary || '',
        contentMarkdown,
        bibliography: bibliography || null,
        status: 'REV_DRAFT',
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    });

    return { article, revision };
  });

  return {
    articleId: result.article.id,
    slug: result.article.slug,
    revisionId: result.revision.id,
    status: 'REV_DRAFT',
  };
}

/**
 * Get article by slug (public read)
 */
export async function getArticleBySlug(
  slug: string,
  viewerId?: string
): Promise<ArticleReadDTO> {
  const article = await prisma.article.findUnique({
    where: { slug },
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
        include: {
          categories: {
            include: {
              category: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      },
    },
  });

  if (!article) {
    throw AppError.notFound('Article not found');
  }

  // Check if article is removed
  if (article.status === 'REMOVED') {
    throw AppError.contentRestricted('This article has been removed');
  }

  // Check if author is banned
  if (article.author.ban?.isBanned) {
    throw AppError.contentRestricted('Content from this author is restricted');
  }

  // Get published revision
  const publishedRevision = article.revisions[0];
  if (!publishedRevision) {
    throw AppError.notFound('Article has no published content');
  }

  // Check for pending update
  const hasPendingUpdate = await checkHasPendingUpdate(article.id);

  // Get viewer interaction if logged in
  let viewerInteraction: { hasLiked: boolean; hasSaved: boolean } | undefined;
  if (viewerId) {
    const [like, save] = await Promise.all([
      prisma.articleLike.findUnique({
        where: {
          userId_articleId: { userId: viewerId, articleId: article.id },
        },
      }),
      prisma.articleSave.findUnique({
        where: {
          userId_articleId: { userId: viewerId, articleId: article.id },
        },
      }),
    ]);
    viewerInteraction = {
      hasLiked: !!like,
      hasSaved: !!save,
    };
  }

  return {
    article: {
      id: article.id,
      slug: article.slug,
      author: {
        id: article.author.id,
        username: article.author.username,
        displayName: article.author.profile?.displayName ?? null,
        avatarUrl: article.author.profile?.avatarUrl ?? null,
        isBanned: article.author.ban?.isBanned ?? false,
      },
      title: publishedRevision.title,
      summary: publishedRevision.summary,
      categories: publishedRevision.categories.map((rc) => ({
        id: rc.category.id,
        name: rc.category.name,
        slug: rc.category.slug,
      })),
      counts: {
        likes: article.likeCount,
        saves: article.saveCount,
        views: Number(article.viewCount),
      },
      firstPublishedAt: article.firstPublishedAt?.toISOString() ?? null,
      lastPublishedAt: article.lastPublishedAt?.toISOString() ?? null,
      isUpdated:
        article.firstPublishedAt?.getTime() !==
        article.lastPublishedAt?.getTime(),
      hasPendingUpdate,
    },
    content: {
      revisionId: publishedRevision.id,
      contentMarkdown: publishedRevision.contentMarkdown,
      bibliography: publishedRevision.bibliography,
    },
    viewerInteraction,
  };
}

/**
 * Create a new revision for an existing article (start edit)
 */
export async function createNewRevision(
  articleId: string,
  authorId: string
): Promise<CreateRevisionResponse> {
  // Get article and verify ownership
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      revisions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          categories: true,
        },
      },
    },
  });

  if (!article) {
    throw AppError.notFound('Article not found');
  }

  if (article.authorId !== authorId) {
    throw AppError.forbidden('You can only edit your own articles');
  }

  // Check if there's already a draft or pending revision
  const existingDraft = await prisma.revision.findFirst({
    where: {
      articleId,
      status: {
        in: ['REV_DRAFT', 'REV_IN_REVIEW', 'REV_CHANGES_REQUESTED', 'REV_APPROVED'],
      },
    },
  });

  if (existingDraft) {
    throw AppError.conflict(
      'This article already has a pending revision. Please complete or delete it first.',
      { existingRevisionId: existingDraft.id }
    );
  }

  // Get the latest revision to clone from
  const latestRevision = article.revisions[0];
  if (!latestRevision) {
    throw AppError.badRequest('Article has no revisions to clone from');
  }

  // Create new draft revision
  const newRevision = await prisma.revision.create({
    data: {
      articleId,
      title: latestRevision.title,
      summary: latestRevision.summary,
      contentMarkdown: latestRevision.contentMarkdown,
      bibliography: latestRevision.bibliography,
      status: 'REV_DRAFT',
      categories: {
        create: latestRevision.categories.map((c) => ({
          categoryId: c.categoryId,
        })),
      },
    },
  });

  return {
    revisionId: newRevision.id,
    status: 'REV_DRAFT',
  };
}

/**
 * Get revision history for an article
 */
export async function getRevisionHistory(
  articleId: string,
  requesterId: string,
  requesterRoles: string[]
): Promise<RevisionHistoryItemDTO[]> {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { authorId: true, publishedRevisionId: true },
  });

  if (!article) {
    throw AppError.notFound('Article not found');
  }

  // Only author or reviewer/admin can see revision history
  const isAuthor = article.authorId === requesterId;
  const isReviewer = requesterRoles.includes('REVIEWER') || requesterRoles.includes('ADMIN');

  if (!isAuthor && !isReviewer) {
    throw AppError.forbidden('Access denied');
  }

  const revisions = await prisma.revision.findMany({
    where: { articleId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return revisions.map((rev) => ({
    id: rev.id,
    status: rev.status as RevisionStatus,
    title: rev.title,
    isPublished: rev.id === article.publishedRevisionId,
    createdAt: rev.createdAt.toISOString(),
    publishedAt: rev.id === article.publishedRevisionId ? rev.updatedAt.toISOString() : null,
  }));
}

/**
 * Get article by ID (for internal use)
 */
export async function getArticleById(articleId: string) {
  return prisma.article.findUnique({
    where: { id: articleId },
    include: {
      author: {
        select: { id: true, username: true },
      },
    },
  });
}

// ═══════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════

/**
 * Check if article has a pending update
 */
async function checkHasPendingUpdate(articleId: string): Promise<boolean> {
  const pendingRevision = await prisma.revision.findFirst({
    where: {
      articleId,
      status: { in: ['REV_IN_REVIEW', 'REV_APPROVED'] },
    },
  });
  return !!pendingRevision;
}

