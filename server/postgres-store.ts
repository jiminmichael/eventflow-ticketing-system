import { Pool, type PoolClient } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { DatabaseService, type DatabaseSchema } from './db.js';

export const tables = {
  ticketTiers: 'ticket_tiers', orders: 'orders', attendees: 'attendees',
  menuItems: 'menu_items', payments: 'payments',
} as const;
// All domain mutations acquire the same transaction lock before reading state.
// This serializes inventory/payment decisions across independent Vercel instances.
export const WRITE_LOCK = 746302191;
export type AsyncDatabase = {
  [K in keyof DatabaseService]: DatabaseService[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<R> : never;
};

export async function readSnapshot(client: PoolClient): Promise<DatabaseSchema | null> {
  const fields = Object.entries(tables).map(([key, table]) =>
    `'${key}', COALESCE((SELECT jsonb_agg(payload ORDER BY position) FROM eventflow.${table}), '[]'::jsonb)`);
  const result = await client.query(`SELECT jsonb_build_object(
    'event', (SELECT payload FROM eventflow.event LIMIT 1), ${fields.join(',')}
  ) AS data`);
  const data = result.rows[0].data as DatabaseSchema;
  return data.event ? data : null;
}

export async function saveSnapshot(client: PoolClient, data: DatabaseSchema, previous?: DatabaseSchema) {
  if (JSON.stringify(data.event) !== JSON.stringify(previous?.event)) {
    await client.query(`INSERT INTO eventflow.event (id, payload) VALUES ($1, $2)
      ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload`, [data.event.id, data.event]);
  }
  for (const [key, table] of Object.entries(tables)) {
    const collection = key as keyof typeof tables;
    const old = new Map((previous?.[collection] ?? []).map((record, index) =>
      ['uuid' in record ? record.uuid : record.id, { record, index }]));
    for (const [index, record] of data[collection].entries()) {
      const id = 'uuid' in record ? record.uuid : record.id;
      const prior = old.get(id);
      if (!prior || prior.index !== index || JSON.stringify(prior.record) !== JSON.stringify(record)) {
        await client.query(`INSERT INTO eventflow.${table} (id, position, payload) VALUES ($1, $2, $3)
          ON CONFLICT (id) DO UPDATE SET position = EXCLUDED.position, payload = EXCLUDED.payload`,
          [id, index, record]);
      }
      old.delete(id);
    }
    if (old.size) await client.query(`DELETE FROM eventflow.${table} WHERE id = ANY($1::text[])`, [[...old.keys()]]);
  }
}

export function createPostgresDatabase(connectionString: string) {
  const pool = new Pool({ connectionString, max: 3, idleTimeoutMillis: 5000, connectionTimeoutMillis: 15000 });
  if (process.env.VERCEL) attachDatabasePool(pool);
  pool.on('error', () => console.error('[DB] Idle Postgres connection failed; the pool will reconnect.'));
  const database = new Proxy({} as AsyncDatabase, {
    get(_target, property: string) {
      if (property === 'then') return undefined;
      if (!(property in DatabaseService.prototype)) throw new Error('Unknown database operation');
      return async (...args: unknown[]) => {
        const client = await pool.connect();
        const readonly = property.startsWith('get') && !['getTicketTiers', 'getEvent'].includes(property);
        try {
          await client.query(readonly ? 'BEGIN READ ONLY' : 'BEGIN');
          if (!readonly) await client.query('SELECT pg_advisory_xact_lock($1)', [WRITE_LOCK]);
          const snapshot = await readSnapshot(client);
          if (!snapshot) throw new Error('Database is not initialized. Run npm run db:migrate.');
          const previous = structuredClone(snapshot);
          let changed: DatabaseSchema | undefined;
          const service = new DatabaseService({ snapshot, save: state => { changed = state; } });
          const result = Reflect.get(service, property).apply(service, args);
          if (changed) await saveSnapshot(client, changed, previous);
          await client.query('COMMIT');
          return result;
        } catch (error) {
          await client.query('ROLLBACK').catch(() => {});
          throw error;
        } finally {
          client.release();
        }
      };
    },
  });
  return { db: database, close: () => pool.end() };
}
