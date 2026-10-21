# The Hideout — Pool Edition

React/Vite event site with an Express backend, Paystack-hosted checkout, individual guest UUIDs/QR passes, administrator login and Excel/CSV exports.

## Run locally

```sh
npm ci
cp .env.example .env # Only if .env does not already exist.
# Configure the environment values below.
npm run dev
```

Open `http://localhost:3000`. Administrator sign-in is at `/admin` or **Organizer access** in the footer. A unique local administrator password and session secret have been generated in the ignored `.env` for this workspace. Do not commit that file.

## Configuration

| Variable | Purpose |
| --- | --- |
| `APP_URL` | Public origin used for the Paystack return URL; use HTTPS on the deployed site. |
| `PAYSTACK_SECRET_KEY` | Paystack `sk_test_…` or `sk_live_…` secret, used only on the server. Hosted checkout does not require a public key. |
| `PAYSTACK_SANDBOX` | Explicit local simulation when `true`; disabled in production. Defaults to `false`. |
| `ADMIN_USERNAME` | Organizer login username. |
| `ADMIN_PASSWORD` | Private organizer password. No built-in/default password is accepted. |
| `ADMIN_SESSION_SECRET` | At least 32 characters; generate with `openssl rand -hex 32`. Sessions expire after eight hours. |
| `DATA_DIR` | Optional persistent directory containing `db.json`; defaults to the local `data` directory. |
| `PORT` | Local server port, default `3000`. |

Set the Paystack webhook URL to `https://your-domain/api/paystack/webhook`. The return URL is `/order-confirmation?reference=…`. Both return verification and signed webhooks verify the transaction on the backend before issuing confirmed passes. See [Paystack's checkout guide](https://paystack.com/docs/payments/accept-payments/) and [webhook guide](https://paystack.com/docs/payments/webhooks/).

Without a Paystack secret, real checkout reports that payments are not configured; it does not silently approve payments. Use a Paystack test key to exercise provider checkout before adding a live key. Local simulation is explicitly labelled and never collects card details.

After successful payment verification, guests are redirected to `/tickets/<order-reference>`. Each guest can download a PNG image or PDF containing their contact details, UUID, QR code, event information and payment references. Group bookings also offer a PDF with one page per guest. VVIP/Cabana downloads are paid package confirmations pending team follow-up. **Find My Pass** reopens the download page for verified bookings. Treat the download link as private: anyone with that link can access the booking's tickets. Pending payments cannot download tickets.

## Tickets and guests

| Ticket/package | Price | Registered people |
| --- | ---: | --- |
| With your PVC | ₦15,000 | One guest per ticket |
| Access | ₦25,000 | One guest per ticket |
| Couple | ₦45,000 | Two guests per package |
| VIP · Table of 2 | ₦100,000 | Two guests per package |
| VVIP | ₦250,000 | Booking contact; team follows up on guest arrangements |
| Cabana | ₦1,000,000 | Booking contact; team follows up on guest arrangements |

Every registered person/contact has a distinct backend UUID. Couple and VIP packages collect both guests' details and issue two passes for one package price. VVIP and Cabana confirmations explain the required team follow-up; the contact record is not a promise about package capacity.

No inventory limits have been provided. The six Hideout tiers have **No inventory limit set** enabled. Organizers can disable that option and set capacity, price, guest count and active status under **Ticket Tiers**. Quantity is measured in tickets/packages, not guests. The default per-order limit is five.

The restored eight-item menu is display-only, below registration. It has no checkout/cart controls and cannot add items to a ticket payment.

## Administration and exports

The admin dashboard opens on **Attendees & UUIDs**, filtered to verified payments. It displays names, full UUIDs, email/phone, tier, payment status, reference and check-in state. Search and filter the list, then export the filtered selection as XLSX or CSV. The overview and paid-guest export also provide paid-only downloads. VVIP/Cabana rows supply booking contacts for team follow-up.

All admin lists, mutations and exports require an authenticated bearer session. Passwords and known demo strings are not accepted as tokens. Exports use authorization headers, not URL credentials. Logout revokes the session on the running backend; session revocations and login throttling are process-local.

## Persistence and deployment

This backend currently uses a JSON store intended for **one persistent server process**. Mount a durable disk at `DATA_DIR`, back it up, and keep secrets in the host's environment. Run `npm run build`, then `NODE_ENV=production npm start`.

The existing Vercel adapter uses temporary filesystem storage. **Do not use that temporary store for real paid bookings**: it is not durable or shared across instances. A transactional hosted database is required before deploying payment processing to Vercel or multiple backend instances. The included rewrite routes support `/admin`, the Paystack return page and ticket downloads, but do not solve storage persistence.

Existing historical orders, attendees and payments are preserved. Legacy ticket tiers are inactive; historical records remain available to administrators.

## Checks

```sh
npm run lint
npm run build
npm test
```

Tests use temporary databases and mocked Paystack API responses; they do not charge money or mutate the organizer's records. Coverage includes server pricing, package guest counts and UUIDs, pending/mismatched payment rejection, signed raw-body webhooks, repeated verification, paid-only XLSX/CSV, auth bypass rejection, logout and failed initialization inventory recovery. A real Paystack transaction still requires configured credentials and provider testing.
