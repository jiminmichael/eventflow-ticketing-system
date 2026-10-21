import crypto from 'node:crypto';
import { requireAdmin, adminLogin, adminLogout } from './adminAuth.js';
import { Router, Request, Response, NextFunction } from 'express';
import { db } from './database.js';
import { paystack } from './paystack.js';
import {
  generateAttendeesExcel,
  generateAttendeesCsv,
  generatePaymentsExcel,
} from './exports.js';
import QRCode from 'qrcode';

export const apiRouter = Router();

// Quick Guestlist Collation & Summary for Party Organizers (RESTRICTED TO AUTHENTICATED ADMINS)
apiRouter.get('/guestlist/collation-summary', requireAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await db.getDashboardStats();
    const paidAttendees = await db.getAttendees({ paymentStatus: 'verified' });
    res.json({
      totalRevenue: stats.totalVerifiedRevenue,
      paidAttendeesCount: stats.totalConfirmedAttendees,
      totalOrders: stats.paidOrdersCount,
      totalInventory: stats.totalAvailableInventory,
      totalSold: stats.totalSoldTickets,
      tierBreakdown: stats.tierBreakdown,
      recentPaidGuests: paidAttendees.slice(0, 50).map((a) => ({
        uuid: a.uuid,
        ticketCode: a.ticketCode,
        fullName: `${a.firstName} ${a.lastName}`,
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        phone: a.phone,
        ticketTierId: a.ticketTierId,
        ticketTierName: a.ticketTierName,
        amount: a.unitPrice,
        orderReference: a.orderReference,
        paymentReference: a.paymentReference,
        checkedIn: a.checkedIn,
        checkedInAt: a.checkedInAt,
        createdAt: a.createdAt,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get collation summary', message: err.message });
  }
});

// Direct Export of Verified Paid Guests (Supports .xlsx and .csv - RESTRICTED TO AUTHENTICATED ADMINS)
apiRouter.get('/export/paid-guestlist', requireAdmin, async (req: Request, res: Response) => {
  try {
    const format = req.query.format === 'csv' ? 'csv' : 'xlsx';
    const timestamp = new Date().toISOString().slice(0, 10);
    const tierId = req.query.tierId as string | undefined;

    let paidAttendees = await db.getAttendees({ paymentStatus: 'verified' });
    if (tierId && tierId !== 'ALL') {
      paidAttendees = paidAttendees.filter((a) => a.ticketTierId === tierId);
    }

    if (format === 'csv') {
      const csvData = generateAttendeesCsv(paidAttendees);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="Hideout_Paid_Guestlist_${timestamp}.csv"`
      );
      res.setHeader('Content-Type', 'text/csv');
      return res.send(csvData);
    }

    const excelBuffer = generateAttendeesExcel(
      paidAttendees,
      'The Hideout - Paid Guestlist'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Hideout_Paid_Guestlist_${timestamp}.xlsx"`
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    return res.send(excelBuffer);
  } catch (err: any) {
    console.error('[Export Error]', err);
    res.status(500).json({ error: 'Export generation failed', message: err.message });
  }
});

// ==========================================
// PUBLIC EVENT & TICKET ENDPOINTS
// ==========================================

// Get Event Information
apiRouter.get('/event', async (req: Request, res: Response) => {
  try {
    const event = await db.getEvent();
    res.json(event);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch event data', message: err.message });
  }
});

// Get Ticket Tiers
apiRouter.get('/tickets', async (req: Request, res: Response) => {
  try {
    const tiers = await db.getTicketTiers();
    res.json(tiers);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch tickets', message: err.message });
  }
});

// ==========================================
// VIEW-ONLY EVENT MENU ENDPOINTS
// ==========================================

// Get Menu Items (strictly informational, view-only)
apiRouter.get('/menu', async (req: Request, res: Response) => {
  try {
    const items = await db.getMenuItems();
    res.json({
      notice: 'Viewing only. Items cannot be purchased online or added to ticket orders.',
      items,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch menu items', message: err.message });
  }
});

// ==========================================
// REGISTRATION & ORDER WORKFLOW
// ==========================================

/**
 * 1. Initialize Order & Paystack Transaction
 * Server validates availability and prices; client price is NEVER trusted.
 */
apiRouter.post('/orders/initialize', async (req: Request, res: Response) => {
  let reservedReference: string | undefined;
  try {
    if (!paystack.canAcceptPayments()) return res.status(503).json({message:'Online payments are not configured yet. Please contact the organizers.'});
    const { ticketTierId, quantity, purchaser, attendees } = req.body;

    // Validate purchaser input
    if (!purchaser?.firstName || !purchaser?.lastName || !purchaser?.email || !purchaser?.phone) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'First name, last name, valid email, and phone number are required.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(purchaser.email)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please provide a valid email address.',
      });
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Quantity must be at least 1 ticket.',
      });
    }

    // Generate unique payment reference
    const paymentRef = `HID-PAY-${crypto.randomUUID()}`;

    // Create pending order and reserve inventory (in a safe server transaction)
    const { order, attendees: createdAttendees } = await db.createPendingOrder({
      ticketTierId,
      quantity: qty,
      purchaser,
      attendees: Array.isArray(attendees) ? attendees : [],
      paymentReference: paymentRef,
    });

    reservedReference = paymentRef;

    // Initialize Paystack transaction using server-calculated amount in Kobo
    const amountInKobo = order.totalAmount * 100;
    const paystackResult = await paystack.initializeTransaction({
      email: order.customerEmail,
      amountInKobo,
      reference: paymentRef,
      callbackUrl: `${process.env.APP_URL || 'http://localhost:3000'}/order-confirmation?reference=${paymentRef}`,
      metadata: {
        orderReference: order.orderReference,
        ticketTierId: order.ticketTierId,
        ticketTierName: order.ticketTierName,
        quantity: order.ticketQuantity,
        customerName: `${order.customerFirstName} ${order.customerLastName}`,
      },
    });

    res.json({
      status: true,
      orderReference: order.orderReference,
      paymentReference: paymentRef,
      totalAmount: order.totalAmount,
      currency: 'NGN',
      paystack: paystackResult.data,
      isSandboxMode: paystackResult.isSandboxMode,
      publicKey: paystack.getPublicKey(),
    });
  } catch (err: any) {
    if (reservedReference) {
      try { await db.markPaymentFailed(reservedReference, 'Payment initialization failed'); }
      catch { console.error('[DB] Failed to release reservation after initialization error'); }
    }
    console.error('[API] /orders/initialize error:', err.message);
    res.status(400).json({ error: 'Order Initialization Failed', message: err.message });
  }
});

/**
 * 2. Verify Paystack Payment & Confirm Registration
 * Strictly verifies against Paystack API on server. Never trusts browser redirect alone.
 */
apiRouter.post('/orders/verify', async (req: Request, res: Response) => {
  try {
    const { reference, sandboxAction } = req.body;
    if (!reference) {
      return res.status(400).json({ error: 'Missing Reference', message: 'Payment reference is required.' });
    }

    const order = await db.getOrderByReference(reference);
    if (!order) {
      return res.status(404).json({ error: 'Not Found', message: 'Order reference not found in database.' });
    }

    // If order is already verified, return idempotent success
    if (order.paymentStatus === 'verified') {
      const attendees = await db.getAttendeesByOrderReference(order.orderReference);
      return res.json({
        status: true,
        alreadyConfirmed: true,
        message: 'Order already verified.',
        order,
        attendees,
      });
    }

    // Call Paystack verify on the server side
    const paystackResponse = await paystack.verifyTransaction(
      reference,
      order.totalAmount,
      sandboxAction === 'failed' ? 'failed' : 'success'
    );

    if (paystackResponse.data.status !== 'success') {
      await db.markPaymentFailed(reference, paystackResponse.data.gateway_response || 'Payment declined by provider');
      return res.status(400).json({
        status: false,
        message: 'Payment verification failed or was declined by Paystack.',
        details: paystackResponse.data.gateway_response,
      });
    }

    // Confirm payment and activate attendee records
    const confirmation = await db.confirmPayment({
      paymentReference: reference,
      channel: paystackResponse.data.channel,
      gatewayResponse: paystackResponse.data.gateway_response,
      paystackTransactionId: paystackResponse.data.id ? String(paystackResponse.data.id) : undefined,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    });

    res.json({
      status: true,
      message: 'Payment successfully verified and registration confirmed!',
      order: confirmation.order,
      attendees: confirmation.attendees,
    });
  } catch (err: any) {
    console.error('[API] /orders/verify error:', err.message);
    // A timeout or pending response is not proof of failure; preserve the reservation for a retry/webhook.
    res.status(400).json({
      status: false,
      error: 'Payment Verification Failed',
      message: err.message,
    });
  }
});

// The private order reference is the booking's access link. Never issue downloads for unpaid orders.
apiRouter.get('/orders/:reference/tickets', async (req: Request, res: Response) => {
  try {
  res.setHeader('Cache-Control', 'no-store');
  const order = await db.getOrderByReference(req.params.reference);
  if (!order) return res.status(404).json({message:'Booking not found. Check your reference or contact the organizers.'});
  if (order.paymentStatus !== 'verified') return res.status(403).json({message:'Payment has not been verified yet. Please check payment status or retry after a moment.'});
  const attendees = (await db.getAttendeesByOrderReference(order.orderReference)).filter(a=>a.paymentStatus==='verified');
  if (!attendees.length) return res.status(409).json({message:'Your guest records are not ready. Please contact the organizers.'});
  return res.json({event:await db.getEvent(),order,attendees});
  } catch {
    return res.status(503).json({message: 'Ticket storage is temporarily unavailable. Please retry.'});
  }
});

// Retrieve Order & Attendees for Confirmation Display or Printing
apiRouter.get('/orders/:reference', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const order = await db.getOrderByReference(reference);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const attendees = await db.getAttendeesByOrderReference(order.orderReference);

    // Generate QR codes for each confirmed attendee ticket
    const attendeesWithQr = await Promise.all(
      attendees.map(async (att) => {
        if (att.paymentStatus !== 'verified') return att;
        try {
          const qrPayload = JSON.stringify({
            uuid: att.uuid,
            code: att.ticketCode,
            name: `${att.firstName} ${att.lastName}`,
            tier: att.ticketTierName,
            order: att.orderReference,
          });
          const qrSvg = await QRCode.toString(qrPayload, { type: 'svg', margin: 1 });
          return { ...att, qrSvg };
        } catch {
          return att;
        }
      })
    );

    res.json({
      order,
      attendees: attendeesWithQr,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve order', message: err.message });
  }
});

// Paystack Webhook
apiRouter.post('/paystack/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    const isValid = paystack.verifyWebhookSignature((req as Request & { rawBody?: Buffer }).rawBody || '', signature);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body;
    if (event?.event === 'charge.success') {
      const data = event.data;
      if (data?.reference) {
        const order = await db.getOrderByReference(data.reference);
        if (!order) return res.status(200).json({received:true});
        if (data.amount !== order.totalAmount * 100 || data.currency !== 'NGN' || data.status !== 'success') {
          return res.status(400).json({error:'Webhook payment details do not match this order.'});
        }
        const verified = await paystack.verifyTransaction(data.reference, order.totalAmount);
        if (verified.data.status !== 'success') return res.status(400).json({error:'Payment is not successful.'});
        await db.confirmPayment({
          paymentReference: data.reference,
          channel: data.channel,
          gatewayResponse: data.gateway_response,
          paystackTransactionId: String(data.id),
        });
      }
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('[Paystack Webhook] error:', err.message);
    res.status(400).json({ error: 'Webhook processing error' });
  }
});

