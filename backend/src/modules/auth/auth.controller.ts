import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { AuthService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { env } from '../../config/env';
import { db } from '../../db';
import { users } from '../../db/schema';
import { formatUser } from '../../utils/formatters';

const isProduction = env.isProduction;

function getCookieOptions() {
  const isProd = env.isProduction;
  // If frontend and backend are on separate subdomains (e.g., shelfspace.vercel.app and shelfspace-api.vercel.app),
  // browsers treat them as cross-site. SameSite MUST be 'none' and secure MUST be true for cross-origin cookies.
  const sameSite: 'lax' | 'strict' | 'none' = env.COOKIE_SAME_SITE || (isProd ? 'none' : 'lax');
  const secure: boolean = sameSite === 'none' ? true : (env.COOKIE_SECURE ?? isProd);
  return {
    httpOnly: true,
    secure,
    sameSite,
    domain: env.COOKIE_DOMAIN || undefined,
    path: '/',
  };
}

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const baseOptions = getCookieOptions();

  res.cookie('access_token', accessToken, {
    ...baseOptions,
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie('refresh_token', refreshToken, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function clearAuthCookies(res: Response) {
  const baseOptions = getCookieOptions();

  res.clearCookie('access_token', baseOptions);
  res.clearCookie('refresh_token', baseOptions);
}

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      const user = await AuthService.register(name, email, password);

      // Auto login after registration
      const userAgent = req.headers['user-agent'] || 'Unknown Browser';
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      const loginResult = await AuthService.login(email, password, userAgent, ipAddress);
      setAuthCookies(res, loginResult.accessToken, loginResult.refreshToken);

      return sendSuccess(
        res,
        {
          user: loginResult.user,
          accessToken: loginResult.accessToken,
          verificationToken: user?.emailVerificationToken, // Provided for easy dev verification
        },
        'Registration successful! Welcome to Shelfspace.',
        201
      );
    } catch (err: any) {
      return sendError(res, err.message || 'Registration failed', 400);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const userAgent = req.headers['user-agent'] || 'Unknown Device';
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      const result = await AuthService.login(email, password, userAgent, ipAddress);
      setAuthCookies(res, result.accessToken, result.refreshToken);

      return sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        'Login successful'
      );
    } catch (err: any) {
      return sendError(res, err.message || 'Invalid credentials', 401);
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      if (req.user?.sessionId) {
        await AuthService.logout(req.user.sessionId);
      }
      clearAuthCookies(res);
      return sendSuccess(res, null, 'Logged out successfully');
    } catch (err: any) {
      clearAuthCookies(res);
      return sendSuccess(res, null, 'Logged out');
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const refreshToken =
        req.cookies?.refresh_token ||
        req.body?.refreshToken ||
        (req.headers['x-refresh-token'] as string);

      if (!refreshToken) {
        return sendError(res, 'No refresh token provided', 401);
      }

      const userAgent = req.headers['user-agent'] || 'Unknown Device';
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      const result = await AuthService.refreshSession(refreshToken, userAgent, ipAddress);
      setAuthCookies(res, result.accessToken, result.refreshToken);

      return sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        'Session refreshed'
      );
    } catch (err: any) {
      clearAuthCookies(res);
      return sendError(res, err.message || 'Failed to refresh session', 401);
    }
  }

  static async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.user.userId));
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      return sendSuccess(res, { user: formatUser(user), sessionId: req.user.sessionId }, 'Current user profile');
    } catch (err: any) {
      return sendError(res, err.message || 'Error fetching user', 500);
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const updated = await AuthService.updateProfile(userId, req.body);
      return sendSuccess(res, { user: updated }, 'Profile updated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update profile', 400);
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const user = await AuthService.verifyEmail(token);
      return sendSuccess(res, { user }, 'Email verified successfully!');
    } catch (err: any) {
      return sendError(res, err.message || 'Email verification failed', 400);
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);
      return sendSuccess(
        res,
        {
          message: 'If an account exists with this email, a reset token has been generated.',
          ...(isProduction ? {} : { token: result.token }),
        },
        'Password reset link generated'
      );
    } catch (err: any) {
      return sendError(res, err.message || 'Error generating reset token', 500);
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;
      await AuthService.resetPassword(token, password);
      clearAuthCookies(res);
      return sendSuccess(res, null, 'Password reset successful. Please log in with your new password.');
    } catch (err: any) {
      return sendError(res, err.message || 'Password reset failed', 400);
    }
  }

  static async getSessions(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }
      const sessions = await AuthService.getSessions(req.user.userId);
      return sendSuccess(
        res,
        {
          sessions,
          currentSessionId: req.user.sessionId,
        },
        'Active sessions retrieved'
      );
    } catch (err: any) {
      return sendError(res, err.message || 'Error fetching sessions', 500);
    }
  }

  static async revokeSession(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }
      const { sessionId } = req.params;
      await AuthService.revokeSession(req.user.userId, sessionId);

      if (sessionId === req.user.sessionId) {
        clearAuthCookies(res);
      }

      return sendSuccess(res, null, 'Session revoked');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to revoke session', 400);
    }
  }

  static async revokeAllOtherSessions(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }
      await AuthService.revokeAllOtherSessions(req.user.userId, req.user.sessionId);
      return sendSuccess(res, null, 'All other sessions have been revoked.');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to revoke other sessions', 500);
    }
  }

  static async deleteAccount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }
      await AuthService.requestAccountDeletion(req.user.userId);
      clearAuthCookies(res);
      return sendSuccess(
        res,
        null,
        'Account scheduled for deletion. You have a 30-day grace period to log back in before permanent deletion.'
      );
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to delete account', 500);
    }
  }
}
