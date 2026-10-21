CREATE SCHEMA IF NOT EXISTS eventflow;
CREATE TABLE IF NOT EXISTS eventflow.event (
  id text PRIMARY KEY,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object')
);
CREATE TABLE IF NOT EXISTS eventflow.ticket_tiers (
  id text PRIMARY KEY,
  position integer NOT NULL,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object')
);
CREATE TABLE IF NOT EXISTS eventflow.orders (
  id text PRIMARY KEY,
  position integer NOT NULL,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object')
);
CREATE TABLE IF NOT EXISTS eventflow.attendees (
  id text PRIMARY KEY,
  position integer NOT NULL,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object')
);
CREATE TABLE IF NOT EXISTS eventflow.menu_items (
  id text PRIMARY KEY,
  position integer NOT NULL,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object')
);
CREATE TABLE IF NOT EXISTS eventflow.payments (
  id text PRIMARY KEY,
  position integer NOT NULL,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object')
);
CREATE UNIQUE INDEX IF NOT EXISTS orders_reference ON eventflow.orders ((payload->>'orderReference'));
CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_reference ON eventflow.orders ((payload->>'paymentReference'));
CREATE UNIQUE INDEX IF NOT EXISTS payments_reference ON eventflow.payments ((payload->>'paymentReference'));
CREATE INDEX IF NOT EXISTS attendees_order_reference ON eventflow.attendees ((payload->>'orderReference'));
