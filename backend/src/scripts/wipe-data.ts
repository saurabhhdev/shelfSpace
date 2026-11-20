import { Pool } from 'pg';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function wipeAll() {
  console.log('--- 1. Wiping MongoDB ---');
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shelfspace';
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;
    if (db) {
      const collections = await db.listCollections().toArray();
      for (const c of collections) {
        const res = await db.collection(c.name).deleteMany({});
        console.log(`MongoDB: Cleared collection "${c.name}" (${res.deletedCount} records deleted)`);
      }
    }
    await mongoose.disconnect();
    console.log('✓ MongoDB is completely empty!\n');
  } catch (err: any) {
    console.error('MongoDB wipe error:', err.message);
  }

  console.log('--- 2. Wiping Neon PostgreSQL ---');
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in backend/.env');
    }

    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });

    const tables = [
      'resource_tags',
      'project_resources',
      'collection_resources',
      'resources',
      'projects',
      'collections',
      'sessions',
      'users',
    ];

    console.log('Previous record counts in Neon:');
    for (const t of tables) {
      const countRes = await pool.query(`SELECT count(*)::int as count FROM ${t}`);
      console.log(`- ${t}: ${countRes.rows[0].count} records`);
    }

    console.log('\nTruncating all tables with CASCADE...');
    await pool.query(`
      TRUNCATE TABLE 
        resource_tags, 
        project_resources, 
        collection_resources, 
        resources, 
        projects, 
        collections, 
        sessions, 
        users 
      RESTART IDENTITY CASCADE;
    `);

    console.log('✓ All tables truncated!\nVerifying counts:');
    let totalRemaining = 0;
    for (const t of tables) {
      const checkRes = await pool.query(`SELECT count(*)::int as count FROM ${t}`);
      const count = checkRes.rows[0].count;
      totalRemaining += count;
      console.log(`- ${t}: ${count} records`);
    }

    await pool.end();
    if (totalRemaining === 0) {
      console.log('\n✓ Neon PostgreSQL is completely empty (0 records across all tables)!');
    } else {
      console.warn(`\nWarning: ${totalRemaining} records still remaining.`);
    }
  } catch (err: any) {
    console.error('Neon wipe error:', err.message);
  }
}

wipeAll().catch((err) => {
  console.error('Fatal error during wipe:', err);
  process.exit(1);
});
