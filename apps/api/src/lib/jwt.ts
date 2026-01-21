import jwt, { SignOptions } from 'jsonwebtoken';
import { Response, CookieOptions } from 'express';

import { env } from '../config/env.js';

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface TokenPayload {
  sub: string; // User ID
  email: string;
  username: string;
  emailVerified: boolean;
  roles: string[];
  isBanned: boolean;
  type: 'access' | 'refresh';
}

export interface DecodedToken extends TokenPayload {
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string | string[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ═══════════════════════════════════════════════════════════
// Token Generation
// ═══════════════════════════════════════════════════════════

/**
 * Generate an access token
 */
export function generateAccessToken(payload: Omit<TokenPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      issuer: 'emc3',
      audience: 'emc3-users',
    } as SignOptions
  );
}

/**
 * Generate a refresh token
 */
export function generateRefreshToken(payload: Omit<TokenPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      issuer: 'emc3',
      audience: 'emc3-users',
    } as SignOptions
  );
}

// ═══════════════════════════════════════════════════════════
// Token Verification
// ═══════════════════════════════════════════════════════════

/**
 * Verify and decode a token
 */
export function verifyToken(token: string): DecodedToken {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: 'emc3',
    audience: 'emc3-users',
  }) as DecodedToken;
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): DecodedToken | null {
  return jwt.decode(token) as DecodedToken | null;
}

// ═══════════════════════════════════════════════════════════
// Token Pair Generation
// ═══════════════════════════════════════════════════════════

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: Omit<TokenPayload, 'type'>): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

// ═══════════════════════════════════════════════════════════
// Cookie Helpers
// ═══════════════════════════════════════════════════════════

const BASE_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: 'lax',
  domain: env.COOKIE_DOMAIN === 'localhost' ? undefined : env.COOKIE_DOMAIN,
  path: '/',
};

/**
 * Set auth cookies on response
 */
export function setAuthCookies(res: Response, tokens: TokenPair): void {
  // Access token cookie - shorter expiry
  res.cookie('access_token', tokens.accessToken, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Refresh token cookie - longer expiry
  res.cookie('refresh_token', tokens.refreshToken, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
}

/**
 * Clear auth cookies
 */
export function clearAuthCookies(res: Response): void {
  res.clearCookie('access_token', { ...BASE_COOKIE_OPTIONS });
  res.clearCookie('refresh_token', { ...BASE_COOKIE_OPTIONS });
}

