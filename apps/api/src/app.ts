import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { globalRateLimit } from './middlewares/rateLimit.js';
import { healthRouter } from './routes/health.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { articlesRouter } from './routes/articles.routes.js';
import { revisionsRouter } from './routes/revisions.routes.js';
import { meRouter } from './routes/me.routes.js';
import { adminRouter } from './routes/admin.routes.js';

export const app = express();

// ═══════════════════════════════════════════════════════════
// Global Middlewares
// ═══════════════════════════════════════════════════════════
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging (development only)
if (env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Global rate limiting
app.use(globalRateLimit);

// ═══════════════════════════════════════════════════════════
// Routes
// ═══════════════════════════════════════════════════════════

// Health check (no version prefix)
app.use('/health', healthRouter);

// API v1 routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/articles', articlesRouter);
app.use('/api/v1/revisions', revisionsRouter);
app.use('/api/v1/me', meRouter);
app.use('/api/v1/admin', adminRouter);

// ═══════════════════════════════════════════════════════════
// Error Handling
// ═══════════════════════════════════════════════════════════
app.use(notFoundHandler);
app.use(errorHandler);