// Single attendee ticket verification (by UUID)
apiRouter.get('/attendees/:uuid', async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    const attendee = await db.getAttendeeByUuid(uuid);
    if (!attendee) {
      return res.status(404).json({ error: 'Attendee not found with provided UUID' });
    }

    const qrPayload = JSON.stringify({
      uuid: attendee.uuid,
      code: attendee.ticketCode,
      name: `${attendee.firstName} ${attendee.lastName}`,
      tier: attendee.ticketTierName,
      order: attendee.orderReference,
    });
    const qrSvg = await QRCode.toString(qrPayload, { type: 'svg', margin: 1 });

    res.json({ attendee: { ...attendee, qrSvg } });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch attendee', message: err.message });
  }
});

// ==========================================
// SECURE ADMIN DASHBOARD ENDPOINTS
// ==========================================

// Admin Login
apiRouter.post('/admin/login', adminLogin);
apiRouter.post('/admin/logout', requireAdmin, adminLogout);

// Dashboard Statistics Overview
apiRouter.get('/admin/stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await db.getDashboardStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve stats', message: err.message });
  }
});

// Searchable & Filterable Attendee Table
apiRouter.get('/admin/attendees', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { search, ticketTierId, paymentStatus, checkedIn, startDate, endDate } = req.query;

    const attendees = await db.getAttendees({
      search: search ? String(search) : undefined,
      ticketTierId: ticketTierId ? String(ticketTierId) : undefined,
      paymentStatus: paymentStatus ? String(paymentStatus) : undefined,
      checkedIn: checkedIn ? String(checkedIn) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
    });

    res.json({
      total: attendees.length,
      attendees,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch attendees', message: err.message });
  }
});

