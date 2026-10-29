import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('--- TESTING REFERRAL QUESTIONNAIRE & BACKEND INTEGRATION ---');
  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  let tiers = [];
  await check('Verify Sunset Deck tier name in /api/tickets', async () => {
    const res = await fetch(`${BASE_URL}/api/tickets`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    tiers = await res.json();
    const vvip = tiers.find(t => t.code === 'VVIP');
    if (!vvip) throw new Error('VVIP code not found');
    if (vvip.name !== 'Sunset Deck') throw new Error(`Expected name "Sunset Deck", got "${vvip.name}"`);
  });

  await check('Order Initialization with Referral Questionnaire Attached', async () => {
    const tier = tiers[0];
    const res = await fetch(`${BASE_URL}/api/orders/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketTierId: tier.id,
        quantity: 1,
        purchaser: {
          firstName: 'Referral',
          lastName: 'Tester',
          email: 'referral.test@example.com',
          phone: '+2348099887766',
          instagram: 'referral_insta'
        },
        attendees: [
          {
            firstName: 'Referral',
            lastName: 'Tester',
            email: 'referral.test@example.com',
            phone: '+2348099887766'
          }
        ],
        referralSurvey: {
          source: 'Instagram',
          previouslyAttended: 'yes'
        }
      })
    });
    const json = await res.json();
    if (!res.ok && res.status !== 503) {
      throw new Error(`HTTP ${res.status}: ${JSON.stringify(json)}`);
    }
    if (res.ok && !json.orderReference) {
      throw new Error('Order reference missing');
    }
  });

  // Admin endpoints require authentication
  await check('Referral Analytics Admin Guard', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/referrals/analytics`);
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
  });

  await check('Referral Export Admin Guard', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/referrals/export?format=csv`);
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
  });

  console.log(`\n================================`);
  console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
  console.log(`================================`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

