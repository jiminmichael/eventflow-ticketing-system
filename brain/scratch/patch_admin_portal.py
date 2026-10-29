with open('src/components/AdminPortal.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Import ReferralAnalyticsTab & BarChart3
code = code.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { ReferralAnalyticsTab } from './ReferralAnalyticsTab.js';"
)

# 2. Add 'referrals' to activeTab type union
code = code.replace(
    "'overview' | 'attendees' | 'tiers' | 'menu' | 'payments' | 'checkin' | 'settings'",
    "'overview' | 'referrals' | 'attendees' | 'tiers' | 'menu' | 'payments' | 'checkin' | 'settings'"
)

# 3. Add Referrals sidebar tab button after Overview
old_sidebar = """              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-[var(--brand-violet)] via-[var(--brand-violet)] to-[var(--brand-blue)] text-[var(--ui-text)] font-bold shadow-sm'
                    : 'text-[var(--ui-text)] hover:text-[var(--ui-text)] hover:bg-[var(--ui-raised)]'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Overview & Metrics</span>
              </button>"""

new_sidebar = """              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-[var(--brand-violet)] via-[var(--brand-violet)] to-[var(--brand-blue)] text-[var(--ui-text)] font-bold shadow-sm'
                    : 'text-[var(--ui-text)] hover:text-[var(--ui-text)] hover:bg-[var(--ui-raised)]'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Overview & Metrics</span>
              </button>

              <button
                onClick={() => setActiveTab('referrals')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'referrals'
                    ? 'bg-gradient-to-r from-[#FF6B35] to-[#D84A1B] text-white font-bold shadow-sm'
                    : 'text-[var(--ui-text)] hover:text-[#FF8C42] hover:bg-[var(--ui-raised)]'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-[#FF8C42]" />
                <span>Referral Sources</span>
                <span className="ml-auto text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#FF6B35]/20 text-[#FF8C42] font-bold border border-[#FF6B35]/30">
                  New
                </span>
              </button>"""

code = code.replace(old_sidebar, new_sidebar, 1)

# 4. Insert ReferralAnalyticsTab component rendering
old_tab_target = """              {/* TAB 7: EVENT SETTINGS */}
              {activeTab === 'settings' && ("""

new_tab_target = """              {/* TAB: REFERRAL SOURCES & QUESTIONNAIRE ANALYTICS */}
              {activeTab === 'referrals' && (
                <ReferralAnalyticsTab adminToken={adminToken} tiers={tiers} />
              )}

              {/* TAB 7: EVENT SETTINGS */}
              {activeTab === 'settings' && ("""

code = code.replace(old_tab_target, new_tab_target, 1)

with open('src/components/AdminPortal.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('src/components/AdminPortal.tsx updated with ReferralAnalyticsTab')

