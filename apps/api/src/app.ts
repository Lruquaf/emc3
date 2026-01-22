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
import { categoriesRouter } from './routes/categories.routes.js';
import { socialRouter } from './routes/social.routes.js';
import { followRouter } from './routes/follow.routes.js';
import { feedRouter } from './routes/feed.routes.js';
import { opinionRouter } from './routes/opinion.routes.js';
import { appealRouter } from './routes/appeal.routes.js';

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
app.use('/api/v1/categories', categoriesRouter);

// Social features routes
app.use('/api/v1', socialRouter);  // Like, Save endpoints
app.use('/api/v1', followRouter);  // Follow endpoints
app.use('/api/v1', feedRouter);    // Feed & Search endpoints
app.use('/api/v1', opinionRouter); // Opinion endpoints
app.use('/api/v1/appeals', appealRouter); // Appeal endpoints

// ═══════════════════════════════════════════════════════════
// Error Handling
// ═══════════════════════════════════════════════════════════
app.use(notFoundHandler);
app.use(errorHandler);

