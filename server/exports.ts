import * as XLSX from 'xlsx';
import { Attendee, PaymentAudit, Order } from '../src/types.js';

/**
 * Sanitizes cell values to prevent spreadsheet formula injection (CSV/Excel Injection).
 */
function sanitizeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // If value starts with formula trigger characters, prefix with single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Generates an Excel workbook buffer for attendees.
 */
export function generateAttendeesExcel(
  attendees: Attendee[],
  title = 'Summit Attendees Export'
): Buffer {
  const rows = attendees.map((a) => ({
    'Attendee UUID': sanitizeCell(a.uuid),
    'Ticket Code': sanitizeCell(a.ticketCode),
    'First Name': sanitizeCell(a.firstName),
    'Last Name': sanitizeCell(a.lastName),
    'Full Name': sanitizeCell(`${a.firstName} ${a.lastName}`),
    'Email Address': sanitizeCell(a.email),
    'Phone Number': sanitizeCell(a.phone),
    'Institution / Company': sanitizeCell(a.institution || 'N/A'),
    'Ticket Tier': sanitizeCell(a.ticketTierName),
    'Ticket Price (NGN)': a.unitPrice,
    'Order Reference': sanitizeCell(a.orderReference),
    'Payment Status': sanitizeCell(a.paymentStatus.toUpperCase()),
    'Payment Reference': sanitizeCell(a.paymentReference),
    'Checked In': a.checkedIn ? 'YES' : 'NO',
    'Checked In At': a.checkedInAt ? sanitizeCell(new Date(a.checkedInAt).toLocaleString('en-GB')) : 'N/A',
    'Registration Date': sanitizeCell(new Date(a.createdAt).toLocaleString('en-GB')),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [
      'Attendee UUID',
      'Ticket Code',
      'First Name',
      'Last Name',
      'Full Name',
      'Email Address',
      'Phone Number',
      'Institution / Company',
      'Ticket Tier',
      'Ticket Price (NGN)',
      'Order Reference',
      'Payment Status',
      'Payment Reference',
      'Checked In',
      'Checked In At',
      'Registration Date',
    ],
  });

  // Set explicit column widths for readability
  worksheet['!cols'] = [
    { wch: 38 }, // UUID
    { wch: 18 }, // Ticket Code
    { wch: 16 }, // First Name
    { wch: 16 }, // Last Name
    { wch: 24 }, // Full Name
    { wch: 30 }, // Email
    { wch: 20 }, // Phone
    { wch: 26 }, // Institution
    { wch: 24 }, // Ticket Tier
    { wch: 18 }, // Ticket Price
    { wch: 20 }, // Order Ref
    { wch: 16 }, // Status
    { wch: 30 }, // Payment Ref
    { wch: 12 }, // Checked In
    { wch: 22 }, // Checked In At
    { wch: 22 }, // Reg Date
  ];

  // Freeze top row
  worksheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendees');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Generates CSV string for attendees.
 */
function csvCell(value: unknown): string {
  return sanitizeCell(value).replace(/"/g, '""');
}

export function generateAttendeesCsv(attendees: Attendee[]): string {
  const headers = [
    'Attendee UUID',
    'Ticket Code',
    'First Name',
    'Last Name',
    'Full Name',
    'Email Address',
    'Phone Number',
    'Institution',
    'Ticket Tier',
    'Ticket Price (NGN)',
    'Order Reference',
    'Payment Status',
    'Payment Reference',
    'Checked In',
    'Checked In At',
    'Registration Date',
  ];

  const lines = [headers.join(',')];

  for (const a of attendees) {
    const row = [
      `"${csvCell(a.uuid)}"`,
      `"${csvCell(a.ticketCode)}"`,
      `"${csvCell(a.firstName)}"`,
      `"${csvCell(a.lastName)}"`,
      `"${csvCell(`${a.firstName} ${a.lastName}`)}"`,
      `"${csvCell(a.email)}"`,
      `"${csvCell(a.phone)}"`,
      `"${csvCell(a.institution || '')}"`,
      `"${csvCell(a.ticketTierName)}"`,
      a.unitPrice,
      `"${csvCell(a.orderReference)}"`,
      `"${csvCell(a.paymentStatus)}"`,
      `"${csvCell(a.paymentReference)}"`,
      `"${a.checkedIn ? 'YES' : 'NO'}"`,
      `"${a.checkedInAt || ''}"`,
      `"${a.createdAt}"`,
    ];
    lines.push(row.join(','));
  }

  return lines.join('\n');
}

/**
 * Generates an Excel workbook for payments report.
 */
export function generatePaymentsExcel(payments: PaymentAudit[]): Buffer {
  const rows = payments.map((p) => ({
    'Payment Reference': sanitizeCell(p.paymentReference),
    'Order Reference': sanitizeCell(p.orderReference),
    'Amount (NGN)': p.amount,
    'Currency': sanitizeCell(p.currency),
    'Status': sanitizeCell(p.status.toUpperCase()),
    'Payment Channel': sanitizeCell(p.channel || 'N/A'),
    'Gateway Response': sanitizeCell(p.gatewayResponse || 'N/A'),
    'IP Address': sanitizeCell(p.ipAddress || 'N/A'),
    'Purchaser / Notes': sanitizeCell(
      p.metadata ? `${(p.metadata as any).purchaser || ''} (${(p.metadata as any).tier || ''})` : ''
    ),
    'Created At': sanitizeCell(new Date(p.createdAt).toLocaleString('en-GB')),
    'Verified At': p.verifiedAt ? sanitizeCell(new Date(p.verifiedAt).toLocaleString('en-GB')) : 'N/A',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [
      'Payment Reference',
      'Order Reference',
      'Amount (NGN)',
      'Currency',
      'Status',
      'Payment Channel',
      'Gateway Response',
      'IP Address',
      'Purchaser / Notes',
      'Created At',
      'Verified At',
    ],
  });

  worksheet['!cols'] = [
    { wch: 32 },
    { wch: 20 },
    { wch: 16 },
    { wch: 10 },
    { wch: 14 },
    { wch: 18 },
    { wch: 28 },
    { wch: 18 },
    { wch: 30 },
    { wch: 22 },
    { wch: 22 },
  ];

  worksheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment Report');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}


/**
 * Generates an Excel workbook for referral analytics.
 */
export function generateReferralsExcel(
  orders: Order[],
  title = 'The Hideout - Referral Sources Report'
): Buffer {
  const rows = orders.map((o) => {
    const survey = o.referralSurvey;
    return {
      'Booking ID / Order Ref': sanitizeCell(o.orderReference),
      'Customer Name': sanitizeCell(`${o.customerFirstName} ${o.customerLastName}`),
      'Customer Email': sanitizeCell(o.customerEmail),
      'Customer Phone': sanitizeCell(o.customerPhone),
      'Ticket Tier': sanitizeCell(o.ticketTierName),
      'Quantity': o.ticketQuantity,
      'Unit Price (NGN)': o.unitPrice,
      'Total Amount (NGN)': o.totalAmount,
      'Payment Status': sanitizeCell(o.paymentStatus.toUpperCase()),
      'Payment Reference': sanitizeCell(o.paymentReference),
      'Referral Source': sanitizeCell(survey?.source || 'Unspecified'),
      'Referral Name / Detail': sanitizeCell(survey?.referralName || survey?.otherDetails || 'N/A'),
      'Other Explanation': sanitizeCell(survey?.otherDetails || 'N/A'),
      'Prior VybeCheck Attendance': sanitizeCell(
        survey?.previouslyAttended === 'yes'
          ? 'Yes'
          : survey?.previouslyAttended === 'no'
          ? 'No'
          : survey?.previouslyAttended === 'not_sure'
          ? 'Not Sure'
          : 'Not Specified'
      ),
      'Booking Date': sanitizeCell(new Date(o.createdAt).toLocaleString('en-GB')),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 24 }, // Order Ref
    { wch: 24 }, // Customer Name
    { wch: 30 }, // Customer Email
    { wch: 18 }, // Customer Phone
    { wch: 20 }, // Ticket Tier
    { wch: 10 }, // Quantity
    { wch: 16 }, // Unit Price
    { wch: 18 }, // Total Amount
    { wch: 16 }, // Payment Status
    { wch: 28 }, // Payment Ref
    { wch: 20 }, // Referral Source
    { wch: 24 }, // Referral Name
    { wch: 24 }, // Other Explanation
    { wch: 24 }, // Prior Attendance
    { wch: 22 }, // Booking Date
  ];
  worksheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Referral Analytics');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Generates CSV string for referral analytics.
 */
export function generateReferralsCsv(orders: Order[]): string {
  const headers = [
    'Booking ID',
    'Customer Name',
    'Customer Email',
    'Customer Phone',
    'Ticket Tier',
    'Quantity',
    'Unit Price (NGN)',
    'Total Amount (NGN)',
    'Payment Status',
    'Payment Reference',
    'Referral Source',
    'Referral Name',
    'Other Details',
    'Prior VybeCheck Attendance',
    'Booking Date',
  ];

  const lines = [headers.join(',')];

  for (const o of orders) {
    const survey = o.referralSurvey;
    const prior = survey?.previouslyAttended === 'yes'
      ? 'Yes'
      : survey?.previouslyAttended === 'no'
      ? 'No'
      : survey?.previouslyAttended === 'not_sure'
      ? 'Not Sure'
      : 'Not Specified';

    const row = [
      `"${csvCell(o.orderReference)}"`,
      `"${csvCell(`${o.customerFirstName} ${o.customerLastName}`)}"`,
      `"${csvCell(o.customerEmail)}"`,
      `"${csvCell(o.customerPhone)}"`,
      `"${csvCell(o.ticketTierName)}"`,
      o.ticketQuantity,
      o.unitPrice,
      o.totalAmount,
      `"${csvCell(o.paymentStatus)}"`,
      `"${csvCell(o.paymentReference)}"`,
      `"${csvCell(survey?.source || 'Unspecified')}"`,
      `"${csvCell(survey?.referralName || '')}"`,
      `"${csvCell(survey?.otherDetails || '')}"`,
      `"${csvCell(prior)}"`,
      `"${csvCell(o.createdAt)}"`,
    ];
    lines.push(row.join(','));
  }

  return lines.join('\n');
}
