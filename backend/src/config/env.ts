import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'shelfspace_dev_access_secret_super_secure_key_12345',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'shelfspace_dev_refresh_secret_super_secure_key_67890',
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
  COOKIE_SAME_SITE: (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || undefined,
  COOKIE_SECURE: process.env.COOKIE_SECURE !== undefined ? process.env.COOKIE_SECURE === 'true' : undefined,
  isProduction: process.env.NODE_ENV === 'production',
};

if (env.isProduction) {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required in production.');
  }
  if (
    !process.env.JWT_ACCESS_SECRET ||
    process.env.JWT_ACCESS_SECRET === 'shelfspace_dev_access_secret_super_secure_key_12345'
  ) {
    throw new Error('Insecure JWT_ACCESS_SECRET in production. Set a strong custom secret.');
  }
  if (
    !process.env.JWT_REFRESH_SECRET ||
    process.env.JWT_REFRESH_SECRET === 'shelfspace_dev_refresh_secret_super_secure_key_67890'
  ) {
    throw new Error('Insecure JWT_REFRESH_SECRET in production. Set a strong custom secret.');
  }
}
