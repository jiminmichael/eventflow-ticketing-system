/**
 * Shared Type Definitions for Event Ticketing, Registration & Management System
 */

export interface EventDetails {
  id: string;
  title: string;
  subtitle: string;
  theme: string;
  description: string;
  date: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  city: string;
  country: string;
  bannerImage: string;
  logoImage?: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  organizerPhoneSecondary?: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    hostInstagram?: string;
    linkedin?: string;
    website?: string;
  };
  schedule: Array<{
    time: string;
    title: string;
    speaker?: string;
    stage?: string;
    description?: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export interface TicketTier {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number; // in NGN (Nigerian Naira ₦)
  availableQuantity: number;
  soldQuantity: number;
  maxPerRegistration: number;
  salesStartDate: string;
  salesEndDate: string;
  benefits: string[];
  isActive: boolean;
  badge?: string;
  bookingOnly?: boolean;
  inventoryUnlimited?: boolean;
  guestsPerTicket?: number;
}

export type PaymentStatus = 'pending' | 'verified' | 'failed' | 'abandoned';

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  details: string;
}

export interface Order {
  id: string;
  orderReference: string; // e.g. ORD-2026-XXXXX
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  institution?: string;
  ticketTierId: string;
  ticketTierName: string;
  ticketQuantity: number;
  unitPrice: number; // in NGN
  totalAmount: number; // in NGN
  currency: 'NGN';
  paymentStatus: PaymentStatus;
  paymentReference: string;
  paystackTransactionId?: string;
  paymentAuditLog: AuditLogEntry[];
  createdAt: string;
  verifiedAt?: string;
  attendeeUuids: string[];
}

export interface Attendee {
  uuid: string; // Python/backend UUID v4
  ticketCode: string; // Human readable e.g. NVT-REG-8472
  orderReference: string;
  orderId: string;
  ticketTierId: string;
  ticketTierName: string;
  unitPrice: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  institution?: string;
  additionalNotes?: string;
  paymentStatus: PaymentStatus;
  paymentReference: string;
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string; // 'Food' | 'Drinks' | 'Refreshments' | 'Merchandise' | 'VIP Lounge'
  price: number; // Informational display price in NGN
  isAvailable: boolean;
  displayOrder: number;
  imageUrl?: string;
  dietaryOrTag?: string;
  ingredients?: string;
  boothLocation?: string;
}

export interface PaymentAudit {
  id: string;
  orderReference: string;
  paymentReference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  channel?: string;
  gatewayResponse?: string;
  ipAddress?: string;
  createdAt: string;
  verifiedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardStats {
  totalRegistrations: number;
  totalConfirmedAttendees: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  failedOrdersCount: number;
  totalVerifiedRevenue: number;
  totalAvailableInventory: number;
  totalSoldTickets: number;
  tierBreakdown: Array<{
    id: string;
    name: string;
    price: number;
    available: number;
    sold: number;
    revenue: number;
    percentSold: number;
  }>;
  recentRegistrations: Attendee[];
}
