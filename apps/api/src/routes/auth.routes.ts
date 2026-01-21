import { Router } from 'express';

import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { rateLimit } from '../middlewares/rateLimit.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
} from '@emc3/shared';

export const authRouter = Router();

// ═══════════════════════════════════════════════════════════
// Public Routes
// ═══════════════════════════════════════════════════════════

// Register
authRouter.post(
  '/register',
  rateLimit('register'),
  validate(registerSchema),
  authController.register
);

// Email verification
authRouter.post(
  '/verify-email',
  validate(verifyEmailSchema),
  authController.verifyEmail
);

// Resend verification email
authRouter.post(
  '/resend-verification',
  rateLimit('register'),
  validate(resendVerificationSchema),
  authController.resendVerification
);

// Login
authRouter.post(
  '/login',
  rateLimit('login'),
  validate(loginSchema),
  authController.login
);

// Forgot password
authRouter.post(
  '/forgot-password',
  rateLimit('register'), // Same limit as register
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

// Reset password
authRouter.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword
);

// ═══════════════════════════════════════════════════════════
// Token Routes
// ═══════════════════════════════════════════════════════════

// Refresh tokens
authRouter.post('/refresh', authController.refresh);

// Logout
authRouter.post('/logout', authController.logout);

// ═══════════════════════════════════════════════════════════
// Google OAuth Routes
// ═══════════════════════════════════════════════════════════

// Start OAuth flow
authRouter.get('/google/start', authController.googleStart);

// OAuth callback
authRouter.get('/google/callback', authController.googleCallback);

// ═══════════════════════════════════════════════════════════
// Protected Routes
// ═══════════════════════════════════════════════════════════

// Get current user
authRouter.get('/me', requireAuth, authController.getMe);

