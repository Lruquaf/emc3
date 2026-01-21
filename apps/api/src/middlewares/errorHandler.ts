import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { ERROR_CODES } from '@emc3/shared';

import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('Error:', err);

  // Zod validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Validation failed',
      details: err.flatten().fieldErrors,
    });
  }

  // Custom app error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }

  // Unknown error
  const statusCode = err.statusCode || 500;
  const message =
    env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return res.status(statusCode).json({
    code: ERROR_CODES.INTERNAL_ERROR,
    message,
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

