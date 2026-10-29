with open('src/types.ts', 'r', encoding='utf-8') as f:
    types = f.read()

referral_types = '''
export type ReferralSource =
  | 'Instagram'
  | 'TikTok'
  | 'Snapchat'
  | 'WhatsApp'
  | 'Facebook'
  | 'YouTube'
  | 'Friends & Family'
  | 'Influencers'
  | 'Event Promoters'
  | 'Ticket Vendors'
  | 'Posters'
  | 'Partner Brands'
  | 'Google Search'
  | 'Other';

export interface ReferralSurvey {
  source: ReferralSource | string;
  referralName?: string;
  otherDetails?: string;
  previouslyAttended?: 'yes' | 'no' | 'not_sure';
}

export interface ReferralAnalyticsSummary {
  totalPaidBookings: number;
  totalPaidRevenue: number;
  totalTicketsSold: number;
  sourceBreakdown: Array<{
    source: string;
    totalBookings: number;
    paidBookings: number;
    conversionRate: number; // percentage
    totalTicketsSold: number;
    revenue: number;
  }>;
  topReferrers: Array<{
    name: string;
    category: string;
    count: number;
    revenue: number;
  }>;
  priorAttendanceBreakdown: {
    yes: number;
    no: number;
    not_sure: number;
    unspecified: number;
  };
  recentResponses: Array<{
    orderId: string;
    orderReference: string;
    customerName: string;
    customerEmail: string;
    tierName: string;
    amount: number;
    paymentStatus: PaymentStatus;
    referral: ReferralSurvey;
    createdAt: string;
  }>;
}
'''

if 'export interface ReferralSurvey' not in types:
    types += '\n' + referral_types

# Also add referralSurvey to Order interface
if 'referralSurvey?: ReferralSurvey;' not in types:
    types = types.replace(
        '  attendeeUuids: string[];\n}',
        '  attendeeUuids: string[];\n  referralSurvey?: ReferralSurvey;\n}'
    ).replace(
        '  attendeeUuids: string[];\r\n}',
        '  attendeeUuids: string[];\r\n  referralSurvey?: ReferralSurvey;\r\n}'
    )

with open('src/types.ts', 'w', encoding='utf-8') as f:
    f.write(types)
print('Updated src/types.ts with ReferralSurvey & Order interface')