// Toggle Attendee Check-In
apiRouter.post('/admin/attendees/:uuid/checkin', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    const attendee = await db.toggleAttendeeCheckIn(uuid);
    if (!attendee) {
      return res.status(404).json({ error: 'Attendee not found' });
    }
    res.json({ success: true, attendee });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to update check-in', message: err.message });
  }
});

// Payment Audit Trail
apiRouter.get('/admin/payments', requireAdmin, async (req: Request, res: Response) => {
  try {
    const payments = await db.getPayments();
    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch payment audit logs', message: err.message });
  }
});

// Manage Ticket Tiers (Admin CRUD)
apiRouter.post('/admin/tickets', requireAdmin, async (req: Request, res: Response) => {
  try {
    const newTier = await db.createTicketTier(req.body);
    res.status(201).json(newTier);
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to create ticket tier', message: err.message });
  }
});

apiRouter.put('/admin/tickets/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await db.updateTicketTier(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Ticket tier not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to update ticket tier', message: err.message });
  }
});

apiRouter.delete('/admin/tickets/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const success = await db.deleteTicketTier(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Ticket tier not found or could not be removed' });
    }
    res.json({ success: true, message: 'Ticket tier removed or deactivated.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete ticket tier', message: err.message });
  }
});

// Manage Menu Items (Admin CRUD)
apiRouter.post('/admin/menu', requireAdmin, async (req: Request, res: Response) => {
  try {
    const newItem = await db.createMenuItem(req.body);
    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to create menu item', message: err.message });
  }
});

