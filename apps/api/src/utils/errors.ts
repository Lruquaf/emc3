import { ERROR_CODES } from '@emc3/shared';

type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: ErrorCode,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: Record<string, unknown>) {
    return new AppError(400, ERROR_CODES.VALIDATION_ERROR, message, details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(401, ERROR_CODES.UNAUTHENTICATED, message);
  }

  static forbidden(message = 'Forbidden', details?: Record<string, unknown>) {
    return new AppError(403, ERROR_CODES.FORBIDDEN, message, details);
  }

  static contentRestricted(message = 'Content is restricted') {
    return new AppError(403, ERROR_CODES.CONTENT_RESTRICTED, message);
  }

  static notFound(message = 'Not found') {
    return new AppError(404, ERROR_CODES.NOT_FOUND, message);
  }

  static conflict(message: string, details?: Record<string, unknown>) {
    return new AppError(409, ERROR_CODES.CONFLICT, message, details);
  }

  static rateLimited(retryAfterSeconds?: number) {
    return new AppError(429, ERROR_CODES.RATE_LIMITED, 'Too many requests', {
      retryAfterSeconds,
    });
  }
}

