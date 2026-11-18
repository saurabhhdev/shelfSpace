import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, IUser } from './user.model';
import { Session, ISession } from './session.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from '../../utils/tokens';

export class AuthService {
  static async register(name: string, email: string, password: string) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.deletedAt) {
        // Reactivate account if within grace period
        existing.deletedAt = null;
        existing.name = name;
        existing.passwordHash = await bcrypt.hash(password, 12);
        await existing.save();
        return existing;
      }
      throw new Error('An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      emailVerificationToken,
      emailVerifiedAt: null, // User can verify via token
    });

    return user;
  }

  static async login(email: string, password: string, userAgent: string, ipAddress: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
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
    const session = await Session.create({
      userId: user._id,
      userAgent,
      ipAddress,
      isRevoked: false,
      lastActiveAt: new Date(),
      expiresAt,
    });

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      sessionId: session._id.toString(),
      email: user.email,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user,
      session,
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

    const session = await Session.findById(payload.sessionId);
    if (!session || session.isRevoked) {
      throw new Error('Session has been revoked or expired.');
    }

    const user = await User.findById(payload.userId);
    if (!user || user.deletedAt) {
      throw new Error('User no longer exists.');
    }

    // Extend session
    session.lastActiveAt = new Date();
    session.ipAddress = ipAddress;
    session.userAgent = userAgent;
    await session.save();

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      sessionId: session._id.toString(),
      email: user.email,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    return {
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(sessionId: string) {
    await Session.findByIdAndUpdate(sessionId, { isRevoked: true });
  }

  static async updateProfile(userId: string, data: { name?: string; currentPassword?: string; newPassword?: string }) {
    const user = await User.findById(userId);
    if (!user || user.deletedAt) throw new Error('User not found.');

    if (data.name !== undefined) {
      const trimmed = data.name.trim();
      if (trimmed.length < 2) {
        throw new Error('Name must be at least 2 characters long.');
      }
      user.name = trimmed;
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
      user.passwordHash = await bcrypt.hash(data.newPassword, salt);
    }

    await user.save();
    return user;
  }

  static async verifyEmail(token: string) {
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      throw new Error('Invalid or expired email verification token.');
    }

    user.emailVerifiedAt = new Date();
    user.emailVerificationToken = null;
    await user.save();
    return user;
  }

  static async forgotPassword(email: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Do not reveal email existence
      return { token: null };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    return { token: resetToken, email: user.email };
  }

  static async resetPassword(token: string, newPassword: string) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Invalid or expired password reset token.');
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Revoke all existing sessions for security
    await Session.updateMany({ userId: user._id }, { isRevoked: true });
    return user;
  }

  static async getSessions(userId: string) {
    return Session.find({ userId, isRevoked: false }).sort({ lastActiveAt: -1 });
  }

  static async revokeSession(userId: string, sessionId: string) {
    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) {
      throw new Error('Session not found.');
    }
    session.isRevoked = true;
    await session.save();
    return session;
  }

  static async revokeAllOtherSessions(userId: string, currentSessionId: string) {
    await Session.updateMany(
      { userId, _id: { $ne: currentSessionId } },
      { isRevoked: true }
    );
  }

  static async requestAccountDeletion(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }
    user.deletedAt = new Date();
    await user.save();
    await Session.updateMany({ userId }, { isRevoked: true });
    return user;
  }
}
