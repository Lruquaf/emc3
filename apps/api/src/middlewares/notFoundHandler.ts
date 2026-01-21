import { RequestHandler } from 'express';

import { ERROR_CODES } from '@emc3/shared';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({
    code: ERROR_CODES.NOT_FOUND,
    message: 'Resource not found',
  });
};

