# NaijaVibe Tech & Culture Summit 2026
## Event Ticketing, Paystack Payment, Registration & Admin Management System

A production-ready event ticketing, Paystack payment processing, view-only event menu, attendee registration, and secure administrative management platform.

---

## 🌟 Key Features

### 1. Public Event Website
- **Event Landing Page**: Rich summit branding, banner visuals, dates (November 14–15, 2026), Landmark Centre VI Lagos venue details, and live countdown timer.
- **Summit Programme**: Interactive 2-day session schedule filterable by stages (Main Plenary Hall, Tech Stage A, Culture Stage B).
- **Dynamic Ticket Tiers**: Configurable ticket categories (Early Bird Pass, Regular Attendee, VIP Delegate, VVIP Executive) with prices in Nigerian Naira (₦), real-time inventory tracking, and benefits breakdown.
- **Attendee Registration**: Group or individual registrations with purchaser info and individual ticket holder details.
- **Unique Backend UUIDs**: Every single ticket holder is assigned a backend-generated UUID v4 and human-readable ticket code.
- **Paystack Payment Integration**:
  - Server-calculated totals (client-side prices are never trusted).
  - Safe transactional inventory reservation.
  - Strict server-side verification using Paystack Secret Key.
  - Idempotent payment confirmation preventing duplicate issuance.
  - Webhook endpoint (`/api/paystack/webhook`) with HMAC SHA-512 signature validation.
  - Built-in test sandbox checkout supporting simulated debit cards, bank transfers, and USSD dial codes.
- **Printable Delegate Pass**: Confirmation card with attendee details, order reference, Paystack verified badge, and clean SVG QR Code for physical gate entrance scanning.

### 2. Available Event Menu (View-Only)
- Displayed **directly below the ticket registration and payment section** as required.
- Features authentic Nigerian cuisines (Smoky Party Jollof, Suya Platter, Shawarma), beverages (Signature Zobo Royale, Chapman Punch), and official summit merchandise.
- Displayed prices in Nigerian Naira (₦) and availability badges ("Available at Event" vs "Currently Unavailable").
- **Strictly informational**: No add-to-cart, no shopping carts, no checkout buttons, and zero linkage to ticket order totals.

### 3. Secure Admin Management Portal
- Protected behind authentication (`/api/admin/login`). Default credentials: `admin` / `Admin@2026!`.
- **Live Statistics Overview**: Total revenue in ₦, confirmed attendees, paid orders, pending/failed counts, inventory gauges, and recent activity.
- **Searchable & Filterable Attendees**: Live search across UUID, name, email, phone, order reference, and filters by ticket tier, payment status, and check-in status.
- **Entrance Gate Check-In**: Instant lookup and check-in scanner for attendees at the door with real timestamps.
- **Real Spreadsheet Exports**:
  - Export All Attendees (`.xlsx` & `.csv`)
  - Export Paid Attendees (`.xlsx` & `.csv`)
  - Export by Ticket Tier (`.xlsx` & `.csv`)
  - Export Current Filtered Records (`.xlsx` & `.csv`)
  - Export Payment Audit & Revenue Report (`.xlsx`)
  - Formatted with frozen header row, column widths, text-formatted UUIDs, and CSV/Excel formula injection sanitization.
- **Ticket Tier CRUD**: Create, update, or deactivate ticket tiers without touching code.
- **Event Menu Management**: Add, edit, delete, toggle availability, and reorder view-only menu items.
- **Event Settings**: Live editing of summit title, theme, date, venue, banner image, and FAQs.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend**: Node.js & Express with TypeScript (`server.ts`).
- **Database & Persistence**: Persistent file-backed transactional database (`data/db.json`) with atomic writes, UUID v4 keys, and mutex inventory safety.
- **Payment Processing**: Paystack API (Test Mode & Live Mode support).
- **Spreadsheet Generation**: SheetJS (`xlsx`) for `.xlsx` workbooks and RFC 4180 CSV generation.
- **QR Codes**: Server and client-side vector SVG QR generation (`qrcode`).

---

## ⚙️ Environment Variables

Configure these in `.env` (refer to `.env.example`):

| Variable | Description | Default / Example |
|---|---|---|
| `PAYSTACK_SECRET_KEY` | Paystack secret key from your dashboard | `sk_test_...` or leave empty for sandbox mode |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key for client integration | `pk_test_...` |
| `ADMIN_USERNAME` | Administrative username | `admin` |
| `ADMIN_PASSWORD` | Administrative password | `Admin@2026!` |
| `ADMIN_SESSION_SECRET` | Secret token for admin sessions | `naijavibe_admin_token_2026_secure` |
| `APP_URL` | Public application URL | `http://localhost:3000` |
| `PORT` | Web server listening port | `3000` |

---

## 🚀 Setup & Execution Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
The dev server launches on `http://localhost:3000`.

### 3. Run Automated Tests
```bash
npm test
```
Verifies backend inventory locking, UUID generation, Paystack server verification, view-only menu isolation, and spreadsheet export generation.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📋 API Endpoints Summary

- `GET /api/event`: Fetch live event details, schedule, and FAQs.
- `PUT /api/event`: Admin update summit configuration.
- `GET /api/tickets`: Fetch ticket tiers, prices (₦), and available inventory.
- `POST /api/tickets`: Admin create new ticket tier.
- `PUT /api/tickets/:id`: Admin update ticket tier.
- `DELETE /api/tickets/:id`: Admin deactivate/delete ticket tier.
- `GET /api/menu`: Fetch view-only event menu offerings.
- `POST /api/menu`: Admin create menu item.
- `PUT /api/menu/:id`: Admin update menu item.
- `DELETE /api/menu/:id`: Admin delete menu item.
- `POST /api/orders/initialize`: Validate input, reserve inventory, generate backend UUIDs, and initialize Paystack transaction.
- `POST /api/orders/verify`: Strictly verify transaction with Paystack on server, activate UUIDs, and confirm order.
- `GET /api/orders/:reference`: Retrieve verified ticket pass with vector QR code SVG.
- `POST /api/paystack/webhook`: Paystack charge webhook listener.
- `POST /api/admin/login`: Authenticate admin credentials and issue session token.
- `GET /api/admin/stats`: Real-time dashboard statistics and revenue breakdown.
- `GET /api/admin/attendees`: Search, filter, and paginate attendee database.
- `POST /api/admin/attendees/:uuid/checkin`: Toggle attendee check-in status at the entrance gate.
- `GET /api/admin/payments`: Immutable payment audit log.
- `GET /api/admin/export/:type`: Download fresh Excel (`.xlsx`) or CSV spreadsheets (`all`, `paid`, `tier`, `filtered`, `payments`).
