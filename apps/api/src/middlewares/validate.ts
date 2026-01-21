import { RequestHandler } from 'express';
import { ZodSchema, ZodError } from 'zod';

import { ERROR_CODES } from '@emc3/shared';

/**
 * Validate request body against a Zod schema
 */
export function validate(schema: ZodSchema): RequestHandler {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Validation failed',
          details: error.flatten().fieldErrors,
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery(schema: ZodSchema): RequestHandler {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid query parameters',
          details: error.flatten().fieldErrors,
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Validate route parameters against a Zod schema
 */
export function validateParams(schema: ZodSchema): RequestHandler {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid URL parameters',
          details: error.flatten().fieldErrors,
        });
        return;
      }
      next(error);
    }
  };
}

