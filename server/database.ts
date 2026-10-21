import './env.js';
import { db as localDb } from './db.js';
import { createPostgresDatabase, type AsyncDatabase } from './postgres-store.js';

if (process.env.VERCEL && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required on Vercel. Configure the Neon Postgres connection before deploying.');
}

// Tests may explicitly select their isolated local database.
const usePostgres = process.env.DATABASE_URL && process.env.DATABASE_DRIVER !== 'sqlite';
if (process.env.VERCEL && process.env.DATABASE_DRIVER === 'sqlite') {
  throw new Error('SQLite is not supported for Vercel bookings. Use Neon Postgres.');
}
export const db: AsyncDatabase = usePostgres
  ? createPostgresDatabase(process.env.DATABASE_URL!).db
  : new Proxy({} as AsyncDatabase, {
      get(_target, property) {
        return async (...args: unknown[]) => Reflect.get(localDb, property).apply(localDb, args);
      },
    });
