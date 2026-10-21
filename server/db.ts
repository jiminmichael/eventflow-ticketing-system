import { fallbackEvent, fallbackTicketTiers, fallbackMenuItems } from '../src/fallbackData.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import {
  EventDetails,
  TicketTier,
  Order,
  Attendee,
  MenuItem,
  PaymentAudit,
  DashboardStats,
  PaymentStatus,
} from '../src/types.js';

interface DatabaseSchema {
  event: EventDetails;
  ticketTiers: TicketTier[];
  orders: Order[];
  attendees: Attendee[];
  menuItems: MenuItem[];
  payments: PaymentAudit[];
}

const SEED_DATA_DIR = path.resolve(process.cwd(), 'data');
const SEED_DB_FILE = path.join(SEED_DATA_DIR, 'db.json');

// In serverless environments like Vercel, the root filesystem is read-only.
// Use temporary directory for writes when running in Vercel or serverless.
const DATA_DIR = process.env.DATA_DIR || (process.env.VERCEL
  ? path.join(os.tmpdir(), 'eventflow_data')
  : path.resolve(process.cwd(), 'data'));
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Default Seed Data for Party Platform
const initialEvent = fallbackEvent;
const initialTicketTiers = fallbackTicketTiers;
const initialMenuItems = fallbackMenuItems;

const initialOrders: Order[] = [
  {
    id: 'ord-seed-001',
    orderReference: 'ORD-2026-78421',
    customerFirstName: 'Chinedu',
    customerLastName: 'Okafor',
    customerEmail: 'chinedu.okafor@gmail.com',
    customerPhone: '+234 802 345 6789',
    institution: 'VIP Guest',
    ticketTierId: 'tier-vip',
    ticketTierName: 'VIP Party Pass',
    ticketQuantity: 2,
    unitPrice: 35000,
    totalAmount: 70000,
    currency: 'NGN',
    paymentStatus: 'verified',
    paymentReference: 'EVT-PAY-1718293041-CHK89',
    paystackTransactionId: 'pstk_tx_34892019',
    createdAt: '2026-10-12T10:15:30.000Z',
    verifiedAt: '2026-10-12T10:17:10.000Z',
    attendeeUuids: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
    paymentAuditLog: [
      {
        timestamp: '2026-10-12T10:15:30.000Z',
        action: 'ORDER_INITIALIZED',
        details: 'Order initiated for 2 VIP Party passes totaling ₦70,000.',
      },
      {
        timestamp: '2026-10-12T10:17:10.000Z',
        action: 'PAYSTACK_VERIFIED',
        details: 'Paystack verified successfully: NGN 70,000 confirmed (Ref: EVT-PAY-1718293041-CHK89).',
      },
    ],
  },
  {
    id: 'ord-seed-002',
    orderReference: 'ORD-2026-89104',
    customerFirstName: 'Amina',
    customerLastName: 'Yusuf',
    customerEmail: 'amina.yusuf@gmail.com',
    customerPhone: '+234 813 902 1144',
    institution: 'VVIP Table Host',
    ticketTierId: 'tier-vvip',
    ticketTierName: 'VVIP Cabana Table (Group of 5)',
    ticketQuantity: 1,
    unitPrice: 120000,
    totalAmount: 120000,
    currency: 'NGN',
    paymentStatus: 'verified',
    paymentReference: 'EVT-PAY-1718301192-AYU77',
    paystackTransactionId: 'pstk_tx_34892880',
    createdAt: '2026-10-13T14:20:00.000Z',
    verifiedAt: '2026-10-13T14:22:05.000Z',
    attendeeUuids: ['550e8400-e29b-41d4-a716-446655440003'],
    paymentAuditLog: [
      {
        timestamp: '2026-10-13T14:20:00.000Z',
        action: 'ORDER_INITIALIZED',
        details: 'Order initiated for 1 VVIP Cabana Table totaling ₦120,000.',
      },
      {
        timestamp: '2026-10-13T14:22:05.000Z',
        action: 'PAYSTACK_VERIFIED',
        details: 'Paystack verified successfully: NGN 120,000 confirmed (Ref: EVT-PAY-1718301192-AYU77).',
      },
    ],
  },
  {
    id: 'ord-seed-003',
    orderReference: 'ORD-2026-90412',
    customerFirstName: 'David',
    customerLastName: 'Balogun',
    customerEmail: 'david.balogun@gmail.com',
    customerPhone: '+234 705 441 2309',
    institution: 'Party Guest',
    ticketTierId: 'tier-regular',
    ticketTierName: 'Regular Party Pass',
    ticketQuantity: 1,
    unitPrice: 15000,
    totalAmount: 15000,
    currency: 'NGN',
    paymentStatus: 'verified',
    paymentReference: 'EVT-PAY-1718392811-DBG23',
    paystackTransactionId: 'pstk_tx_34899941',
    createdAt: '2026-10-14T09:40:10.000Z',
    verifiedAt: '2026-10-14T09:41:45.000Z',
    attendeeUuids: ['550e8400-e29b-41d4-a716-446655440004'],
    paymentAuditLog: [
      {
        timestamp: '2026-10-14T09:40:10.000Z',
        action: 'ORDER_INITIALIZED',
        details: 'Order initiated for 1 Regular Party Pass totaling ₦15,000.',
      },
      {
        timestamp: '2026-10-14T09:41:45.000Z',
        action: 'PAYSTACK_VERIFIED',
        details: 'Paystack verified successfully: NGN 15,000 confirmed (Ref: EVT-PAY-1718392811-DBG23).',
      },
    ],
  },
];

