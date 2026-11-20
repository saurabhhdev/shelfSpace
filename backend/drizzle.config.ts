import { defineConfig } from 'drizzle-kit';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '.env') });

const schemaPath = path.join(__dirname, 'src/db/schema.ts').replace(/\\/g, '/');
const outPath = path.join(__dirname, 'drizzle').replace(/\\/g, '/');

export default defineConfig({
  schema: schemaPath,
  out: outPath,
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
});

