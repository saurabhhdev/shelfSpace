import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { verifyAccessToken, TokenPayload } from '../utils/tokens';
import { sendError } from '../utils/apiResponse';
import { db } from '../db';
import { sessions, users } from '../db/schema';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token = req.cookies?.access_token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      sendError(res, 'Authentication required. No access token provided.', 401);
      return;
    }

    let payload: TokenPayload;
    try {
      payload = verifyAccessToken(token);
    } catch (err: any) {
      sendError(res, 'Invalid or expired access token.', 401, { expired: err.name === 'TokenExpiredError' });
      return;
    }

    // Verify session in database
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, payload.sessionId));

    if (!session || session.isRevoked) {
      sendError(res, 'Session has expired or was revoked. Please log in again.', 401);
      return;
    }

    // Check if user is not deleted
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId));

    if (!user || user.deletedAt) {
      sendError(res, 'User account not found or has been deactivated.', 401);
      return;
    }

    // Update session last active time asynchronously
    db.update(sessions)
      .set({ lastActiveAt: new Date(), updatedAt: new Date() })
      .where(eq(sessions.id, session.id))
      .catch(() => {});

    req.user = payload;
    next();
  } catch (error) {
    sendError(res, 'Internal authentication error', 500);
    return;
  }
}
