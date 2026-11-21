import app from '../src/app';

/**
 * Vercel Serverless Function entry point.
 * Wraps the Express application for deployment on Vercel Functions.
 * API requests routed to /api/* are processed by the Express instance.
 */
export default app;
