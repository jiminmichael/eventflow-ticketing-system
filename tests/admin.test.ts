process.env.DATABASE_DRIVER = 'sqlite';
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import express from "express";
import { SQLiteStore } from "../server/sqlite-store.js";
import * as XLSX from "xlsx";
import {
  fallbackEvent,
  fallbackTicketTiers,
  fallbackMenuItems,
} from "../src/fallbackData.js";
const originalData = fs.readFileSync("data/db.json");
const directory = fs.mkdtempSync(
  path.join(os.tmpdir(), "hideout-admin-audit-"),
);
Object.assign(process.env, {
  DATA_DIR: directory,
  NODE_ENV: "test",
  PAYSTACK_SECRET_KEY: "",
  PAYSTACK_SANDBOX: "true",
  ADMIN_USERNAME: "audit-admin",
  ADMIN_PASSWORD: crypto.randomBytes(24).toString("hex"),
  ADMIN_SESSION_SECRET: crypto.randomBytes(32).toString("hex"),
});
fs.writeFileSync(
  path.join(directory, "db.json"),
  JSON.stringify({
    event: fallbackEvent,
    ticketTiers: fallbackTicketTiers,
    menuItems: fallbackMenuItems,
    orders: [],
    attendees: [],
    payments: [],
  }),
);
const { apiRouter } = await import("../server/routes.js");
const { db } = await import("../server/db.js");
const app = express();
app.use(express.json());
app.use("/api", apiRouter);
const server = await new Promise<ReturnType<typeof app.listen>>((resolve) => {
  const s = app.listen(0, "127.0.0.1", () => resolve(s));
});
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api`;
let token = "";
let assertions = 0;
const req = (url: string, method = "GET", body?: unknown, auth = token) =>
  fetch(base + url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
const ok = async (
  url: string,
  method = "GET",
  body?: unknown,
  status = 200,
) => {
  const r = await req(url, method, body);
  assert.equal(r.status, status, `${method} ${url}: ${await r.clone().text()}`);
  assertions++;
  return r.json();
};
const makeOrder = (name: string, status: "verified" | "pending" | "failed") => {
  const person = {
    firstName: name,
    lastName: "Audit",
    email: "audit@example.com",
    phone: "+2348001234567",
  };
  const reference = crypto.randomUUID();
  const result = db.createPendingOrder({
    ticketTierId: "hideout-access",
    quantity: 1,
    purchaser: person,
    attendees: [person],
    paymentReference: reference,
  });
  if (status === "verified") db.confirmPayment({ paymentReference: reference });
  if (status === "failed") db.markPaymentFailed(reference, "Fixture decline");
  return result;
};
try {
  const paid = makeOrder('Ada "Quoted"', "verified");
  const pending = makeOrder("Pending", "pending");
  makeOrder("Failed", "failed");
  for (const [url, method] of [
    ["/admin/stats", "GET"],
    ["/admin/attendees", "GET"],
    ["/admin/payments", "GET"],
    ["/admin/tickets", "POST"],
    ["/admin/menu", "POST"],
    ["/admin/event", "PUT"],
    ["/admin/export/all", "GET"],
    ["/export/paid-guestlist", "GET"],
    ["/guestlist/collation-summary", "GET"],
  ]) {
    assert.equal(
      (await req(url, method, method === "GET" ? undefined : {}, "")).status,
      401,
    );
    assertions++;
  }
  token = (
    await ok("/admin/login", "POST", {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    })
  ).token;
  const stats = await ok("/admin/stats");
  assert.equal(stats.totalRegistrations, 3);
  assert.equal(stats.totalConfirmedAttendees, 1);
  assert.equal(stats.totalVerifiedRevenue, 25000);
  assert.equal(stats.pendingOrdersCount, 1);
  assert.equal(stats.failedOrdersCount, 1);
  assert.equal(
    (
      await ok(
        "/admin/attendees?search=" + encodeURIComponent(paid.attendees[0].uuid),
      )
    ).total,
    1,
  );
  assert.equal(
    (
      await ok(
        "/admin/attendees?search=" + encodeURIComponent('Ada "Quoted" Audit'),
      )
    ).total,
    1,
  );
  assert.equal(
    (
      await ok(
        "/admin/attendees?ticketTierId=hideout-access&paymentStatus=verified",
      )
    ).total,
    1,
  );
  assert.equal((await ok("/admin/attendees?startDate=2099-01-01")).total, 0);
  assert.equal((await ok("/admin/attendees?endDate=2000-01-01")).total, 0);
  await ok(
    `/admin/attendees/${pending.attendees[0].uuid}/checkin`,
    "POST",
    {},
    400,
  );
  const checked = await ok(
    `/admin/attendees/${paid.attendees[0].uuid}/checkin`,
    "POST",
    {},
  );
  assert.equal(checked.attendee.checkedIn, true);
  assert.ok(checked.attendee.checkedInAt);
  assert.equal((await ok("/admin/attendees?checkedIn=true")).total, 1);
  assert.equal(
    (await ok(`/admin/attendees/${paid.attendees[0].uuid}/checkin`, "POST", {}))
      .attendee.checkedIn,
    false,
  );
  await ok("/admin/attendees/not-a-uuid/checkin", "POST", {}, 404);
  const detail = await ok(`/attendees/${paid.attendees[0].uuid}`);
  assert.ok(detail.attendee.qrSvg.includes("<svg"));
  for (const type of ["all", "paid", "tier", "filtered", "payments"]) {
    for (const format of type === "payments" ? ["xlsx"] : ["xlsx", "csv"]) {
      const query = `?format=${format}&tierId=hideout-access&paymentStatus=verified&search=Ada`;
      const response = await req(`/admin/export/${type}${query}`);
      assert.equal(response.status, 200);
      assertions++;
      const workbook = XLSX.read(Buffer.from(await response.arrayBuffer()), {
        type: format === "csv" ? "buffer" : "buffer",
        raw: true,
      });
      const rows = XLSX.utils.sheet_to_json<any>(
        workbook.Sheets[workbook.SheetNames[0]],
      );
      assert.equal(rows.length, ["paid", "filtered"].includes(type) ? 1 : 3);
      if (type !== "payments") {
        assert.equal(
          rows.find((row) => row["Attendee UUID"] === paid.attendees[0].uuid)?.[
            "First Name"
          ],
          'Ada "Quoted"',
        );
      }
    }
  }
  for (const format of ["xlsx", "csv"]) {
    const r = await req("/export/paid-guestlist?format=" + format);
    assert.equal(r.status, 200);
    assertions++;
  }
  assert.equal(
    (await ok("/guestlist/collation-summary")).paidAttendeesCount,
    1,
  );
  assert.equal((await ok("/admin/payments")).length, 3);
  const tier = {
    ...fallbackTicketTiers[1],
    code: "AUDIT",
    name: "Audit tier",
    availableQuantity: 10,
    inventoryUnlimited: false,
  };
  const created = await ok("/admin/tickets", "POST", tier, 201);
  await ok("/admin/tickets", "POST", tier, 400);
  await ok(
    "/admin/tickets",
    "POST",
    { ...tier, code: "INVALID", price: -1 },
    400,
  );
  await ok(`/admin/tickets/${created.id}`, "PUT", {
    price: 35000,
    guestsPerTicket: 2,
  });
  assert.equal(db.getTicketTierById(created.id)?.price, 35000);
  await ok(`/admin/tickets/${created.id}`, "PUT", { price: "bad" }, 400);
  await ok(`/admin/tickets/${created.id}`, "PUT", { guestsPerTicket: 0 }, 400);
  await ok(
    "/admin/tickets/hideout-access",
    "PUT",
    { inventoryUnlimited: false, availableQuantity: 0 },
    400,
  );
  await ok(`/admin/tickets/${created.id}`, "DELETE");
  assert.equal(db.getTicketTierById(created.id), undefined);
  await ok("/admin/tickets/hideout-access", "DELETE");
  assert.equal(db.getTicketTierById("hideout-access")?.isActive, false);
  assert.equal(
    db.getAttendeeByUuid(paid.attendees[0].uuid)?.firstName,
    'Ada "Quoted"',
  );
  const menu = await ok(
    "/admin/menu",
    "POST",
    {
      name: "Audit drink",
      description: "Fixture only",
      category: "Drinks",
      price: 1500,
      isAvailable: true,
    },
    201,
  );
  await ok(`/admin/menu/${menu.id}`, "PUT", {
    price: 2000,
    isAvailable: false,
  });
  assert.equal(db.getMenuItemById(menu.id)?.isAvailable, false);
  await ok(`/admin/menu/${menu.id}`, "PUT", { price: -1 }, 400);
  await ok(
    "/admin/menu",
    "POST",
    { name: "", category: "Food", description: "Invalid", price: 10 },
    400,
  );
  const reordered = await ok("/admin/menu/reorder", "POST", {
    orderedIds: [menu.id],
  });
  assert.equal(reordered[0].id, menu.id);
  await ok(`/admin/menu/${menu.id}`, "DELETE");
  assert.equal(db.getMenuItemById(menu.id), undefined);
  await ok("/admin/event", "PUT", {
    title: "Audit event title",
    venue: "Audit venue",
    organizerPhone: "+2348009990000",
  });
  assert.equal((await ok("/event")).title, "Audit event title");
  const persistedStore = new SQLiteStore(path.join(directory, "db.sqlite"));
  const persisted = persistedStore.load()!;
  persistedStore.close();
  assert.equal(persisted.event.venue, "Audit venue");
  assert.equal(persisted.orders.length, 3);
  const expired = Buffer.from(
    JSON.stringify({
      user: process.env.ADMIN_USERNAME,
      id: "expired",
      exp: Date.now() - 1000,
    }),
  ).toString("base64url");
  const expiredToken =
    expired +
    "." +
    crypto
      .createHmac("sha256", process.env.ADMIN_SESSION_SECRET!)
      .update(expired)
      .digest("base64url");
  assert.equal(
    (await req("/admin/stats", "GET", undefined, expiredToken)).status,
    401,
  );
  await ok("/admin/logout", "POST", {});
  assert.equal((await req("/admin/stats")).status, 401);
  for (let i = 0; i < 10; i++)
    assert.equal(
      (
        await req(
          "/admin/login",
          "POST",
          { username: "audit-admin", password: "wrong" },
          "",
        )
      ).status,
      401,
    );
  assert.equal(
    (
      await req(
        "/admin/login",
        "POST",
        { username: "audit-admin", password: "wrong" },
        "",
      )
    ).status,
    429,
  );
  assert.deepEqual(
    fs.readFileSync("data/db.json"),
    originalData,
    "Actual event database must remain unchanged",
  );
  console.log(
    `Admin audit passed (${assertions} endpoint checks): login, auth, stats, filters, check-in, details, all export variants, payments, ticket/menu CRUD, settings, persistence, expiry, logout and throttling.`,
  );
} finally {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  fs.rmSync(directory, { recursive: true, force: true });
}
