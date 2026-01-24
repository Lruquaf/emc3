import { prisma } from '../lib/prisma.js';
import { auditService } from './audit.service.js';
import {
  AUDIT_ACTIONS,
  type AppealDTO,
  type AppealSummaryDTO,
  type AppealListResponse,
  type AppealListQuery,
  type AppealMessageDTO,
  type MyAppealDTO,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// ERROR CLASSES
// ═══════════════════════════════════════════════════════════

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

// ═══════════════════════════════════════════════════════════
// USER APPEAL METHODS
// ═══════════════════════════════════════════════════════════

/**
 * Get user's own appeal (banned user only)
 */
export async function getMyAppeal(userId: string): Promise<MyAppealDTO | null> {
  const appeal = await prisma.appeal.findFirst({
    where: { userId, status: 'OPEN' },
    include: {
      messages: {
        include: {
          sender: {
            include: {
              profile: true,
              roles: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!appeal) {
    return null;
  }

  // Get ban info
  const ban = await prisma.userBan.findUnique({
    where: { userId },
  });

  return {
    id: appeal.id,
    status: appeal.status,
    resolution: appeal.resolution as 'upheld' | 'overturned' | null,
    messages: appeal.messages.map(mapToMessageDTO),
    banReason: ban?.reason ?? null,
    bannedAt: ban?.bannedAt?.toISOString() ?? null,
    createdAt: appeal.createdAt.toISOString(),
  };
}

/**
 * Create new appeal (banned user only)
 */
export async function createAppeal(
  userId: string,
  message: string
): Promise<MyAppealDTO> {
  // Check for existing open appeal
  const existingAppeal = await prisma.appeal.findFirst({
    where: { userId, status: 'OPEN' },
  });

  if (existingAppeal) {
    throw new ConflictError('You already have an open appeal');
  }

  // Create appeal with initial message
  const appeal = await prisma.appeal.create({
    data: {
      userId,
      status: 'OPEN',
      messages: {
        create: {
          senderId: userId,
          body: message,
        },
      },
    },
    include: {
      messages: {
        include: {
          sender: {
            include: {
              profile: true,
              roles: true,
            },
          },
        },
      },
    },
  });

  // Get ban info
  const ban = await prisma.userBan.findUnique({
    where: { userId },
  });

  // Get user info for audit log
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true },
  });

  // Audit log
  await auditService.log({
    actorId: userId,
    action: AUDIT_ACTIONS.APPEAL_OPENED,
    targetType: 'appeal',
    targetId: appeal.id,
    meta: {
      userId: user?.id,
      username: user?.username,
    },
  });

  return {
    id: appeal.id,
    status: appeal.status,
    resolution: appeal.resolution as 'upheld' | 'overturned' | null,
    messages: appeal.messages.map(mapToMessageDTO),
    banReason: ban?.reason ?? null,
    bannedAt: ban?.bannedAt?.toISOString() ?? null,
    createdAt: appeal.createdAt.toISOString(),
  };
}

/**
 * Verify appeal ownership
 */
export async function verifyOwnership(
  appealId: string,
  userId: string
): Promise<void> {
  const appeal = await prisma.appeal.findUnique({
    where: { id: appealId },
  });

  if (!appeal) {
    throw new NotFoundError('Appeal not found');
  }

  if (appeal.userId !== userId) {
    throw new ForbiddenError('Not your appeal');
  }

  if (appeal.status === 'CLOSED') {
    throw new ForbiddenError('Appeal is closed');
  }
}

/**
 * Send message to appeal
 */
export async function sendMessage(
  appealId: string,
  senderId: string,
  message: string,
  isAdmin: boolean
): Promise<AppealMessageDTO> {
  const appeal = await prisma.appeal.findUnique({
    where: { id: appealId },
  });

  if (!appeal) {
    throw new NotFoundError('Appeal not found');
  }

  if (appeal.status === 'CLOSED') {
    throw new ForbiddenError('Appeal is closed');
  }

  // Create message
  const msg = await prisma.appealMessage.create({
    data: {
      appealId,
      senderId,
      body: message,
    },
    include: {
      sender: {
        include: {
          profile: true,
          roles: true,
        },
      },
    },
  });

  // Update appeal timestamp
  await prisma.appeal.update({
    where: { id: appealId },
    data: { updatedAt: new Date() },
  });

  // Get user info for audit log
  const user = await prisma.user.findUnique({
    where: { id: senderId },
    select: { id: true, username: true },
  });

  // Audit log
  await auditService.log({
    actorId: senderId,
    action: AUDIT_ACTIONS.APPEAL_MESSAGE,
    targetType: 'appeal',
    targetId: appealId,
    meta: {
      isAdmin,
      userId: user?.id,
      username: user?.username,
    },
  });

  return mapToMessageDTO(msg);
}

// ═══════════════════════════════════════════════════════════
// ADMIN APPEAL METHODS
// ═══════════════════════════════════════════════════════════

/**
 * List appeals (admin)
 */
export async function listAppeals(
  params: AppealListQuery
): Promise<AppealListResponse> {
  const { status, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where = status ? { status } : {};

  const [appeals, total] = await Promise.all([
    prisma.appeal.findMany({
      where,
      include: {
        user: {
          include: { profile: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.appeal.count({ where }),
  ]);

  return {
    items: appeals.map(
      (appeal): AppealSummaryDTO => ({
        id: appeal.id,
        user: {
          id: appeal.user.id,
          username: appeal.user.username,
          displayName: appeal.user.profile?.displayName ?? null,
        },
        status: appeal.status,
        lastMessage: appeal.messages[0]?.body ?? null,
        messageCount: appeal._count.messages,
        createdAt: appeal.createdAt.toISOString(),
        updatedAt: appeal.updatedAt.toISOString(),
      })
    ),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get appeal detail (admin)
 */
export async function getAppealDetail(appealId: string): Promise<AppealDTO> {
  const appeal = await prisma.appeal.findUnique({
    where: { id: appealId },
    include: {
      user: {
        include: {
          profile: true,
          ban: true,
        },
      },
      messages: {
        include: {
          sender: {
            include: {
              profile: true,
              roles: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!appeal) {
    throw new NotFoundError('Appeal not found');
  }

  return {
    id: appeal.id,
    user: {
      id: appeal.user.id,
      username: appeal.user.username,
      displayName: appeal.user.profile?.displayName ?? null,
      email: appeal.user.email,
      banReason: appeal.user.ban?.reason ?? null,
      bannedAt: appeal.user.ban?.bannedAt?.toISOString() ?? null,
    },
    status: appeal.status,
    messages: appeal.messages.map(mapToMessageDTO),
    createdAt: appeal.createdAt.toISOString(),
    updatedAt: appeal.updatedAt.toISOString(),
  };
}

/**
 * Close appeal (admin)
 */
export async function closeAppeal(
  appealId: string,
  actorId: string,
  resolution?: 'upheld' | 'overturned',
  message?: string
): Promise<void> {
  const appeal = await prisma.appeal.findUnique({
    where: { id: appealId },
  });

  if (!appeal) {
    throw new NotFoundError('Appeal not found');
  }

  if (appeal.status === 'CLOSED') {
    throw new ConflictError('Appeal is already closed');
  }

  // Add closing message if provided
  if (message) {
    await prisma.appealMessage.create({
      data: {
        appealId,
        senderId: actorId,
        body: message,
      },
    });
  }

  // Close appeal
  await prisma.appeal.update({
    where: { id: appealId },
    data: { status: 'CLOSED' },
  });

  // Get user info for audit log
  const user = await prisma.user.findUnique({
    where: { id: appeal.userId },
    select: { id: true, username: true },
  });

  // If resolution is 'overturned', unban user
  if (resolution === 'overturned') {
    await prisma.userBan.update({
      where: { userId: appeal.userId },
      data: {
        isBanned: false,
        unbannedById: actorId,
        unbannedAt: new Date(),
      },
    });

    await auditService.log({
      actorId,
      action: AUDIT_ACTIONS.USER_UNBANNED,
      targetType: 'user',
      targetId: appeal.userId,
      reason: 'Appeal overturned',
      meta: {
        targetUsername: user?.username,
      },
    });
  }

  // Audit log
  await auditService.log({
    actorId,
    action: AUDIT_ACTIONS.APPEAL_CLOSED,
    targetType: 'appeal',
    targetId: appealId,
    meta: {
      resolution,
      userId: user?.id,
      username: user?.username,
    },
  });
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function mapToMessageDTO(msg: {
  id: string;
  body: string;
  createdAt: Date;
  sender: {
    id: string;
    username: string;
    profile: { displayName: string | null } | null;
    roles: { role: string }[];
  } | null;
}): AppealMessageDTO {
  const isAdmin =
    msg.sender?.roles?.some(
      (r) => r.role === 'ADMIN' || r.role === 'REVIEWER'
    ) ?? false;

  return {
    id: msg.id,
    sender: msg.sender
      ? {
          id: msg.sender.id,
          username: msg.sender.username,
          displayName: msg.sender.profile?.displayName ?? null,
          isAdmin,
        }
      : null,
    body: msg.body,
    createdAt: msg.createdAt.toISOString(),
  };
}