apiRouter.put('/admin/menu/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await db.updateMenuItem(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to update menu item', message: err.message });
  }
});

apiRouter.delete('/admin/menu/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const success = await db.deleteMenuItem(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ success: true, message: 'Menu item removed.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete menu item', message: err.message });
  }
});

apiRouter.post('/admin/menu/reorder', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds must be an array of IDs' });
    }
    const reordered = await db.reorderMenuItems(orderedIds);
    res.json(reordered);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reorder menu items', message: err.message });
  }
});

// Update Event Settings
apiRouter.put('/admin/event', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await db.updateEvent(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to update event settings', message: err.message });
  }
});

// ==========================================
// REAL SPREADSHEET EXPORTS (EXCEL & CSV)
// ==========================================

/**
 * Supported Export Types:
 * - all: All attendee records
 * - paid: Only verified, paid attendees
 * - tier: Attendees for a specific ticket category (pass ?tierId=xxx)
 * - filtered: Exact records matching current search & filters
 * - payments: Financial audit report with Paystack refs, amounts, statuses
 */
apiRouter.get('/admin/export/:type', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const format = req.query.format === 'csv' ? 'csv' : 'xlsx';
    const timestamp = new Date().toISOString().slice(0, 10);

    if (type === 'payments') {
      const payments = await db.getPayments();
      const excelBuffer = generatePaymentsExcel(payments);
      res.setHeader('Content-Disposition', `attachment; filename="Hideout_Payments_Report_${timestamp}.xlsx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(excelBuffer);
    }

    let attendees = await db.getAttendees();

    if (type === 'paid') {
      attendees = attendees.filter((a) => a.paymentStatus === 'verified');
    } else if (type === 'tier' && req.query.tierId) {
      attendees = attendees.filter((a) => a.ticketTierId === req.query.tierId);
    } else if (type === 'filtered') {
      attendees = await db.getAttendees({
        search: req.query.search ? String(req.query.search) : undefined,
        ticketTierId: req.query.ticketTierId ? String(req.query.ticketTierId) : undefined,
        paymentStatus: req.query.paymentStatus ? String(req.query.paymentStatus) : undefined,
        checkedIn: req.query.checkedIn ? String(req.query.checkedIn) : undefined,
        startDate: req.query.startDate ? String(req.query.startDate) : undefined,
        endDate: req.query.endDate ? String(req.query.endDate) : undefined,
      });
    }

    if (format === 'csv') {
      const csvData = generateAttendeesCsv(attendees);
      res.setHeader('Content-Disposition', `attachment; filename="Hideout_Attendees_${type}_${timestamp}.csv"`);
      res.setHeader('Content-Type', 'text/csv');
      return res.send(csvData);
    }

    const excelBuffer = generateAttendeesExcel(attendees, `Party Attendees - ${type.toUpperCase()}`);
    res.setHeader('Content-Disposition', `attachment; filename="Hideout_Attendees_${type}_${timestamp}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(excelBuffer);
  } catch (err: any) {
    console.error('[Export Error]', err);
    res.status(500).json({ error: 'Export generation failed', message: err.message });
  }
});