const initialAttendees: Attendee[] = [
  {
    uuid: '550e8400-e29b-41d4-a716-446655440001',
    ticketCode: 'LPF-VIP-74921',
    orderReference: 'ORD-2026-78421',
    orderId: 'ord-seed-001',
    ticketTierId: 'tier-vip',
    ticketTierName: 'VIP Party Pass',
    unitPrice: 35000,
    firstName: 'Chinedu',
    lastName: 'Okafor',
    email: 'chinedu.okafor@gmail.com',
    phone: '+234 802 345 6789',
    institution: 'VIP Guest',
    paymentStatus: 'verified',
    paymentReference: 'EVT-PAY-1718293041-CHK89',
    checkedIn: true,
    checkedInAt: '2026-10-15T09:12:00.000Z',
    createdAt: '2026-10-12T10:17:10.000Z',
  },
  {
    uuid: '550e8400-e29b-41d4-a716-446655440002',
    ticketCode: 'LPF-VIP-74922',
    orderReference: 'ORD-2026-78421',
    orderId: 'ord-seed-001',
    ticketTierId: 'tier-vip',
    ticketTierName: 'VIP Party Pass',
    unitPrice: 35000,
    firstName: 'Ngozi',
    lastName: 'Eze',
    email: 'ngozi.eze@gmail.com',
    phone: '+234 802 998 1122',
    institution: 'VIP Guest',
    paymentStatus: 'verified',
    paymentReference: 'EVT-PAY-1718293041-CHK89',
    checkedIn: false,
    createdAt: '2026-10-12T10:17:10.000Z',
  },
  {
    uuid: '550e8400-e29b-41d4-a716-446655440003',
    ticketCode: 'LPF-TABLE-89104',
    orderReference: 'ORD-2026-89104',
    orderId: 'ord-seed-002',
    ticketTierId: 'tier-vvip',
    ticketTierName: 'VVIP Cabana Table (Group of 5)',
    unitPrice: 120000,
    firstName: 'Amina',
    lastName: 'Yusuf',
    email: 'amina.yusuf@gmail.com',
    phone: '+234 813 902 1144',
    institution: 'Table Host',
    paymentStatus: 'verified',
    paymentReference: 'EVT-PAY-1718301192-AYU77',
    checkedIn: false,
    createdAt: '2026-10-13T14:22:05.000Z',
  },
  {
    uuid: '550e8400-e29b-41d4-a716-446655440004',
    ticketCode: 'LPF-REG-90412',
    orderReference: 'ORD-2026-90412',
    orderId: 'ord-seed-003',
    ticketTierId: 'tier-regular',
    ticketTierName: 'Regular Party Pass',
    unitPrice: 15000,
    firstName: 'David',
    lastName: 'Balogun',
    email: 'david.balogun@gmail.com',
    phone: '+234 705 441 2309',
    institution: 'Party Guest',
    paymentStatus: 'verified',
    paymentReference: 'EVT-PAY-1718392811-DBG23',
    checkedIn: true,
    checkedInAt: '2026-10-15T09:45:22.000Z',
    createdAt: '2026-10-14T09:41:45.000Z',
  },
];

