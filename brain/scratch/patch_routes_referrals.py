with open('server/routes.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imports from exports.js
code = code.replace(
    "  generatePaymentsExcel,\n} from './exports.js';",
    "  generatePaymentsExcel,\n  generateReferralsExcel,\n  generateReferralsCsv,\n} from './exports.js';"
)

# 2. Update /orders/initialize to read referralSurvey
old_extract = "const { ticketTierId, quantity, purchaser, attendees } = req.body;"
new_extract = "const { ticketTierId, quantity, purchaser, attendees, referralSurvey } = req.body;"
code = code.replace(old_extract, new_extract, 1)

old_create = """    const { order, attendees: createdAttendees } = await db.createPendingOrder({
      ticketTierId,
      quantity: qty,
      purchaser,
      attendees: Array.isArray(attendees) ? attendees : [],
      paymentReference: paymentRef,
    });"""

new_create = """    const { order, attendees: createdAttendees } = await db.createPendingOrder({
      ticketTierId,
      quantity: qty,
      purchaser,
      attendees: Array.isArray(attendees) ? attendees : [],
      paymentReference: paymentRef,
      referralSurvey: referralSurvey && typeof referralSurvey === 'object' ? {
        source: String(referralSurvey.source || 'Other').trim(),
        referralName: referralSurvey.referralName ? String(referralSurvey.referralName).trim() : undefined,
        otherDetails: referralSurvey.otherDetails ? String(referralSurvey.otherDetails).trim() : undefined,
        previouslyAttended: ['yes', 'no', 'not_sure'].includes(referralSurvey.previouslyAttended)
          ? referralSurvey.previouslyAttended
          : undefined,
      } : undefined,
    });"""
code = code.replace(old_create, new_create, 1)

# 3. Add admin routes for referral analytics and exports
analytics_routes = '''
// ==========================================
// REFERRAL QUESTIONNAIRE ANALYTICS (RESTRICTED TO AUTHENTICATED ADMINS)
// ==========================================

apiRouter.get('/admin/referrals/analytics', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, tierId, source } = req.query as {
      startDate?: string;
      endDate?: string;
      tierId?: string;
      source?: string;
    };

    const allOrders = await db.getOrders();

    // Deduplicate multiple payment attempts for same booking by grouping by orderReference
    // Rule: Avoid duplicate revenue attribution when a booking has multiple payment attempts.
    // Group orders by orderReference: if any attempt is verified, the booking is verified.
    const bookingMap = new Map<string, typeof allOrders[0]>();
    for (const o of allOrders) {
      const existing = bookingMap.get(o.orderReference);
      if (!existing) {
        bookingMap.set(o.orderReference, o);
      } else if (existing.paymentStatus !== 'verified' && o.paymentStatus === 'verified') {
        // Upgrade to verified
        bookingMap.set(o.orderReference, o);
      }
    }
    const uniqueBookings = Array.from(bookingMap.values());

    // Apply filters
    const filtered = uniqueBookings.filter((o) => {
      if (tierId && tierId !== 'ALL' && o.ticketTierId !== tierId) return false;
      const orderSource = o.referralSurvey?.source || 'Unspecified';
      if (source && source !== 'ALL' && orderSource.toLowerCase() !== source.toLowerCase()) return false;
      if (startDate) {
        const orderDate = o.createdAt.slice(0, 10);
        if (orderDate < startDate) return false;
      }
      if (endDate) {
        const orderDate = o.createdAt.slice(0, 10);
        if (orderDate > endDate) return false;
      }
      return true;
    });

    const paidBookings = filtered.filter((o) => o.paymentStatus === 'verified');
    const totalPaidRevenue = paidBookings.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalTicketsSold = paidBookings.reduce((sum, o) => sum + (o.ticketQuantity || 1), 0);

    // Source breakdown
    const ALL_SOURCES = [
      'Instagram',
      'TikTok',
      'Snapchat',
      'WhatsApp',
      'Facebook',
      'YouTube',
      'Friends & Family',
      'Influencers',
      'Event Promoters',
      'Ticket Vendors',
      'Posters',
      'Partner Brands',
      'Google Search',
      'Other',
    ];

    const sourceStats = new Map<string, { total: number; paid: number; tickets: number; revenue: number }>();
    for (const s of ALL_SOURCES) {
      sourceStats.set(s, { total: 0, paid: 0, tickets: 0, revenue: 0 });
    }

    for (const o of filtered) {
      const s = o.referralSurvey?.source || 'Other';
      if (!sourceStats.has(s)) {
        sourceStats.set(s, { total: 0, paid: 0, tickets: 0, revenue: 0 });
      }
      const st = sourceStats.get(s)!;
      st.total += 1;
      if (o.paymentStatus === 'verified') {
        st.paid += 1;
        st.tickets += o.ticketQuantity || 1;
        st.revenue += o.totalAmount || 0;
      }
    }

    const sourceBreakdown = Array.from(sourceStats.entries()).map(([srcName, data]) => ({
      source: srcName,
      totalBookings: data.total,
      paidBookings: data.paid,
      conversionRate: data.total > 0 ? Math.round((data.paid / data.total) * 100) : 0,
      totalTicketsSold: data.tickets,
      revenue: data.revenue,
    })).sort((a, b) => b.revenue - a.revenue || b.paidBookings - a.paidBookings);

    // Top referrers (from referralName)
    const referrerMap = new Map<string, { name: string; category: string; count: number; revenue: number }>();
    for (const o of paidBookings) {
      const name = o.referralSurvey?.referralName?.trim();
      if (name) {
        const key = `${name.toLowerCase()}||${o.referralSurvey?.source || ''}`;
        if (!referrerMap.has(key)) {
          referrerMap.set(key, {
            name,
            category: o.referralSurvey?.source || 'Referral',
            count: 0,
            revenue: 0,
          });
        }
        const item = referrerMap.get(key)!;
        item.count += 1;
        item.revenue += o.totalAmount || 0;
      }
    }
    const topReferrers = Array.from(referrerMap.values())
      .sort((a, b) => b.revenue - a.revenue || b.count - a.count)
      .slice(0, 20);

    // Prior attendance breakdown
    const priorAttendanceBreakdown = {
      yes: 0,
      no: 0,
      not_sure: 0,
      unspecified: 0,
    };
    for (const o of filtered) {
      const p = o.referralSurvey?.previouslyAttended;
      if (p === 'yes') priorAttendanceBreakdown.yes += 1;
      else if (p === 'no') priorAttendanceBreakdown.no += 1;
      else if (p === 'not_sure') priorAttendanceBreakdown.not_sure += 1;
      else priorAttendanceBreakdown.unspecified += 1;
    }

    const recentResponses = filtered
      .slice(-50)
      .reverse()
      .map((o) => ({
        orderId: o.id,
        orderReference: o.orderReference,
        customerName: `${o.customerFirstName} ${o.customerLastName}`,
        customerEmail: o.customerEmail,
        tierName: o.ticketTierName,
        amount: o.totalAmount,
        paymentStatus: o.paymentStatus,
        referral: o.referralSurvey || { source: 'Unspecified' },
        createdAt: o.createdAt,
      }));

    res.json({
      totalPaidBookings: paidBookings.length,
      totalPaidRevenue,
      totalTicketsSold,
      sourceBreakdown,
      topReferrers,
      priorAttendanceBreakdown,
      recentResponses,
    });
  } catch (err: any) {
    console.error('[Referral Analytics Error]', err);
    res.status(500).json({ error: 'Failed to compute referral analytics', message: err.message });
  }
});

apiRouter.get('/admin/referrals/export', requireAdmin, async (req: Request, res: Response) => {
  try {
    const format = req.query.format === 'csv' ? 'csv' : 'xlsx';
    const timestamp = new Date().toISOString().slice(0, 10);
    const { startDate, endDate, tierId, source, paidOnly } = req.query as {
      startDate?: string;
      endDate?: string;
      tierId?: string;
      source?: string;
      paidOnly?: string;
    };

    const allOrders = await db.getOrders();
    const bookingMap = new Map<string, typeof allOrders[0]>();
    for (const o of allOrders) {
      const existing = bookingMap.get(o.orderReference);
      if (!existing) {
        bookingMap.set(o.orderReference, o);
      } else if (existing.paymentStatus !== 'verified' && o.paymentStatus === 'verified') {
        bookingMap.set(o.orderReference, o);
      }
    }
    const uniqueBookings = Array.from(bookingMap.values());

    let filtered = uniqueBookings.filter((o) => {
      if (paidOnly === 'true' && o.paymentStatus !== 'verified') return false;
      if (tierId && tierId !== 'ALL' && o.ticketTierId !== tierId) return false;
      const orderSource = o.referralSurvey?.source || 'Unspecified';
      if (source && source !== 'ALL' && orderSource.toLowerCase() !== source.toLowerCase()) return false;
      if (startDate) {
        const orderDate = o.createdAt.slice(0, 10);
        if (orderDate < startDate) return false;
      }
      if (endDate) {
        const orderDate = o.createdAt.slice(0, 10);
        if (orderDate > endDate) return false;
      }
      return true;
    });

    if (format === 'csv') {
      const csvData = generateReferralsCsv(filtered);
      res.setHeader('Content-Disposition', `attachment; filename="Hideout_Referral_Analytics_${timestamp}.csv"`);
      res.setHeader('Content-Type', 'text/csv');
      return res.send(csvData);
    }

    const excelBuffer = generateReferralsExcel(filtered);
    res.setHeader('Content-Disposition', `attachment; filename="Hideout_Referral_Analytics_${timestamp}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(excelBuffer);
  } catch (err: any) {
    console.error('[Referral Export Error]', err);
    res.status(500).json({ error: 'Referral export generation failed', message: err.message });
  }
});
'''

code += '\n' + analytics_routes

with open('server/routes.ts', 'w', encoding='utf-8') as f:
    f.write(code)
print('server/routes.ts updated with referral endpoints')

