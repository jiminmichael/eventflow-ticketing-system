import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { fallbackEvent, fallbackTicketTiers, fallbackMenuItems } from '../src/fallbackData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load Neon env vars pulled into .env by `neon deploy`.
dotenv.config({ path: ['.env.local', '.env'], quiet: true });

const connectionString = process.env.DATABASE_URL_UNPOOLED;
if (!connectionString) {
  throw new Error('DATABASE_URL_UNPOOLED is not set. Run `neon deploy` first.');
}

// Migrations/DDL must run on the direct (unpooled) connection; the pooled
// PgBouncer URL (DATABASE_URL) is reserved for application traffic.
const sql = fs.readFileSync(path.join(__dirname, '..', 'server', 'migrations', '001_eventflow.sql'), 'utf8');

const pool = new Pool({ connectionString });

async function main() {
  const client = await pool.connect();
  try {
    // 1. Apply schema migration.
    await client.query(sql);
    console.log('[mig] schema migration applied to eventflow schema');

    // 2. Skip re-seed if already initialized.
    const existing = await client.query('SELECT id FROM eventflow.event LIMIT 1');
    if (existing.rows.length) {
      console.log('[seed] eventflow.event already initialized, skipping seed');
      return;
    }

    // 3. Seed the event row (snapshot requires a non-null event).
    await client.query(
      'INSERT INTO eventflow.event (id, payload) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
      [fallbackEvent.id, JSON.stringify(fallbackEvent)]
    );

    // 4. Seed ticket tiers.
    for (const [position, tier] of fallbackTicketTiers.entries()) {
      await client.query(
        'INSERT INTO eventflow.ticket_tiers (id, position, payload) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [tier.id, position, JSON.stringify(tier)]
      );
    }

    // 5. Seed menu items.
    for (const [position, item] of fallbackMenuItems.entries()) {
      await client.query(
        'INSERT INTO eventflow.menu_items (id, position, payload) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [item.id, position, JSON.stringify(item)]
      );
    }

    console.log('[seed] seeded event, ticket_tiers, menu_items into Neon Postgres');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
