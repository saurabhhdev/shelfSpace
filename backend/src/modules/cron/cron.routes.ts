import { Router, Request, Response } from 'express';
import { env } from '../../config/env';
import { ResourceService } from '../resources/resource.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * Middleware to authenticate scheduled Vercel Cron invocations.
 * Vercel automatically passes: Authorization: Bearer <CRON_SECRET>
 */
export function requireCronAuth(req: Request, res: Response, next: () => void) {
  const cronSecret = process.env.CRON_SECRET || env.CRON_SECRET;

  // In production, CRON_SECRET is strictly required
  if (env.isProduction && !cronSecret) {
    logger.error('[Cron] Rejected: CRON_SECRET is not configured on server.');
    return sendError(res, 'Server cron authorization secret is not configured.', 500);
  }

  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-cron-secret'] as string | undefined;
  const querySecret = req.query.secret as string | undefined;

  const providedSecret = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : (customHeader || querySecret);

  if (cronSecret) {
    if (!providedSecret || providedSecret !== cronSecret) {
      logger.warn('[Cron] Unauthorized cron invocation attempt');
      return sendError(res, 'Unauthorized: Invalid cron authentication token.', 401);
    }
  } else if (env.isProduction) {
    return sendError(res, 'Unauthorized', 401);
  }

  next();
}

/**
 * GET /api/cron/cleanup-trash
 * POST /api/cron/cleanup-trash
 * Scheduled maintenance job (runs daily via Vercel Cron)
 * Permanently removes trashed resources older than 30 days.
 */
async function handleCleanupTrash(req: Request, res: Response) {
  try {
    const cleanedCount = await ResourceService.cleanupExpiredTrash();
    logger.info(`[Cron] Trash cleanup complete. Cleaned ${cleanedCount} expired resources.`);

    return sendSuccess(
      res,
      {
        cleanedCount,
        executedAt: new Date().toISOString(),
      },
      `Successfully cleaned up ${cleanedCount} expired trash item(s).`
    );
  } catch (error: any) {
    logger.error('[Cron] Trash cleanup failed:', error);
    return sendError(res, error.message || 'Scheduled trash cleanup failed', 500);
  }
}

router.get('/cleanup-trash', requireCronAuth, handleCleanupTrash);
router.post('/cleanup-trash', requireCronAuth, handleCleanupTrash);

export default router;
