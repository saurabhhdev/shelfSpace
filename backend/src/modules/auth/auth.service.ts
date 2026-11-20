import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { eq, and, sql, not, gt, desc } from 'drizzle-orm';
import { db } from '../../db';
import { users, sessions } from '../../db/schema';
import { formatUser, formatSession } from '../../utils/formatters';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../../utils/tokens';

export class AuthService {
  static async register(name: string, email: string, password: string) {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(sql`LOWER(${users.email})`, email.toLowerCase()));

    if (existing) {
      if (existing.deletedAt) {
        // Reactivate account if within grace period
        const passwordHash = await bcrypt.hash(password, 12);
        const [updated] = await db
          .update(users)
          .set({
            deletedAt: null,
            name,
            passwordHash,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existing.id))
          .returning();
        return formatUser(updated);
      }
      throw new Error('An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email: email.toLowerCase(),
        passwordHash,
        emailVerificationToken,
        emailVerifiedAt: null,
      })
      .returning();

    return formatUser(newUser);
  }

  static async login(email: string, password: string, userAgent: string, ipAddress: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(sql`LOWER(${users.email})`, email.toLowerCase()));

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (user.deletedAt) {
      throw new Error('This account was scheduled for deletion. Please contact support or register again.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    // Create session (7 days expiry)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const [session] = await db
      .insert(sessions)
      .values({
        userId: user.id,
        userAgent,
        ipAddress,
        isRevoked: false,
        lastActiveAt: new Date(),
        expiresAt,
      })
      .returning();

    const tokenPayload: TokenPayload = {
      userId: user.id,
      sessionId: session.id,
      email: user.email,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: formatUser(user),
      session: formatSession(session),
      accessToken,
      refreshToken,
    };
  }

  static async refreshSession(oldRefreshToken: string, userAgent: string, ipAddress: string) {
    let payload: TokenPayload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch (err) {
      throw new Error('Invalid or expired refresh token.');
    }

    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, payload.sessionId));

    if (!session || session.isRevoked) {
      throw new Error('Session has been revoked or expired.');
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId));

    if (!user || user.deletedAt) {
      throw new Error('User no longer exists.');
    }

    // Extend session
    await db
      .update(sessions)
      .set({
        lastActiveAt: new Date(),
        ipAddress,
        userAgent,
        updatedAt: new Date(),
      })
      .where(eq(sessions.id, session.id));

    const tokenPayload: TokenPayload = {
      userId: user.id,
      sessionId: session.id,
      email: user.email,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    return {
      user: formatUser(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(sessionId: string) {
    await db
      .update(sessions)
      .set({ isRevoked: true, updatedAt: new Date() })
      .where(eq(sessions.id, sessionId));
  }

  static async updateProfile(userId: string, data: { name?: string; currentPassword?: string; newPassword?: string }) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user || user.deletedAt) throw new Error('User not found.');

    const updates: any = { updatedAt: new Date() };

    if (data.name !== undefined) {
      const trimmed = data.name.trim();
      if (trimmed.length < 2) {
        throw new Error('Name must be at least 2 characters long.');
      }
      updates.name = trimmed;
    }

    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new Error('Current password is required to change password.');
      }
      const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new Error('Current password is incorrect.');
      }
      if (data.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long.');
      }
      const salt = await bcrypt.genSalt(12);
      updates.passwordHash = await bcrypt.hash(data.newPassword, salt);
    }

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();

    return formatUser(updated);
  }

  static async verifyEmail(token: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token));

    if (!user) {
      throw new Error('Invalid or expired email verification token.');
    }

    const [updated] = await db
      .update(users)
      .set({
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return formatUser(updated);
  }

  static async forgotPassword(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(sql`LOWER(${users.email})`, email.toLowerCase()));

    if (!user) {
      return { token: null };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await db
      .update(users)
      .set({
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return { token: resetToken, email: user.email };
  }

  static async resetPassword(token: string, newPassword: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.resetPasswordToken, token),
          gt(users.resetPasswordExpires, new Date())
        )
      );

    if (!user) {
      throw new Error('Invalid or expired password reset token.');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const [updated] = await db
      .update(users)
      .set({
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    // Revoke all existing sessions for security
    await db
      .update(sessions)
      .set({ isRevoked: true, updatedAt: new Date() })
      .where(eq(sessions.userId, user.id));

    return formatUser(updated);
  }

  static async getSessions(userId: string) {
    const sessionList = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.userId, userId), eq(sessions.isRevoked, false)))
      .orderBy(desc(sessions.lastActiveAt));

    return sessionList.map(formatSession);
  }

  static async revokeSession(userId: string, sessionId: string) {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)));

    if (!session) {
      throw new Error('Session not found.');
    }

    const [updated] = await db
      .update(sessions)
      .set({ isRevoked: true, updatedAt: new Date() })
      .where(eq(sessions.id, sessionId))
      .returning();

    return formatSession(updated);
  }

  static async revokeAllOtherSessions(userId: string, currentSessionId: string) {
    await db
      .update(sessions)
      .set({ isRevoked: true, updatedAt: new Date() })
      .where(
        and(
          eq(sessions.userId, userId),
          not(eq(sessions.id, currentSessionId))
        )
      );
  }

  static async requestAccountDeletion(userId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new Error('User not found.');
    }

    const [updated] = await db
      .update(users)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    await db
      .update(sessions)
      .set({ isRevoked: true, updatedAt: new Date() })
      .where(eq(sessions.userId, userId));

    return formatUser(updated);
  }
}
