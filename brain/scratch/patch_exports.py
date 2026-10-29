with open('server/exports.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# Add Order to imports
if 'Order' not in code:
    code = code.replace("from '../src/types.js';", ", Order } from '../src/types.js';")

referral_exports = '''
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

  return lines.join('\\n');
}
'''

code += '\n' + referral_exports

with open('server/exports.ts', 'w', encoding='utf-8') as f:
    f.write(code)
print('server/exports.ts updated with referral exports')

