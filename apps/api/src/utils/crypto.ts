import crypto from 'crypto';

/**
 * Generate a secure random token
 */
export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a token for storage (using SHA256)
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a URL-safe random string
 */
export function generateUrlSafeToken(length = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

