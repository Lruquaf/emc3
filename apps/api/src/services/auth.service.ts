import { User, UserRole, UserProfile, UserBan } from '@prisma/client';

import { prisma } from '../lib/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { hashToken, generateUrlSafeToken } from '../utils/crypto.js';
import { generateTokenPair, verifyToken, TokenPair, TokenPayload } from '../lib/jwt.js';
import { EmailService } from './email.service.js';
import { AppError } from '../utils/errors.js';
import { env } from '../config/env.js';

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface UserWithRelations extends User {
  profile: UserProfile | null;
  roles: UserRole[];
  ban: UserBan | null;
}

interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

interface GoogleProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

// ═══════════════════════════════════════════════════════════
// Service Class
// ═══════════════════════════════════════════════════════════

export class AuthService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  // ─────────────────────────────────────────────────────────
  // Register
  // ─────────────────────────────────────────────────────────

  async register(input: RegisterInput): Promise<User> {
    const { email, username, password } = input;

    // Check for existing email
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingEmail) {
      throw AppError.conflict('Email already registered', { field: 'email' });
    }

    // Check for existing username
    const existingUsername = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });
    if (existingUsername) {
      throw AppError.conflict('Username already taken', { field: 'username' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        passwordHash,
        emailVerified: false,
        profile: {
          create: {
            displayName: username,
          },
        },
      },
    });

    // Create and send verification token
    await this.createAndSendVerificationEmail(user.id, email);

    return user;
  }

  // ─────────────────────────────────────────────────────────
  // Email Verification
  // ─────────────────────────────────────────────────────────

  async createAndSendVerificationEmail(
    userId: string,
    email: string
  ): Promise<void> {
    const token = generateUrlSafeToken(32);
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    await this.emailService.sendVerificationEmail(email, token);
  }

  async verifyEmail(token: string): Promise<void> {
    const tokenHash = hashToken(token);

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
    });

    if (!verificationToken) {
      throw AppError.badRequest('Invalid verification token');
    }

    if (verificationToken.usedAt) {
      throw AppError.badRequest('Token has already been used');
    }

    if (new Date() > verificationToken.expiresAt) {
      throw AppError.badRequest('Verification token has expired');
    }

    // Transaction: mark token as used and verify user
    await prisma.$transaction([
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true },
      }),
    ]);
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.emailVerified) {
      return; // Silently fail to prevent enumeration
    }

    // Invalidate existing tokens
    await prisma.emailVerificationToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(), // Mark as used to invalidate
      },
    });

    await this.createAndSendVerificationEmail(user.id, user.email);
  }

  // ─────────────────────────────────────────────────────────
  // Login
  // ─────────────────────────────────────────────────────────

  async login(
    email: string,
    password: string
  ): Promise<{ user: UserWithRelations; tokens: TokenPair }> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        profile: true,
        roles: true,
        ban: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const tokens = this.generateUserTokens(user);

    return { user, tokens };
  }

  // ─────────────────────────────────────────────────────────
  // Password Reset
  // ─────────────────────────────────────────────────────────

  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return; // Silently fail to prevent enumeration
    }

    const token = generateUrlSafeToken(32);
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await this.emailService.sendPasswordResetEmail(email, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken) {
      throw AppError.badRequest('Invalid reset token');
    }

    if (resetToken.usedAt) {
      throw AppError.badRequest('Token has already been used');
    }

    if (new Date() > resetToken.expiresAt) {
      throw AppError.badRequest('Reset token has expired');
    }

    const passwordHash = await hashPassword(newPassword);

    // Transaction: mark token as used and update password
    await prisma.$transaction([
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
    ]);
  }

  // ─────────────────────────────────────────────────────────
  // Token Refresh
  // ─────────────────────────────────────────────────────────

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = verifyToken(refreshToken);

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const user = await this.getUserWithRelationsById(payload.sub);

      if (!user) {
        throw new Error('User not found');
      }

      return this.generateUserTokens(user);
    } catch {
      throw AppError.unauthorized('Invalid refresh token');
    }
  }

  // ─────────────────────────────────────────────────────────
  // Google OAuth
  // ─────────────────────────────────────────────────────────

  async googleAuth(
    code: string
  ): Promise<{ user: UserWithRelations; tokens: TokenPair; isNewUser: boolean }> {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID!,
        client_secret: env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: env.GOOGLE_CALLBACK_URL!,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw AppError.badRequest('Failed to exchange authorization code');
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string };

    // Get user info from Google
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    if (!userInfoResponse.ok) {
      throw AppError.badRequest('Failed to get user info from Google');
    }

    const googleProfile = (await userInfoResponse.json()) as GoogleProfile;

    // Find or create user
    const oauthAccount = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerSubject: {
          provider: 'google',
          providerSubject: googleProfile.sub,
        },
      },
      include: {
        user: {
          include: {
            profile: true,
            roles: true,
            ban: true,
          },
        },
      },
    });

    let user: UserWithRelations;
    let isNewUser = false;

    if (oauthAccount) {
      user = oauthAccount.user;
    } else {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: googleProfile.email.toLowerCase() },
        include: {
          profile: true,
          roles: true,
          ban: true,
        },
      });

      if (existingUser) {
        // Link OAuth account to existing user
        await prisma.oAuthAccount.create({
          data: {
            userId: existingUser.id,
            provider: 'google',
            providerSubject: googleProfile.sub,
            email: googleProfile.email,
          },
        });

        // Update email verification if Google verified
        if (googleProfile.email_verified && !existingUser.emailVerified) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { emailVerified: true },
          });
          existingUser.emailVerified = true;
        }

        user = existingUser;
      } else {
        // Create new user
        const username = await this.generateUniqueUsername(googleProfile.email);

        const newUser = await prisma.user.create({
          data: {
            email: googleProfile.email.toLowerCase(),
            username,
            emailVerified: googleProfile.email_verified,
            profile: {
              create: {
                displayName: googleProfile.name || username,
                avatarUrl: googleProfile.picture,
              },
            },
            oauthAccounts: {
              create: {
                provider: 'google',
                providerSubject: googleProfile.sub,
                email: googleProfile.email,
              },
            },
          },
          include: {
            profile: true,
            roles: true,
            ban: true,
          },
        });

        user = newUser;
        isNewUser = true;
      }
    }

    const tokens = this.generateUserTokens(user);

    return { user, tokens, isNewUser };
  }

  // ─────────────────────────────────────────────────────────
  // Helper Methods
  // ─────────────────────────────────────────────────────────

  async getUserById(id: string): Promise<UserWithRelations | null> {
    return this.getUserWithRelationsById(id);
  }

  private async getUserWithRelationsById(
    id: string
  ): Promise<UserWithRelations | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        roles: true,
        ban: true,
      },
    });
  }

  private generateUserTokens(user: UserWithRelations): TokenPair {
    const payload: Omit<TokenPayload, 'type'> = {
      sub: user.id,
      email: user.email,
      username: user.username,
      emailVerified: user.emailVerified,
      roles: user.roles.map((r) => r.role),
      isBanned: user.ban?.isBanned ?? false,
    };

    return generateTokenPair(payload);
  }

  private async generateUniqueUsername(email: string): Promise<string> {
    const baseUsername = email
      .split('@')[0]!
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 20);

    let username = baseUsername;
    let suffix = 0;

    while (true) {
      const existing = await prisma.user.findUnique({
        where: { username },
      });

      if (!existing) {
        return username;
      }

      suffix++;
      username = `${baseUsername}${suffix}`;
    }
  }
}

