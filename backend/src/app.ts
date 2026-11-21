import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { globalLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/error';
import { sendSuccess } from './utils/apiResponse';

// Import feature routers
import authRoutes from './modules/auth/auth.routes';
import resourceRoutes from './modules/resources/resource.routes';
import projectRoutes from './modules/projects/project.routes';
import collectionRoutes from './modules/collections/collection.routes';
import searchRoutes from './modules/search/search.routes';

const app: Application = express();

// Trust reverse proxy in production (Render, Railway, Vercel, Nginx, Cloudflare)
if (env.isProduction) {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration (supports comma-separated production origins & strips trailing slashes)
const configuredOrigins = (env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      if (!env.isProduction) {
        return callback(null, true); // Permissive for local development only
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

// Body and cookie parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// Global Rate Limiter
app.use('/api', globalLimiter);

// Health check endpoint (Phase 0)
app.get('/api/health', (req: Request, res: Response) => {
  return sendSuccess(
    res,
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      version: '1.0.0',
    },
    'Shelfspace API is running smoothly'
  );
});

// Mount Feature API routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/categories', collectionRoutes); // Full compatibility alias for Phase 8 Categories
app.use('/api/search', searchRoutes);

// Catch-all 404 & Global error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
