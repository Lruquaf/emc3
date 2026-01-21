import { Router } from 'express';

import { prisma } from '../lib/prisma.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    // Database connection check
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
      },
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      timestamp: new Date().toISOString(),
      services: {
        database: 'unhealthy',
      },
    });
  }
});

