import type {
  FollowToggleResponse,
  FollowListResponse,
  UserSummaryDTO,
  UserProfileDTO,
} from "@emc3/shared";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";

// ═══════════════════════════════════════════════════════════
// Follow Service
// ═══════════════════════════════════════════════════════════

/**
 * Follow a user
 */
export async function followUser(
  followerId: string,
  followedId: string,
): Promise<FollowToggleResponse> {
  // Cannot follow self
  if (followerId === followedId) {
    throw AppError.conflict("Cannot follow yourself");
  }

  // Check target user exists and is not banned
  const targetUser = await prisma.user.findUnique({
    where: { id: followedId },
    include: { ban: true },
  });

  if (!targetUser) {
    throw AppError.notFound("User not found");
  }

  if (targetUser.ban?.isBanned) {
    throw AppError.forbidden("Cannot follow banned user");
  }

  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followedId: { followerId, followedId },
    },
  });

  if (existingFollow) {
    // Already following
    const followerCount = await getFollowerCount(followedId);
    return { following: true, followerCount };
  }

  // Create follow
  await prisma.follow.create({
    data: { followerId, followedId },
  });

  const followerCount = await getFollowerCount(followedId);
  return { following: true, followerCount };
}

/**
 * Unfollow a user
 */
export async function unfollowUser(
  followerId: string,
  followedId: string,
): Promise<FollowToggleResponse> {
  // Check if following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followedId: { followerId, followedId },
    },
  });

  if (!existingFollow) {
    // Not following
    const followerCount = await getFollowerCount(followedId);
    return { following: false, followerCount };
  }

  // Delete follow
  await prisma.follow.delete({
    where: {
      followerId_followedId: { followerId, followedId },
    },
  });

  const followerCount = await getFollowerCount(followedId);
  return { following: false, followerCount };
}

/**
 * Get user's followers
 */
export async function getFollowers(
  username: string,
  limit: number,
  cursor?: string,
  viewerId?: string,
): Promise<FollowListResponse> {
  const user = await getUserByUsername(username);

  // Don't show followers for banned users
  if (user.ban?.isBanned) {
    return { items: [], meta: { nextCursor: null, hasMore: false } };
  }

  const cursorDate = cursor ? new Date(cursor) : undefined;

  const follows = await prisma.follow.findMany({
    where: {
      followedId: user.id,
      ...(cursorDate && {
        createdAt: { lt: cursorDate },
      }),
    },
    include: {
      follower: {
        include: {
          profile: true,
          ban: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
  });

  const hasMore = follows.length > limit;
  const items = follows.slice(0, limit);

  // Get viewer's following status for each user
  let viewerFollowing: Set<string> = new Set();
  if (viewerId && items.length > 0) {
    const viewerFollows = await prisma.follow.findMany({
      where: {
        followerId: viewerId,
        followedId: { in: items.map((f) => f.follower.id) },
      },
      select: { followedId: true },
    });
    viewerFollowing = new Set(viewerFollows.map((f) => f.followedId));
  }

  return {
    items: items.map((follow) =>
      mapToUserSummary(follow.follower, viewerFollowing),
    ),
    meta: {
      nextCursor: hasMore
        ? items[items.length - 1]!.createdAt.toISOString()
        : null,
      hasMore,
    },
  };
}

/**
 * Get users that a user is following
 */
export async function getFollowing(
  username: string,
  limit: number,
  cursor?: string,
  viewerId?: string,
): Promise<FollowListResponse> {
  const user = await getUserByUsername(username);

  // Don't show following for banned users
  if (user.ban?.isBanned) {
    return { items: [], meta: { nextCursor: null, hasMore: false } };
  }

  const cursorDate = cursor ? new Date(cursor) : undefined;

  const follows = await prisma.follow.findMany({
    where: {
      followerId: user.id,
      ...(cursorDate && {
        createdAt: { lt: cursorDate },
      }),
    },
    include: {
      followed: {
        include: {
          profile: true,
          ban: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
  });

  const hasMore = follows.length > limit;
  const items = follows.slice(0, limit);

  // Get viewer's following status
  let viewerFollowing: Set<string> = new Set();
  if (viewerId && items.length > 0) {
    const viewerFollows = await prisma.follow.findMany({
      where: {
        followerId: viewerId,
        followedId: { in: items.map((f) => f.followed.id) },
      },
      select: { followedId: true },
    });
    viewerFollowing = new Set(viewerFollows.map((f) => f.followedId));
  }

  return {
    items: items.map((follow) =>
      mapToUserSummary(follow.followed, viewerFollowing),
    ),
    meta: {
      nextCursor: hasMore
        ? items[items.length - 1]!.createdAt.toISOString()
        : null,
      hasMore,
    },
  };
}

/**
 * Check if user is following another user
 */
export async function isFollowing(
  followerId: string,
  followedId: string,
): Promise<boolean> {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followedId: { followerId, followedId },
    },
  });
  return !!follow;
}

/**
 * Get user profile by username (for profile page)
 */
export async function getUserProfile(
  username: string,
  viewerId?: string,
): Promise<UserProfileDTO> {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      profile: true,
      ban: true,
    },
  });

  if (!user) {
    throw AppError.notFound("User not found");
  }

  const [articleCount, followerCount, followingCount, isFollowingResult] =
    await Promise.all([
      prisma.article.count({
        where: {
          authorId: user.id,
          status: "PUBLISHED",
          revisions: { some: { status: "REV_PUBLISHED" } },
        },
      }),
      getFollowerCount(user.id),
      prisma.follow.count({
        where: { followerId: user.id },
      }),
      viewerId ? isFollowing(viewerId, user.id) : Promise.resolve(false),
    ]);

  const socialLinks =
    (user.profile?.socialLinks as Record<string, string>) ?? {};

  return {
    id: user.id,
    username: user.username,
    profile: {
      displayName: user.profile?.displayName ?? null,
      about: user.profile?.about ?? null,
      avatarUrl: user.profile?.avatarUrl ?? null,
      socialLinks,
    },
    stats: {
      articleCount,
      followerCount,
      followingCount,
    },
    isFollowing: isFollowingResult,
    isBanned: user.ban?.isBanned ?? false,
    isDeleted: user.isDeleted,
    createdAt: user.createdAt.toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

async function getUserByUsername(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      ban: true,
      profile: {
        select: {
          displayName: true,
          avatarUrl: true,
          about: true,
        },
      },
    },
  });

  if (!user) {
    throw AppError.notFound("User not found");
  }

  return user;
}

async function getFollowerCount(userId: string): Promise<number> {
  return prisma.follow.count({
    where: { followedId: userId },
  });
}

interface UserWithProfile {
  id: string;
  username: string;
  isDeleted: boolean;
  profile: {
    displayName: string | null;
    avatarUrl: string | null;
    about: string | null;
  } | null;
  ban: { isBanned: boolean } | null;
}

function mapToUserSummary(
  user: UserWithProfile,
  viewerFollowing: Set<string>,
): UserSummaryDTO {
  return {
    id: user.id,
    username: user.username,
    displayName: user.profile?.displayName ?? null,
    avatarUrl: user.profile?.avatarUrl ?? null,
    about: user.profile?.about ?? null,
    isFollowing: viewerFollowing.has(user.id),
    isBanned: user.ban?.isBanned ?? false,
    isDeleted: user.isDeleted,
  };
}
