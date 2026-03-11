import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

import type {
  UpdateProfileInput,
  ChangePasswordInput,
  DeleteAccountInput,
} from "@emc3/shared";

import { prisma } from "../lib/prisma.js";
import * as revisionService from "../services/revision.service.js";
import * as cloudinaryService from "../services/cloudinary.service.js";
import { AppError } from "../utils/errors.js";

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
  next: NextFunction,
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
 * POST /api/v1/me/avatar
 * Upload avatar image through the server – file goes to Cloudinary server-side.
 */
export async function uploadAvatar(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!cloudinaryService.isCloudinaryConfigured()) {
      throw AppError.badRequest("Avatar yükleme yapılandırılmamış");
    }

    const userId = req.user!.id;
    const file = (req as Request & { file?: Express.Multer.File }).file;

    if (!file) {
      throw AppError.badRequest("Resim dosyası gereklidir", { field: "avatar" });
    }

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      throw AppError.badRequest(
        "Sadece JPG, PNG veya WebP formatında resim yükleyebilirsiniz.",
        { field: "avatar" },
      );
    }

    const currentProfile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { avatarUrl: true },
    });

    const newAvatarUrl = await cloudinaryService.uploadAvatar(userId, file.buffer);

    await prisma.userProfile.upsert({
      where: { userId },
      create: { userId, avatarUrl: newAvatarUrl },
      update: { avatarUrl: newAvatarUrl },
    });

    // Best-effort deletion of old avatar
    if (currentProfile?.avatarUrl?.includes("cloudinary.com")) {
      const oldPublicId = cloudinaryService.extractPublicId(currentProfile.avatarUrl);
      if (oldPublicId) {
        cloudinaryService.deleteImage(oldPublicId).catch((err) => {
          console.error("Failed to delete old avatar:", err);
        });
      }
    }

    res.json({ avatarUrl: newAvatarUrl });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/me/avatar
 * Remove avatar: deletes the image from Cloudinary and clears the profile field.
 */
export async function deleteAvatar(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;

    const currentProfile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { avatarUrl: true },
    });

    if (currentProfile?.avatarUrl?.includes("cloudinary.com")) {
      const publicId = cloudinaryService.extractPublicId(currentProfile.avatarUrl);
      if (publicId) {
        cloudinaryService.deleteImage(publicId).catch((err) => {
          console.error("Failed to delete avatar from Cloudinary:", err);
        });
      }
    }

    await prisma.userProfile.upsert({
      where: { userId },
      create: { userId, avatarUrl: null },
      update: { avatarUrl: null },
    });

    res.json({ message: "Avatar kaldırıldı" });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/me/profile
 * Update current user's profile (displayName, about, socialLinks).
 * Avatar is managed exclusively via POST /me/avatar and DELETE /me/avatar.
 */
export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const body = req.body as UpdateProfileInput;

    const data: {
      displayName?: string | null;
      about?: string | null;
      socialLinks?: Record<string, string> | null;
    } = {};
    if (body.displayName !== undefined) data.displayName = body.displayName;
    if (body.about !== undefined) data.about = body.about;
    if (body.socialLinks !== undefined) {
      // Filter out empty strings and keep only valid HTTPS URLs
      const cleanedLinks: Record<string, string> = {};
      if (body.socialLinks) {
        for (const [key, value] of Object.entries(body.socialLinks)) {
          const trimmed = value?.trim();
          if (!trimmed) continue;

          try {
            const url = new URL(trimmed);
            // Yalnızca HTTPS bağlantılarına izin ver
            if (url.protocol !== "https:") {
              continue;
            }
            const hostname = url.hostname.toLowerCase();
            const platform = key.toLowerCase();

            // Platforma özel host kısıtları
            if (
              (platform === "x" || platform === "twitter") &&
              !(
                hostname === "x.com" ||
                hostname.endsWith(".x.com") ||
                hostname === "twitter.com" ||
                hostname.endsWith(".twitter.com")
              )
            ) {
              continue;
            }

            if (
              platform === "instagram" &&
              !(hostname === "instagram.com" || hostname.endsWith(".instagram.com"))
            ) {
              continue;
            }

            if (
              platform === "linkedin" &&
              !(hostname === "linkedin.com" || hostname.endsWith(".linkedin.com"))
            ) {
              continue;
            }

            if (
              platform === "youtube" &&
              !(
                hostname === "youtube.com" ||
                hostname.endsWith(".youtube.com") ||
                hostname === "youtu.be"
              )
            ) {
              continue;
            }

            cleanedLinks[key] = url.toString();
          } catch {
            // Geçersiz URL'leri sessizce atla
            continue;
          }
        }
      }
      data.socialLinks =
        Object.keys(cleanedLinks).length > 0 ? cleanedLinks : {};
    }

    await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: data.displayName ?? null,
        about: data.about ?? null,
        socialLinks: data.socialLinks ?? {},
      },
      update: {
        ...data,
        socialLinks:
          data.socialLinks === null ? Prisma.JsonNull : data.socialLinks,
      },
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
      res.status(404).json({ code: "NOT_FOUND", message: "User not found" });
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
          socialLinks:
            (user.profile?.socialLinks as Record<string, string>) ?? {},
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
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body as ChangePasswordInput;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      throw AppError.badRequest("Bu hesap için şifre değiştirme mevcut değil");
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw AppError.unauthorized("Mevcut şifre hatalı");
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    res.json({ message: "Şifre başarıyla değiştirildi" });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/me/delete-account
 * Delete (soft delete + anonymize) current user's account
 */
export async function deleteAccount(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { password } = req.body as DeleteAccountInput;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw AppError.notFound("Kullanıcı bulunamadı");
    }

    // Check if already deleted
    if (user.isDeleted) {
      throw AppError.badRequest("Hesap zaten silinmiş");
    }

    // Verify password if user has one
    // OAuth users might not have a password
    if (user.passwordHash) {
      if (!password) {
        throw AppError.badRequest("Şifre gerekli");
      }
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        throw AppError.unauthorized("Şifre hatalı");
      }
    }
    // OAuth users without password can delete without password verification

    // Soft delete + anonymize
    const deletedAt = new Date();
    const deletedUserId = `deleted_${userId.slice(0, 8)}`;

    await prisma.$transaction([
      // Anonymize user
      prisma.user.update({
        where: { id: userId },
        data: {
          email: `deleted_${userId}@deleted.local`,
          username: deletedUserId,
          passwordHash: null,
          isDeleted: true,
          deletedAt,
        },
      }),
      // Anonymize profile
      prisma.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          displayName: "Silinmiş Kullanıcı",
          about: null,
          avatarUrl: null,
          socialLinks: {},
        },
        update: {
          displayName: "Silinmiş Kullanıcı",
          about: null,
          avatarUrl: null,
          socialLinks: {},
        },
      }),
    ]);

    res.json({
      message: "Hesabınız silindi. Tüm kişisel bilgileriniz anonimleştirildi.",
    });
  } catch (error) {
    next(error);
  }
}