const initialPayments: PaymentAudit[] = [
  {
    id: 'pay-001',
    orderReference: 'ORD-2026-78421',
    paymentReference: 'EVT-PAY-1718293041-CHK89',
    amount: 70000,
    currency: 'NGN',
    status: 'verified',
    channel: 'card',
    gatewayResponse: 'Successful card payment',
    ipAddress: '102.89.23.14',
    createdAt: '2026-10-12T10:15:30.000Z',
    verifiedAt: '2026-10-12T10:17:10.000Z',
    metadata: { purchaser: 'Chinedu Okafor', tier: 'VIP Party Pass' },
  },
  {
    id: 'pay-002',
    orderReference: 'ORD-2026-89104',
    paymentReference: 'EVT-PAY-1718301192-AYU77',
    amount: 120000,
    currency: 'NGN',
    status: 'verified',
    channel: 'bank_transfer',
    gatewayResponse: 'Transfer confirmed',
    ipAddress: '197.210.55.90',
    createdAt: '2026-10-13T14:20:00.000Z',
    verifiedAt: '2026-10-13T14:22:05.000Z',
    metadata: { purchaser: 'Amina Yusuf', tier: 'VVIP Cabana Table (Group of 5)' },
  },
  {
    id: 'pay-003',
    orderReference: 'ORD-2026-90412',
    paymentReference: 'EVT-PAY-1718392811-DBG23',
    amount: 15000,
    currency: 'NGN',
    status: 'verified',
    channel: 'card',
    gatewayResponse: 'Successful card payment',
    ipAddress: '102.88.19.4',
    createdAt: '2026-10-14T09:40:10.000Z',
    verifiedAt: '2026-10-14T09:41:45.000Z',
    metadata: { purchaser: 'David Balogun', tier: 'Regular Party Pass' },
  },
];

function validateCatalog(data: Partial<TicketTier & MenuItem>, kind: 'ticket' | 'menu', creating = false) {
  for (const key of kind === 'ticket' ? ['name', 'code'] : ['name', 'category', 'description']) {
    const value = (data as Record<string, unknown>)[key];
    if ((creating || value !== undefined) && (typeof value !== 'string' || !value.trim())) throw new Error(`${key} is required.`);
  }
  for (const key of ['price', 'availableQuantity', 'maxPerRegistration', 'guestsPerTicket', 'displayOrder']) {
    const value = (data as Record<string, unknown>)[key];
    if (value === undefined) { if (creating && key === 'price') throw new Error('Price is required.'); continue; }
    const minimum = ['maxPerRegistration', 'guestsPerTicket'].includes(key) ? 1 : 0;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || (key !== 'price' && !Number.isInteger(value))) throw new Error(`${key} must be a valid ${key === 'price' ? 'price' : 'whole number'}.`);
    if (key === 'guestsPerTicket' && value > 50) throw new Error('A package may register at most 50 guests.');
  }
  for (const key of ['isActive', 'isAvailable', 'inventoryUnlimited']) {
    const value = (data as Record<string, unknown>)[key];
    if (value !== undefined && typeof value !== 'boolean') throw new Error(`${key} must be true or false.`);
  }
}

class DatabaseService {
  private data: DatabaseSchema;
  private isLoaded = false;
  private writeLock = false;

