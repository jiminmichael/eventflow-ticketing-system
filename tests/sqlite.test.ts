import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { SQLiteStore } from '../server/sqlite-store.js';
import { fallbackEvent, fallbackTicketTiers, fallbackMenuItems } from '../src/fallbackData.js';

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'hideout-sqlite-'));
const filename = path.join(directory, 'db.sqlite');
const legacyFile = path.join(directory, 'db.json');
const seed = {
  event: { ...fallbackEvent, title: 'Legacy event' },
  ticketTiers: fallbackTicketTiers,
  orders: [], attendees: [], payments: [], menuItems: fallbackMenuItems,
};
const moduleUrl = pathToFileURL(path.resolve('server/db.ts')).href;
function runService(code: string, dataDir = directory) {
  return spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e',
    `const {db} = await import(${JSON.stringify(moduleUrl)}); ${code}`], {
    env: { ...process.env, DATA_DIR: dataDir, NODE_ENV: 'test' }, encoding: 'utf8',
  });
}
try {
  const legacyContents = JSON.stringify(seed);
  fs.writeFileSync(legacyFile, legacyContents);
  let result = runService(`db.updateEvent({title: 'Persisted SQLite event'});`);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(filename).subarray(0, 16).toString(), 'SQLite format 3\0');
  assert.equal(fs.readFileSync(legacyFile, 'utf8'), legacyContents);
  let store = new SQLiteStore(filename);
  const saved = store.load()!;
  assert.equal(saved.event.title, 'Persisted SQLite event');
  assert.deepEqual(saved.ticketTiers, seed.ticketTiers);
  assert.deepEqual(saved.menuItems, seed.menuItems);
  assert.deepEqual(saved.orders, []);

  // A failed write must roll back every table, including the event updated first.
  const broken = structuredClone(saved);
  broken.event.title = 'Must roll back';
  broken.ticketTiers.push(broken.ticketTiers[0]);
  assert.throws(() => store.save(broken), /UNIQUE constraint/);
  assert.deepEqual(store.load(), saved);
  store.close();

  // A new process must use committed SQLite data, even with damaged legacy JSON.
  fs.writeFileSync(legacyFile, '{invalid');
  result = runService(`if (db.getEvent().title !== 'Persisted SQLite event') throw new Error('Restart lost data');`);
  assert.equal(result.status, 0, result.stderr);

  // Invalid migration is fatal and cannot leave a partially imported store.
  const invalidDir = path.join(directory, 'invalid');
  fs.mkdirSync(invalidDir);
  fs.writeFileSync(path.join(invalidDir, 'db.json'), '{invalid');
  assert.notEqual(runService('', invalidDir).status, 0);
  store = new SQLiteStore(path.join(invalidDir, 'db.sqlite'));
  assert.equal(store.load(), null);
  store.close();
  console.log('SQLite tests passed: migration, source preservation, restart persistence, atomic rollback and invalid import.');
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
