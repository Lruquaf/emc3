import { RequestHandler } from 'express';

import { AuthService } from '../services/auth.service.js';
import { setAuthCookies, clearAuthCookies } from '../lib/jwt.js';
import { AppError } from '../utils/errors.js';
import { env } from '../config/env.js';
import { generateUrlSafeToken } from '../utils/crypto.js';

const authService = new AuthService();

// ═══════════════════════════════════════════════════════════
// Register
// ═══════════════════════════════════════════════════════════

export const register: RequestHandler = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    const user = await authService.register({ email, username, password });

    res.status(201).json({
      id: user.id,
      email: user.email,
      username: user.username,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════
// Verify Email
// ═══════════════════════════════════════════════════════════

export const verifyEmail: RequestHandler = async (req, res, next) => {
  try {
    const { token } = req.body;

    await authService.verifyEmail(token);

    res.json({ emailVerified: true });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════
// Resend Verification
// ═══════════════════════════════════════════════════════════

export const resendVerification: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    await authService.resendVerificationEmail(email);

    // Always return 202 to prevent email enumeration
    res.status(202).json({
      message:
        'If the email exists and is not verified, a new verification email will be sent.',
    });
  } catch {
    // Don't expose errors for security
    res.status(202).json({
      message:
        'If the email exists and is not verified, a new verification email will be sent.',
    });
  }
};

// ═══════════════════════════════════════════════════════════
// Login
// ═══════════════════════════════════════════════════════════

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { user, tokens } = await authService.login(email, password);

    setAuthCookies(res, tokens);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified,
        roles: user.roles.map((r) => r.role),
        isBanned: user.ban?.isBanned ?? false,
        banReason: user.ban?.reason ?? null,
        profile: user.profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════
// Forgot Password
// ═══════════════════════════════════════════════════════════

export const forgotPassword: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    await authService.sendPasswordResetEmail(email);

    // Always return 202 to prevent email enumeration
    res.status(202).json({
      message:
        'If an account exists with that email, a password reset link will be sent.',
    });
  } catch {
    // Don't expose errors for security
    res.status(202).json({
      message:
        'If an account exists with that email, a password reset link will be sent.',
    });
  }
};

// ═══════════════════════════════════════════════════════════
// Reset Password
// ═══════════════════════════════════════════════════════════

export const resetPassword: RequestHandler = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    await authService.resetPassword(token, newPassword);

    res.json({ message: 'Password successfully reset.' });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════
// Refresh Token
// ═══════════════════════════════════════════════════════════

export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      throw AppError.unauthorized('No refresh token provided');
    }

    const tokens = await authService.refreshTokens(refreshToken);

    setAuthCookies(res, tokens);

    res.json({ message: 'Tokens refreshed' });
  } catch (error) {
    clearAuthCookies(res);
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════
// Logout
// ═══════════════════════════════════════════════════════════

export const logout: RequestHandler = async (_req, res) => {
  clearAuthCookies(res);
  res.status(204).send();
};

// ═══════════════════════════════════════════════════════════
// Google OAuth
// ═══════════════════════════════════════════════════════════

export const googleStart: RequestHandler = (_req, res) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CALLBACK_URL) {
    res.status(501).json({ message: 'Google OAuth not configured' });
    return;
  }

  const state = generateUrlSafeToken(16);

  // Store state in cookie for verification
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000, // 10 minutes
  });

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope: 'email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};

export const googleCallback: RequestHandler = async (req, res) => {
  try {
    const { code, state } = req.query;
    const storedState = req.cookies.oauth_state;

    // Clear state cookie
    res.clearCookie('oauth_state');

    // Verify state
    if (!state || state !== storedState) {
      throw AppError.badRequest('Invalid OAuth state');
    }

    if (!code || typeof code !== 'string') {
      throw AppError.badRequest('No authorization code provided');
    }

    const { tokens, isNewUser } = await authService.googleAuth(code);

    setAuthCookies(res, tokens);

    // Redirect to frontend with success
    const redirectUrl = new URL(env.FRONTEND_URL);
    redirectUrl.pathname = isNewUser ? '/welcome' : '/';
    res.redirect(redirectUrl.toString());
  } catch {
    // Redirect to frontend with error
    const redirectUrl = new URL(env.FRONTEND_URL);
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('error', 'oauth_failed');
    res.redirect(redirectUrl.toString());
  }
};

// ═══════════════════════════════════════════════════════════
// Get Current User
// ═══════════════════════════════════════════════════════════

export const getMe: RequestHandler = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user!.id);

    if (!user) {
      throw AppError.notFound('User not found');
    }

    res.json({
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
        socialLinks: user.profile?.socialLinks ?? {},
      },
    });
  } catch (error) {
    next(error);
  }
};

