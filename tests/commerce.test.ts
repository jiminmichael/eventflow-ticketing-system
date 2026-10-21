import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import express, { Request } from "express";
import * as XLSX from "xlsx";
import {
  fallbackEvent,
  fallbackTicketTiers,
  fallbackMenuItems,
} from "../src/fallbackData.js";
const directory = fs.mkdtempSync(path.join(os.tmpdir(), "hideout-commerce-"));
process.env.DATA_DIR = directory;
process.env.NODE_ENV = "test";
process.env.PAYSTACK_SECRET_KEY = "sk_test_integration_fixture";
process.env.PAYSTACK_SANDBOX = "false";
process.env.ADMIN_USERNAME = "test-organizer";
process.env.ADMIN_PASSWORD = crypto.randomBytes(24).toString("hex");
process.env.ADMIN_SESSION_SECRET = crypto.randomBytes(32).toString("hex");
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
const originalFetch = globalThis.fetch;
let failInitialize = false;
const providerTransactions = new Map<string, any>();
globalThis.fetch = async (input, options) => {
  const url = String(input);
  if (url === "https://api.paystack.co/transaction/initialize") {
    if (failInitialize)
      return Response.json(
        { status: false, message: "Provider unavailable" },
        { status: 503 },
      );
    const data = JSON.parse(String(options?.body));
    providerTransactions.set(data.reference, {
      reference: data.reference,
      amount: data.amount,
      currency: "NGN",
      status: "pending",
      channel: "card",
      id: 123,
    });
    return Response.json({
      status: true,
      data: {
        reference: data.reference,
        authorization_url: "https://checkout.paystack.com/test-fixture",
        access_code: "fixture",
      },
    });
  }
  if (url.startsWith("https://api.paystack.co/transaction/verify/"))
    return Response.json({
      status: true,
      data: providerTransactions.get(decodeURIComponent(url.split("/").pop()!)),
    });
  return originalFetch(input, options);
};
const { apiRouter } = await import("../server/routes.js");
const { db } = await import("../server/db.js");
const { PaystackService } = await import("../server/paystack.js");
const app = express();
app.use(
  express.json({
    verify: (req, _res, body) => {
      (req as Request & { rawBody?: Buffer }).rawBody = Buffer.from(body);
    },
  }),
);
app.use("/api", apiRouter);
const server = await new Promise<ReturnType<typeof app.listen>>((resolve) => {
  const s = app.listen(0, "127.0.0.1", () => resolve(s));
});
const address = server.address() as { port: number };
const base = `http://127.0.0.1:${address.port}/api`;
const request = (route: string, body?: unknown, token?: string) =>
  fetch(base + route, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
const guest = {
  firstName: "Ada",
  lastName: "Okafor",
  email: "ada@example.com",
  phone: "+2348012345678",
};
const booking = (id = "hideout-couple", quantity = 1) => ({
  ticketTierId: id,
  quantity,
  purchaser: guest,
  attendees:
    id === "hideout-couple"
      ? [guest, { ...guest, firstName: "Tobi" }]
      : [guest],
  price: 1,
  totalAmount: 1,
  menuItems: [{ id: "menu-1", quantity: 10 }],
});
try {
  assert.equal((await (await request("/menu")).json()).items.length, 8);
  for (const token of [
    "admin-session-active",
    "Admin@2026!",
    "naijavibe_admin_token_2026_secure",
  ])
    assert.equal(
      (await request("/admin/attendees", undefined, token)).status,
      401,
    );
  assert.equal(
    (await request("/export/paid-guestlist?token=admin-session-active")).status,
    401,
  );
  assert.equal(
    (
      await request("/admin/login", {
        username: "test-organizer",
        password: "wrong",
      })
    ).status,
    401,
  );
  const login = await (
    await request("/admin/login", {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    })
  ).json();
  assert.ok(login.token);
  assert.equal(
    (await request("/orders/initialize", booking("hideout-couple", 1.5)))
      .status,
    400,
  );
  assert.equal(
    (await request("/orders/initialize", { ...booking(), attendees: [guest] }))
      .status,
    400,
  );
  const result = await (await request("/orders/initialize", booking())).json();
  assert.equal(
    result.totalAmount,
    45000,
    "Only server ticket price is charged; menu/client price ignored",
  );
  assert.equal(
    result.paystack.authorization_url,
    "https://checkout.paystack.com/test-fixture",
  );
  const reference = result.paymentReference;
  const order = db.getOrderByReference(reference)!;
  assert.equal(order.attendeeUuids.length, 2);
  assert.equal(new Set(order.attendeeUuids).size, 2);
  assert.equal((await request("/orders/verify", { reference })).status, 400);
  assert.equal(
    order.paymentStatus,
    "pending",
    "Pending provider response must retain reservation",
  );
  const tx = providerTransactions.get(reference);
  tx.status = "success";
  tx.amount = 100;
  assert.equal((await request("/orders/verify", { reference })).status, 400);
  assert.equal(order.paymentStatus, "pending");
  tx.amount = 4500000;
  tx.currency = "USD";
  assert.equal((await request("/orders/verify", { reference })).status, 400);
  tx.currency = "NGN";
  tx.reference = "wrong-reference";
  assert.equal((await request("/orders/verify", { reference })).status, 400);
  tx.reference = reference;
  assert.equal((await request("/orders/verify", { reference })).status, 200);
  assert.equal(
    (await (await request("/orders/verify", { reference })).json())
      .alreadyConfirmed,
    true,
  );
  const guests = await (
    await request(
      "/admin/attendees?paymentStatus=verified",
      undefined,
      login.token,
    )
  ).json();
  assert.equal(guests.attendees.length, 2);
  assert.equal(guests.attendees[1].firstName, "Tobi");
  const pending = await (
    await request("/orders/initialize", booking("hideout-access"))
  ).json();
  const exported = await request(
    "/export/paid-guestlist?format=xlsx",
    undefined,
    login.token,
  );
  assert.equal(exported.status, 200);
  const workbook = XLSX.read(Buffer.from(await exported.arrayBuffer()), {
    type: "buffer",
  });
  const rows = XLSX.utils.sheet_to_json<any>(
    workbook.Sheets[workbook.SheetNames[0]],
  );
  assert.equal(rows.length, 2);
  assert.equal(rows[0]["Attendee UUID"], order.attendeeUuids[0]);
  assert.equal(rows[1]["Full Name"], "Tobi Okafor");
  const csv = await (
    await request("/export/paid-guestlist?format=csv", undefined, login.token)
  ).text();
  assert.ok(csv.includes(order.attendeeUuids[1]));
  assert.ok(!csv.includes(pending.paymentReference));
  assert.equal(
    (
      await request("/paystack/webhook", {
        event: "charge.success",
        data: providerTransactions.get(pending.paymentReference),
      })
    ).status,
    401,
  );
  const pendingTx = providerTransactions.get(pending.paymentReference);
  pendingTx.status = "success";
  const webhook = async (data: unknown) => {
    const raw = JSON.stringify({ event: "charge.success", data }, null, 2);
    const signature = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(raw)
      .digest("hex");
    return fetch(base + "/paystack/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-paystack-signature": signature,
      },
      body: raw,
    });
  };
  assert.equal((await webhook({ ...pendingTx, amount: 1 })).status, 400);
  assert.equal(
    (await webhook(pendingTx)).status,
    200,
    "Signature must verify the exact raw bytes, including whitespace",
  );
  assert.equal(
    db.getOrderByReference(pending.paymentReference)?.paymentStatus,
    "verified",
  );
  const before = db.getTicketTierById("hideout-access")!.soldQuantity;
  failInitialize = true;
  assert.equal(
    (await request("/orders/initialize", booking("hideout-access"))).status,
    400,
  );
  assert.equal(
    db.getTicketTierById("hideout-access")!.soldQuantity,
    before,
    "Failed initialization releases inventory",
  );
  failInitialize = false;
  const cabana = await (
    await request("/orders/initialize", booking("hideout-cabana"))
  ).json();
  assert.equal(cabana.totalAmount, 1000000);
  assert.equal(
    db.getOrderByReference(cabana.paymentReference)?.attendeeUuids.length,
    1,
  );
  await request("/admin/logout", {}, login.token);
  assert.equal(
    (await request("/admin/attendees", undefined, login.token)).status,
    401,
  );
  process.env.PAYSTACK_SECRET_KEY = "";
  process.env.PAYSTACK_SANDBOX = "true";
  process.env.NODE_ENV = "production";
  const unconfigured = new PaystackService();
  assert.equal(unconfigured.canAcceptPayments(), false);
  assert.equal(unconfigured.verifyWebhookSignature("{}", "invalid"), false);
  await assert.rejects(() => unconfigured.verifyTransaction("fake", 1));
  console.log(
    "Commerce integration passed: pricing, group UUIDs, Paystack verification, raw webhooks, auth/logout, paid-only XLSX/CSV, failed initialization, production sandbox guard.",
  );
} finally {
  globalThis.fetch = originalFetch;
  await new Promise<void>((resolve) => server.close(() => resolve()));
  fs.rmSync(directory, { recursive: true, force: true });
}
