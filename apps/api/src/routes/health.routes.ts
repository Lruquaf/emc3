import { Router } from 'express';

import { prisma } from '../lib/prisma.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    // Database connection check
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
      },
    });
  } catch (error) {
    // Return 200 even if database is unhealthy (for Railway healthcheck)
    // Railway will retry, but we don't want to fail immediately
    res.status(200).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: 'unhealthy',
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

