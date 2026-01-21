import crypto from 'crypto';

import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';

// ═══════════════════════════════════════════════════════════
// View Tracking Service
// ═══════════════════════════════════════════════════════════

/**
 * Track a view for an article
 * Uses viewer hash to deduplicate views per day
 * @returns true if this was a new view, false if already counted today
 */
export async function trackView(
  articleId: string,
  viewerId: string | null,
  ip: string,
  userAgent: string
): Promise<boolean> {
  // Generate date string for today (YYYY-MM-DD)
  const today = new Date();
  const viewedOnDate = new Date(today.toISOString().split('T')[0]!);

  // Generate viewer hash
  let viewerHash: string;
  if (viewerId) {
    viewerHash = `user:${viewerId}`;
  } else {
    // For anonymous users, hash IP + userAgent + secret
    const data = `${ip}:${userAgent}:${env.JWT_SECRET}`;
    viewerHash = `anon:${crypto.createHash('sha256').update(data).digest('hex').slice(0, 32)}`;
  }

  try {
    // Try to insert view record
    await prisma.articleView.create({
      data: {
        articleId,
        viewerHash,
        viewedOnDate,
      },
    });

    // Increment view count only if insert succeeded
    await prisma.article.update({
      where: { id: articleId },
      data: {
        viewCount: { increment: 1 },
      },
    });

    return true; // New view counted
  } catch (error: unknown) {
    // Unique constraint violation = duplicate view, ignore
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      return false; // Already viewed today
    }
    throw error;
  }
}

/**
 * Get view count for an article
 */
export async function getViewCount(articleId: string): Promise<number> {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { viewCount: true },
  });
  return Number(article?.viewCount ?? 0);
}