  constructor() {
    this.data = {
      event: initialEvent,
      ticketTiers: initialTicketTiers,
      orders: initialOrders,
      attendees: initialAttendees,
      menuItems: initialMenuItems,
      payments: initialPayments,
    };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        this.data = {
          event: { ...initialEvent, ...(parsed.event || {}) },
          ticketTiers: parsed.ticketTiers || initialTicketTiers,
          orders: parsed.orders || initialOrders,
          attendees: parsed.attendees || initialAttendees,
          menuItems: parsed.menuItems || initialMenuItems,
          payments: parsed.payments || initialPayments,
        };
      } else if (fs.existsSync(SEED_DB_FILE)) {
        const fileContent = fs.readFileSync(SEED_DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        this.data = {
          event: { ...initialEvent, ...(parsed.event || {}) },
          ticketTiers: parsed.ticketTiers || initialTicketTiers,
          orders: parsed.orders || initialOrders,
          attendees: parsed.attendees || initialAttendees,
          menuItems: parsed.menuItems || initialMenuItems,
          payments: parsed.payments || initialPayments,
        };
        this.saveToDisk();
      } else {
        this.saveToDisk();
      }
      this.isLoaded = true;
    } catch (err) {
      console.error('[DB] Error initializing database file, using in-memory state:', err);
      this.isLoaded = true;
    }
  }

  private saveToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('[DB] Failed to persist data to disk:', err);
    }
  }

  // --- EVENT SETTINGS ---
  getEvent(): EventDetails {
    return this.data.event;
  }

  updateEvent(updates: Partial<EventDetails>): EventDetails {
    this.data.event = {
      ...this.data.event,
      ...updates,
      id: this.data.event.id, // preserve id
    };
    this.saveToDisk();
    return this.data.event;
  }

  // --- TICKET TIERS ---
  getTicketTiers(): TicketTier[] {
    return this.data.ticketTiers;
  }

  getTicketTierById(id: string): TicketTier | undefined {
    return this.data.ticketTiers.find((t) => t.id === id);
  }

  createTicketTier(tierData: Omit<TicketTier, 'id' | 'soldQuantity'>): TicketTier {
    validateCatalog(tierData, 'ticket', true);
    if (this.data.ticketTiers.some(t=>t.code.toUpperCase()===tierData.code.trim().toUpperCase())) throw new Error('A ticket tier with this code already exists.');
    const id = `tier-${uuidv4()}`;
    const newTier: TicketTier = {
      ...tierData,
      id,
      soldQuantity: 0,
      availableQuantity: Math.max(0, Number(tierData.availableQuantity) || 0),
      price: Math.max(0, Number(tierData.price) || 0),
      maxPerRegistration: Math.max(1, Number(tierData.maxPerRegistration) || 1),
      isActive: tierData.isActive ?? true,
      guestsPerTicket: Math.max(1, Math.min(50, Math.floor(Number(tierData.guestsPerTicket) || 1))),
      benefits: Array.isArray(tierData.benefits) ? tierData.benefits : [],
    };
    this.data.ticketTiers.push(newTier);
    this.saveToDisk();
    return newTier;
  }

  updateTicketTier(id: string, updates: Partial<TicketTier>): TicketTier | null {
    const index = this.data.ticketTiers.findIndex((t) => t.id === id);
    if (index === -1) return null;

    validateCatalog(updates, 'ticket');
    if (updates.code && this.data.ticketTiers.some(t=>t.id!==id && t.code.toUpperCase()===updates.code!.trim().toUpperCase())) throw new Error('A ticket tier with this code already exists.');
    const current = this.data.ticketTiers[index];
    if (updates.availableQuantity !== undefined && !(updates.inventoryUnlimited ?? current.inventoryUnlimited) && updates.availableQuantity < current.soldQuantity) throw new Error('Inventory cannot be lower than the number already reserved or sold.');
    const updatedTier: TicketTier = {
      ...current,
      ...updates,
      id: current.id, // immutable ID
      soldQuantity: current.soldQuantity,
      guestsPerTicket: updates.guestsPerTicket === undefined ? current.guestsPerTicket : Math.max(1, Math.min(50, Math.floor(Number(updates.guestsPerTicket) || 1))),
      price: updates.price !== undefined ? Math.max(0, Number(updates.price)) : current.price,
      availableQuantity:
        updates.availableQuantity !== undefined
          ? Math.max(current.soldQuantity, Number(updates.availableQuantity))
          : current.availableQuantity,
    };

    this.data.ticketTiers[index] = updatedTier;
    this.saveToDisk();
    return updatedTier;
  }

  deleteTicketTier(id: string): boolean {
    const tier = this.data.ticketTiers.find((t) => t.id === id);
    if (!tier) return false;
    // Preserve all historical order references, including failed orders.
    if (tier.soldQuantity > 0 || this.data.orders.some(o=>o.ticketTierId===id)) {
      tier.isActive = false;
      this.saveToDisk();
      return true;
    }
    this.data.ticketTiers = this.data.ticketTiers.filter((t) => t.id !== id);
    this.saveToDisk();
    return true;
  }

  // --- ORDERS & TRANSACTIONAL RESERVATION ---
  createPendingOrder(params: {
    ticketTierId: string;
    quantity: number;
    purchaser: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      institution?: string;
    };
    attendees: Array<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      institution?: string;
      notes?: string;
    }>;
    paymentReference: string;
  }): { order: Order; attendees: Attendee[] } {
    // 1. Fetch ticket tier from database - SERVER-SIDE TRUTH
    const tier = this.getTicketTierById(params.ticketTierId);
    if (!tier) {
      throw new Error('Selected ticket tier does not exist.');
    }
    if (!tier.isActive) {
      throw new Error('This ticket tier is currently inactive or not available for purchase.');
    }

    const availableSlots = tier.availableQuantity - tier.soldQuantity;
    if (!tier.inventoryUnlimited && params.quantity > availableSlots) {
      throw new Error(
        `Insufficient ticket inventory. Only ${availableSlots} ticket${availableSlots === 1 ? '' : 's'} remaining.`
      );
    }
    if (params.quantity > tier.maxPerRegistration) {
      throw new Error(`Maximum tickets allowed per registration is ${tier.maxPerRegistration}.`);
    }

    if (!Number.isInteger(params.quantity) || params.quantity < 1) throw new Error('Quantity must be a positive integer.');
    const guestCount = params.quantity * (tier.guestsPerTicket || 1);
    if (params.attendees.length !== guestCount || params.attendees.some(a =>
      typeof a.firstName !== 'string' || !a.firstName.trim() || typeof a.lastName !== 'string' || !a.lastName.trim() ||
      typeof a.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email) || typeof a.phone !== 'string' || a.phone.trim().length < 8)) {
      throw new Error(`Provide valid names and contact details for all ${guestCount} guests.`);
    }

    // 2. Server calculates price: never trust frontend
    const unitPrice = tier.price;
    const totalAmount = unitPrice * params.quantity;
    const orderRef = `ORD-${uuidv4()}`;
    const orderId = `ord-${uuidv4()}`;
    const timestamp = new Date().toISOString();

    // 3. Generate individual attendee records with unique backend UUIDs
    const createdAttendees: Attendee[] = [];
    const attendeeUuids: string[] = [];

    // Ensure we have an entry for each ticket quantity requested
    for (let i = 0; i < guestCount; i++) {
      const attendeeInput = params.attendees[i] || {
        firstName: params.purchaser.firstName,
        lastName: params.purchaser.lastName,
        email: params.purchaser.email,
        phone: params.purchaser.phone,
        institution: params.purchaser.institution,
      };

      const attendeeUuid = uuidv4();
      attendeeUuids.push(attendeeUuid);
      const ticketCode = `HID-${tier.code}-${uuidv4().slice(0, 8).toUpperCase()}`;

      const attendeeRecord: Attendee = {
        uuid: attendeeUuid,
        ticketCode,
        orderReference: orderRef,
        orderId,
        ticketTierId: tier.id,
        ticketTierName: tier.name,
        unitPrice: unitPrice / (tier.guestsPerTicket || 1),
        firstName: attendeeInput.firstName.trim(),
        lastName: attendeeInput.lastName.trim(),
        email: attendeeInput.email.trim().toLowerCase(),
        phone: attendeeInput.phone.trim(),
        institution: attendeeInput.institution?.trim() || params.purchaser.institution || '',
        additionalNotes: attendeeInput.notes?.trim() || '',
        paymentStatus: 'pending',
        paymentReference: params.paymentReference,
        checkedIn: false,
        createdAt: timestamp,
      };

      createdAttendees.push(attendeeRecord);
    }

    // 4. Create pending order
    const order: Order = {
      id: orderId,
      orderReference: orderRef,
      customerFirstName: params.purchaser.firstName.trim(),
      customerLastName: params.purchaser.lastName.trim(),
      customerEmail: params.purchaser.email.trim().toLowerCase(),
      customerPhone: params.purchaser.phone.trim(),
      institution: params.purchaser.institution?.trim() || '',
      ticketTierId: tier.id,
      ticketTierName: tier.name,
      ticketQuantity: params.quantity,
      unitPrice,
      totalAmount,
      currency: 'NGN',
      paymentStatus: 'pending',
      paymentReference: params.paymentReference,
      createdAt: timestamp,
      attendeeUuids,
      paymentAuditLog: [
        {
          timestamp,
          action: 'ORDER_INITIALIZED',
          details: `Order initialized for ${params.quantity} ${tier.name} ticket(s) totaling ₦${totalAmount.toLocaleString()} (Ref: ${params.paymentReference}).`,
        },
      ],
    };

    // 5. Reserve inventory safely
    tier.soldQuantity += params.quantity;

    // Save records
    this.data.orders.push(order);
    this.data.attendees.push(...createdAttendees);

    // Initial payment audit record
    this.data.payments.push({
      id: `pay-${uuidv4()}`,
      orderReference: orderRef,
      paymentReference: params.paymentReference,
      amount: totalAmount,
      currency: 'NGN',
      status: 'pending',
      createdAt: timestamp,
      metadata: {
        purchaser: `${params.purchaser.firstName} ${params.purchaser.lastName}`,
        tier: tier.name,
        quantity: params.quantity,
      },
    });

    this.saveToDisk();
    return { order, attendees: createdAttendees };
  }

  // Idempotent payment verification and confirmation
  confirmPayment(params: {
    paymentReference: string;
    channel?: string;
    gatewayResponse?: string;
    paystackTransactionId?: string;
    ipAddress?: string;
  }): { order: Order; attendees: Attendee[]; alreadyConfirmed: boolean } {
    const order = this.data.orders.find((o) => o.paymentReference === params.paymentReference);
    if (!order) {
      throw new Error(`Order with payment reference "${params.paymentReference}" not found.`);
    }

    const attendees = this.data.attendees.filter((a) => a.orderReference === order.orderReference);

    // If already verified, return idempotent response
    if (order.paymentStatus === 'verified') {
      return { order, attendees, alreadyConfirmed: true };
    }

    const timestamp = new Date().toISOString();

    if (order.paymentStatus === 'failed' || order.paymentStatus === 'abandoned') {
      const tier = this.getTicketTierById(order.ticketTierId);
      if (tier) tier.soldQuantity += order.ticketQuantity;
    }

    // Mark order as verified
    order.paymentStatus = 'verified';
    order.verifiedAt = timestamp;
    if (params.paystackTransactionId) {
      order.paystackTransactionId = params.paystackTransactionId;
    }
    order.paymentAuditLog.push({
      timestamp,
      action: 'PAYSTACK_VERIFIED',
      details: `Payment verified via Paystack. Channel: ${params.channel || 'online'}, Gateway: ${
        params.gatewayResponse || 'success'
      }. Total: ₦${order.totalAmount.toLocaleString()}`,
    });

    // Mark each attendee as verified
    for (const attendee of attendees) {
      attendee.paymentStatus = 'verified';
    }

    // Update payment audit record
    const payment = this.data.payments.find((p) => p.paymentReference === params.paymentReference);
    if (payment) {
      payment.status = 'verified';
      payment.verifiedAt = timestamp;
      payment.channel = params.channel;
      payment.gatewayResponse = params.gatewayResponse;
      payment.ipAddress = params.ipAddress;
    }

    this.saveToDisk();
    return { order, attendees, alreadyConfirmed: false };
  }

  // Handle failed or abandoned payment: release inventory
  markPaymentFailed(paymentReference: string, reason?: string) {
    const order = this.data.orders.find((o) => o.paymentReference === paymentReference);
    if (!order || order.paymentStatus === 'verified') return;

    // Release ticket inventory if order was pending
    if (order.paymentStatus === 'pending') {
      const tier = this.getTicketTierById(order.ticketTierId);
      if (tier) {
        tier.soldQuantity = Math.max(0, tier.soldQuantity - order.ticketQuantity);
      }
    }

    const timestamp = new Date().toISOString();
    order.paymentStatus = 'failed';
    order.paymentAuditLog.push({
      timestamp,
      action: 'PAYMENT_FAILED',
      details: `Payment failed or abandoned. Reason: ${reason || 'Transaction could not be verified'}`,
    });

    const attendees = this.data.attendees.filter((a) => a.orderReference === order.orderReference);
    for (const attendee of attendees) {
      attendee.paymentStatus = 'failed';
    }

    const payment = this.data.payments.find((p) => p.paymentReference === paymentReference);
    if (payment) {
      payment.status = 'failed';
      payment.gatewayResponse = reason;
    }

    this.saveToDisk();
  }

  getOrderByReference(reference: string): Order | undefined {
    return this.data.orders.find(
      (o) => o.orderReference === reference || o.paymentReference === reference
    );
  }

  getAttendeesByOrderReference(orderReference: string): Attendee[] {
    return this.data.attendees.filter((a) => a.orderReference === orderReference);
  }

  getAttendeeByUuid(uuid: string): Attendee | undefined {
    return this.data.attendees.find((a) => a.uuid === uuid);
  }

  toggleAttendeeCheckIn(uuid: string): Attendee | null {
    const attendee = this.data.attendees.find((a) => a.uuid === uuid);
    if (!attendee) return null;

    if (attendee.paymentStatus !== 'verified') throw new Error('Only guests with verified payments can be checked in.');
    attendee.checkedIn = !attendee.checkedIn;
    attendee.checkedInAt = attendee.checkedIn ? new Date().toISOString() : undefined;
    this.saveToDisk();
    return attendee;
  }

  // Filtered & Paginated Attendee query for Admin
  getAttendees(filter?: {
    search?: string;
    ticketTierId?: string;
    paymentStatus?: string;
    checkedIn?: string;
    startDate?: string;
    endDate?: string;
  }): Attendee[] {
    let result = [...this.data.attendees];

    if (!filter) return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.uuid.toLowerCase().includes(q) ||
          a.firstName.toLowerCase().includes(q) ||
          a.lastName.toLowerCase().includes(q) ||
          `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.phone.toLowerCase().includes(q) ||
          a.orderReference.toLowerCase().includes(q) ||
          a.ticketCode.toLowerCase().includes(q) ||
          a.ticketTierName.toLowerCase().includes(q)
      );
    }

    if (filter.ticketTierId && filter.ticketTierId !== 'ALL') {
      result = result.filter((a) => a.ticketTierId === filter.ticketTierId);
    }

    if (filter.paymentStatus && filter.paymentStatus !== 'ALL') {
      result = result.filter((a) => a.paymentStatus === filter.paymentStatus);
    }

    if (filter.checkedIn && filter.checkedIn !== 'ALL') {
      const isChecked = filter.checkedIn === 'true';
      result = result.filter((a) => a.checkedIn === isChecked);
    }

    if (filter.startDate) {
      const start = new Date(filter.startDate).getTime();
      result = result.filter((a) => new Date(a.createdAt).getTime() >= start);
    }

    if (filter.endDate) {
      const end = new Date(filter.endDate).getTime() + 86400000; // inclusive of end date
      result = result.filter((a) => new Date(a.createdAt).getTime() < end);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // --- MENU ITEMS (VIEW ONLY) ---
  getMenuItems(): MenuItem[] {
    return [...this.data.menuItems].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getMenuItemById(id: string): MenuItem | undefined {
    return this.data.menuItems.find((m) => m.id === id);
  }

  createMenuItem(itemData: Omit<MenuItem, 'id'>): MenuItem {
    validateCatalog(itemData, 'menu', true);
    const id = `menu-${uuidv4()}`;
    const newItem: MenuItem = {
      ...itemData,
      id,
      price: Math.max(0, Number(itemData.price) || 0),
      isAvailable: itemData.isAvailable ?? true,
      displayOrder: Number(itemData.displayOrder) || this.data.menuItems.length + 1,
    };
    this.data.menuItems.push(newItem);
    this.saveToDisk();
    return newItem;
  }

  updateMenuItem(id: string, updates: Partial<MenuItem>): MenuItem | null {
    const index = this.data.menuItems.findIndex((m) => m.id === id);
    if (index === -1) return null;

    validateCatalog(updates, 'menu');
    const current = this.data.menuItems[index];
    const updated: MenuItem = {
      ...current,
      ...updates,
      id: current.id,
      price: updates.price !== undefined ? Math.max(0, Number(updates.price)) : current.price,
    };
    this.data.menuItems[index] = updated;
    this.saveToDisk();
    return updated;
  }

  deleteMenuItem(id: string): boolean {
    const prevLen = this.data.menuItems.length;
    this.data.menuItems = this.data.menuItems.filter((m) => m.id !== id);
    if (this.data.menuItems.length !== prevLen) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  reorderMenuItems(orderedIds: string[]): MenuItem[] {
    const map = new Map(this.data.menuItems.map((m) => [m.id, m]));
    const reordered: MenuItem[] = [];

    orderedIds.forEach((id, idx) => {
      const item = map.get(id);
      if (item) {
        item.displayOrder = idx + 1;
        reordered.push(item);
        map.delete(id);
      }
    });

    // append any leftovers
    map.forEach((item) => {
      item.displayOrder = reordered.length + 1;
      reordered.push(item);
    });

    this.data.menuItems = reordered;
    this.saveToDisk();
    return this.getMenuItems();
  }

  // --- PAYMENTS AUDIT TRAIL ---
  getPayments(): PaymentAudit[] {
    return [...this.data.payments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // --- STATS OVERVIEW ---
  getDashboardStats(): DashboardStats {
    const confirmedAttendees = this.data.attendees.filter((a) => a.paymentStatus === 'verified');
    const paidOrders = this.data.orders.filter((o) => o.paymentStatus === 'verified');
    const pendingOrders = this.data.orders.filter((o) => o.paymentStatus === 'pending');
    const failedOrders = this.data.orders.filter((o) => o.paymentStatus === 'failed');

    const totalVerifiedRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const totalAvailableInventory = this.data.ticketTiers.reduce(
      (sum, t) => sum + t.availableQuantity,
      0
    );
    const totalSoldTickets = this.data.ticketTiers.reduce((sum, t) => sum + t.soldQuantity, 0);

    const tierBreakdown = this.data.ticketTiers.map((t) => {
      const tierPaidAttendees = confirmedAttendees.filter((a) => a.ticketTierId === t.id);
      const revenue = tierPaidAttendees.reduce((sum, a) => sum + a.unitPrice, 0);
      const percentSold =
        t.availableQuantity > 0 ? Math.round((t.soldQuantity / t.availableQuantity) * 100) : 0;
      return {
        id: t.id,
        name: t.name,
        price: t.price,
        available: t.availableQuantity,
        sold: t.soldQuantity,
        revenue,
        percentSold,
      };
    });

    const recentRegistrations = [...this.data.attendees]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return {
      totalRegistrations: this.data.attendees.length,
      totalConfirmedAttendees: confirmedAttendees.length,
      paidOrdersCount: paidOrders.length,
      pendingOrdersCount: pendingOrders.length,
      failedOrdersCount: failedOrders.length,
      totalVerifiedRevenue,
      totalAvailableInventory,
      totalSoldTickets,
      tierBreakdown,
      recentRegistrations,
    };
  }
}

export const db = new DatabaseService();
