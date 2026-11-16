export const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(sanitizeMeta(meta)) : '');
  },
  warn: (message: string, meta?: Record<string, any>) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(sanitizeMeta(meta)) : '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error instanceof Error ? error.stack : error);
  },
  debug: (message: string, meta?: Record<string, any>) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(sanitizeMeta(meta)) : '');
    }
  }
};

function sanitizeMeta(meta: Record<string, any>): Record<string, any> {
  const sanitized = { ...meta };
  const sensitiveKeys = ['password', 'passwordHash', 'token', 'secret', 'authorization', 'cookie', 'cookies'];
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeMeta(sanitized[key]);
    }
  }
  return sanitized;
}
