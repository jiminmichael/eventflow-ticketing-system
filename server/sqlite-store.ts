import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { DatabaseSchema } from './db.js';

const collections = ['ticketTiers', 'orders', 'attendees', 'menuItems', 'payments'] as const;

/** Durable, transactional persistence for the single-process application service.
 * Each entity has its own row; JSON payloads preserve nested event/order fields.
 */
export class SQLiteStore {
  private connection: DatabaseSync;

  constructor(filename: string) {
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    this.connection = new DatabaseSync(filename);
    this.connection.exec(`
      PRAGMA busy_timeout = 5000;
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = FULL;
      CREATE TABLE IF NOT EXISTS event (
        id TEXT PRIMARY KEY NOT NULL,
        payload TEXT NOT NULL CHECK(json_valid(payload))
      );
    `);
    for (const table of collections) {
      this.connection.exec(`CREATE TABLE IF NOT EXISTS ${table} (
        id TEXT PRIMARY KEY NOT NULL,
        position INTEGER NOT NULL,
        payload TEXT NOT NULL CHECK(json_valid(payload))
      )`);
    }
  }

  load(): DatabaseSchema | null {
    const event = this.connection.prepare('SELECT payload FROM event').get();
    if (!event) return null;
    const data = { event: JSON.parse(String(event.payload)) } as DatabaseSchema;
    for (const table of collections) {
      data[table] = this.connection.prepare(`SELECT payload FROM ${table} ORDER BY position`)
        .all().map(row => JSON.parse(String(row.payload)));
    }
    return data;
  }

  save(data: DatabaseSchema): void {
    this.connection.exec('BEGIN IMMEDIATE');
    try {
      this.connection.exec('DELETE FROM event');
      this.connection.prepare('INSERT INTO event (id, payload) VALUES (?, ?)')
        .run(data.event.id, JSON.stringify(data.event));
      for (const table of collections) {
        this.connection.exec(`DELETE FROM ${table}`);
        const insert = this.connection.prepare(`INSERT INTO ${table} (id, position, payload) VALUES (?, ?, ?)`);
        data[table].forEach((record, index) => {
          const id = 'uuid' in record ? record.uuid : record.id;
          insert.run(id, index, JSON.stringify(record));
        });
      }
      this.connection.exec('COMMIT');
    } catch (error) {
      this.connection.exec('ROLLBACK');
      throw error;
    }
  }

  close(): void { this.connection.close(); }
}
