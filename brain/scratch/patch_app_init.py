with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imports
code = code.replace(
    "import { EventDetails, TicketTier, MenuItem, Order, Attendee } from './types.js';",
    "import { EventDetails, TicketTier, MenuItem, Order, Attendee, ReferralSurvey } from './types.js';"
)

# 2. Update handleInitializePayment parameter type
old_init = '''  // 1. Initialize Order with Server-Side Price Calculation & Reserve Inventory
  const handleInitializePayment = async (orderData: {
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
  }) => {'''

new_init = '''  // 1. Initialize Order with Server-Side Price Calculation & Reserve Inventory
  const handleInitializePayment = async (orderData: {
    ticketTierId: string;
    quantity: number;
    purchaser: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      institution?: string;
      instagram?: string;
    };
    attendees: Array<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      institution?: string;
      notes?: string;
    }>;
    referralSurvey?: ReferralSurvey;
  }) => {'''

code = code.replace(old_init, new_init, 1)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('src/App.tsx updated with ReferralSurvey type')

