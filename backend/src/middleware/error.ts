import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { sendError } from '../utils/apiResponse';
import { env } from '../config/env';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  logger.error(`Unhandled error at ${req.method} ${req.url}:`, err);

  const statusCode = err.statusCode || err.status || 500;
  const rawMessage = err.message || 'Internal Server Error';
  const message = env.isProduction && statusCode === 500
    ? 'An unexpected server error occurred. Please try again later.'
    : rawMessage;

  sendError(res, message, statusCode, !env.isProduction ? err.stack : undefined);
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}
