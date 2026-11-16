import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/tokens';
import { sendError } from '../utils/apiResponse';
import { Session } from '../modules/auth/session.model';
import { User } from '../modules/auth/user.model';

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
    const session = await Session.findById(payload.sessionId);
    if (!session || session.isRevoked) {
      sendError(res, 'Session has expired or was revoked. Please log in again.', 401);
      return;
    }

    // Check if user is not deleted
    const user = await User.findById(payload.userId);
    if (!user || user.deletedAt) {
      sendError(res, 'User account not found or has been deactivated.', 401);
      return;
    }

    // Update session last active time asynchronously
    session.lastActiveAt = new Date();
    session.save().catch(() => {});

    req.user = payload;
    next();
  } catch (error) {
    sendError(res, 'Internal authentication error', 500);
    return;
  }
}
