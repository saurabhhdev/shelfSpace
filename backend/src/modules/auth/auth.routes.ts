import { Router } from 'express';
import { AuthController } from './auth.controller';
import { requireAuth } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimiter';
import { validateBody } from '../../middleware/validate';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.validation';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), AuthController.register);
router.post('/login', authLimiter, validateBody(loginSchema), AuthController.login);
router.post('/logout', requireAuth, AuthController.logout);
router.post('/refresh', AuthController.refresh);
router.get('/me', requireAuth, AuthController.me);
router.post('/verify-email', validateBody(verifyEmailSchema), AuthController.verifyEmail);
router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), AuthController.resetPassword);

// Session management
router.get('/sessions', requireAuth, AuthController.getSessions);
router.delete('/sessions/:sessionId', requireAuth, AuthController.revokeSession);
router.delete('/sessions', requireAuth, AuthController.revokeAllOtherSessions);

// Account deletion with grace period
router.delete('/account', requireAuth, AuthController.deleteAccount);

export default router;
