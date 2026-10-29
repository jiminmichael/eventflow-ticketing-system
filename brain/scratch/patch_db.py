with open('server/db.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imports to include ReferralSurvey
code = code.replace(
    '  PaymentStatus,\n} from \'../src/types.js\';',
    '  PaymentStatus,\n  ReferralSurvey,\n} from \'../src/types.js\';'
)

# 2. Add referralSurvey to createPendingOrder parameter
old_params = '''    paymentReference: string;
  }): { order: Order; attendees: Attendee[] } {'''
new_params = '''    paymentReference: string;
    referralSurvey?: ReferralSurvey;
  }): { order: Order; attendees: Attendee[] } {'''

code = code.replace(old_params, new_params, 1)

# 3. Add referralSurvey to order creation
old_order = '''      createdAt: timestamp,
      attendeeUuids,'''
new_order = '''      createdAt: timestamp,
      attendeeUuids,
      referralSurvey: params.referralSurvey,'''

code = code.replace(old_order, new_order, 1)

with open('server/db.ts', 'w', encoding='utf-8') as f:
    f.write(code)
print('server/db.ts updated successfully')

