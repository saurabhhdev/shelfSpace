import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { env } from '../config/env';

if (!env.DATABASE_URL) {
  console.warn('[Database] Warning: DATABASE_URL is not set.');
}

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DATABASE_URL.includes('neon.tech') || env.isProduction
    ? { rejectUnauthorized: false }
    : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });

export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT 1 as connected');
    client.release();
    console.log('[Database] Neon PostgreSQL Connected successfully.');
    return res.rows[0]?.connected === 1;
  } catch (error) {
    console.error('[Database] PostgreSQL connection error:', error);
    return false;
  }
}

export async function closeDB(): Promise<void> {
  await pool.end();
}
