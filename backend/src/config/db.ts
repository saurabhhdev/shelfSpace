import { testConnection, closeDB } from '../db';

export async function connectDB(): Promise<void> {
  const success = await testConnection();
  if (!success) {
    console.error('[Database] Neon PostgreSQL connection failed.');
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await closeDB();
}
