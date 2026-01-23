import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';

import type { UpdateProfileInput, ChangePasswordInput, DeactivateAccountInput } from '@emc3/shared';

import { prisma } from '../lib/prisma.js';
import * as revisionService from '../services/revision.service.js';
import { AppError } from '../utils/errors.js';

// ═══════════════════════════════════════════════════════════
// My Revisions
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/v1/me/revisions
 * Get my revisions/drafts
 */
export async function getMyRevisions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { status, limit, cursor } = req.query as {
      status?: string;
      limit?: string;
      cursor?: string;
    };

    const result = await revisionService.getMyRevisions(userId, {
      status,
      limit: Number(limit) || 20,
      cursor,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}

// ═══════════════════════════════════════════════════════════
// My Profile
// ═══════════════════════════════════════════════════════════

/**
 * PATCH /api/v1/me/profile
 * Update current user's profile (displayName, about, avatarUrl)
 */
export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const body = req.body as UpdateProfileInput;

    const data: {
      displayName?: string | null;
      about?: string | null;
      avatarUrl?: string | null;
      socialLinks?: Record<string, string> | null;
    } = {};
    if (body.displayName !== undefined) data.displayName = body.displayName;
    if (body.about !== undefined) data.about = body.about;
    if (body.avatarUrl !== undefined) data.avatarUrl = body.avatarUrl;
    if (body.socialLinks !== undefined) {
      // Filter out empty strings and keep only valid URLs
      const cleanedLinks: Record<string, string> = {};
      if (body.socialLinks) {
        for (const [key, value] of Object.entries(body.socialLinks)) {
          if (value && value.trim() !== '') {
            cleanedLinks[key] = value.trim();
          }
        }
      }
      data.socialLinks = Object.keys(cleanedLinks).length > 0 ? cleanedLinks : {};
    }

    await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: data.displayName ?? null,
        about: data.about ?? null,
        avatarUrl: data.avatarUrl ?? null,
        socialLinks: data.socialLinks ?? {},
      },
      update: data,
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        roles: { select: { role: true } },
        ban: true,
      },
    });

    if (!user) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified,
        roles: user.roles.map((r) => r.role),
        isBanned: user.ban?.isBanned ?? false,
        banReason: user.ban?.reason ?? null,
        profile: {
          displayName: user.profile?.displayName ?? null,
          about: user.profile?.about ?? null,
          avatarUrl: user.profile?.avatarUrl ?? null,
          socialLinks: (user.profile?.socialLinks as Record<string, string>) ?? {},
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/me/change-password
 * Change current user's password
 */
export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body as ChangePasswordInput;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      throw AppError.badRequest('Bu hesap için şifre değiştirme mevcut değil');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw AppError.unauthorized('Mevcut şifre hatalı');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    res.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/me/deactivate
 * Deactivate (freeze) current user's account
 */
export async function deactivateAccount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { password } = req.body as DeactivateAccountInput;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      throw AppError.badRequest('Bu hesap için şifre doğrulama mevcut değil');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw AppError.unauthorized('Şifre hatalı');
    }

    // Soft delete: Set a flag or remove password to prevent login
    // For now, we'll just remove the password hash (user can't login)
    // In a real system, you might want a separate `isDeactivated` field
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: null },
    });

    res.json({ message: 'Hesabınız donduruldu. Giriş yapamazsınız.' });
  } catch (error) {
    next(error);
  }
}

