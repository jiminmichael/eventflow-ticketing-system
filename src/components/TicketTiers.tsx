import React, { useState } from 'react';
import {
  Check,
  Ticket,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TicketTier } from '../types.js';

interface TicketTiersProps {
  tiers: TicketTier[];
  selectedTierId: string;
  onSelectTier: (tier: TicketTier) => void;
}

export const TicketTiers: React.FC<TicketTiersProps> = ({
  tiers,
  selectedTierId,
  onSelectTier,
}) => {
  // Expanded benefits toggle state for mobile cards
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({});

  const toggleExpand = (tierId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTiers((prev) => ({
      ...prev,
      [tierId]: !prev[tierId],
    }));
  };

  const handleMobileSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = tiers.find((t) => t.id === e.target.value);
    if (selected) {
      onSelectTier(selected);
    }
  };

  return (
    <section id="tickets" className="py-20 bg-[#FAF7F2] text-[#0F291E] border-b border-[#E5DDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-3 border border-emerald-300">
            <Ticket className="w-3.5 h-3.5 text-emerald-700" />
            <span>OFFICIAL PARTY PASSES & VIP TABLES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F291E]">
            Choose Your Party Pass & Table
          </h2>
          <p className="mt-3 text-[#375245] text-sm sm:text-base leading-relaxed">
            All passes grant verified entry to the Lagos Party Fiesta with digital QR entry passes and instant Paystack online payment in Nigerian Naira (₦).
          </p>

          {/* Mobile Tier Jump Dropdown: Compact way to navigate/select on small screens */}
          <div className="mt-6 block sm:hidden">
            <label htmlFor="mobile-tier-select" className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
              Quick Select Pass:
            </label>
            <div className="relative">
              <select
                id="mobile-tier-select"
                value={selectedTierId}
                onChange={handleMobileSelectChange}
                className="w-full appearance-none py-3 px-4 rounded-xl bg-white border border-emerald-300 text-sm font-bold text-[#0F291E] focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              >
                {tiers.map((t) => (
                  <option key={t.id} value={t.id} disabled={t.soldQuantity >= t.availableQuantity || !t.isActive}>
                    {t.name} — ₦{t.price.toLocaleString('en-NG')} {t.soldQuantity >= t.availableQuantity ? '(Sold Out)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-emerald-700 absolute right-4 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => {
            const remaining = Math.max(0, tier.availableQuantity - tier.soldQuantity);
            const isSoldOut = remaining <= 0 || !tier.isActive;
            const isSelected = selectedTierId === tier.id;
            const isPopular = tier.badge === 'Popular' || tier.code === 'VIP' || tier.code === 'VVIP' || tier.badge === 'Most Popular';
            const percentSold =
              tier.availableQuantity > 0
                ? Math.round((tier.soldQuantity / tier.availableQuantity) * 100)
                : 100;
            const isUrgent = remaining > 0 && remaining <= 20;
            const isExpandedOnMobile = Boolean(expandedTiers[tier.id]);

            return (
              <div
                key={tier.id}
                onClick={() => !isSoldOut && onSelectTier(tier)}
                className={`relative flex flex-col rounded-3xl p-6 transition-all duration-200 border cursor-pointer select-none ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-600 shadow-xl shadow-emerald-900/10 ring-2 ring-emerald-500/50 transform -translate-y-1'
                    : isPopular
                    ? 'bg-white border-emerald-300 shadow-md hover:border-emerald-500 hover:-translate-y-1'
                    : 'bg-white border-[#E5DDD0] shadow-sm hover:border-emerald-400 hover:-translate-y-0.5'
                } ${isSoldOut ? 'opacity-55 cursor-not-allowed bg-[#F3EFE6] hover:transform-none' : ''}`}
                tabIndex={isSoldOut ? -1 : 0}
                role="button"
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isSoldOut) {
                    onSelectTier(tier);
                  }
                }}
              >
                {/* Badge if present */}
                {tier.badge && (
                  <div className="absolute -top-3 left-6">
                    <span
                      className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1 ${
                        isPopular
                          ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-[#FAF7F2] font-black'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {tier.badge}
                    </span>
                  </div>
                )}

                {/* Tier Name & Code */}
                <div className="mb-4">
                  <div className="text-[11px] uppercase font-code tracking-wider text-emerald-700 font-bold mb-1">
                    Pass Category: {tier.code}
                  </div>
                  <h3 className="text-xl font-bold text-[#0F291E]">{tier.name}</h3>
                  <p className="text-xs text-[#516E60] mt-1.5 min-h-[36px] line-clamp-2 leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="py-4 my-2 border-y border-[#E5DDD0]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-[#0F291E] tracking-tight font-code">
                      ₦{tier.price.toLocaleString('en-NG')}
                    </span>
                    <span className="text-xs text-emerald-700 font-medium">/ attendee</span>
                  </div>

                  {/* Visual Inventory Bar */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      {isSoldOut ? (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Sold Out
                        </span>
                      ) : isUrgent ? (
                        <span className="text-amber-700 font-bold flex items-center gap-1 animate-pulse">
                          <Zap className="w-3.5 h-3.5" />
                          Only {remaining} slots remaining!
                        </span>
                      ) : (
                        <span className="text-emerald-800 font-semibold flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-emerald-600" />
                          {remaining} of {tier.availableQuantity} left
                        </span>
                      )}
                      <span className="text-[#516E60] text-[10px] font-code">
                        Max {tier.maxPerRegistration}/order
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[#EAE4D8] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isSoldOut
                            ? 'bg-rose-500'
                            : isUrgent
                            ? 'bg-amber-500'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600'
                        }`}
                        style={{ width: `${Math.min(100, percentSold)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Benefits Checklist with Mobile Dropdown / Expand Toggle */}
                <div className="flex-1 space-y-2 mb-6 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    <span>Included Perks:</span>
                    {tier.benefits.length > 2 && (
                      <button
                        type="button"
                        onClick={(e) => toggleExpand(tier.id, e)}
                        className="sm:hidden text-[10px] text-emerald-700 underline font-semibold flex items-center gap-0.5 cursor-pointer"
                      >
                        {isExpandedOnMobile ? (
                          <>
                            <span>Less</span>
                            <ChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            <span>+{tier.benefits.length - 2} more</span>
                            <ChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {tier.benefits.map((benefit, bIdx) => {
                    const isHiddenOnMobile = bIdx >= 2 && !isExpandedOnMobile;
                    return (
                      <div
                        key={bIdx}
                        className={`items-start gap-2.5 text-xs text-[#2D4A3E] transition-all ${
                          isHiddenOnMobile ? 'hidden sm:flex' : 'flex'
                        }`}
                      >
                        <div className="mt-0.5 rounded-full p-0.5 bg-emerald-100 text-emerald-800 shrink-0 border border-emerald-300">
                          <Check className="w-3 h-3 text-emerald-700" />
                        </div>
                        <span className="leading-snug">{benefit}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Action CTA Button */}
                <button
                  type="button"
                  disabled={isSoldOut}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSoldOut) onSelectTier(tier);
                  }}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] ${
                    isSoldOut
                      ? 'bg-[#EAE4D8] text-[#8C9E95] cursor-not-allowed border border-[#D5CDC0]'
                      : isSelected
                      ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-[#FAF7F2] font-black shadow-md shadow-emerald-700/20'
                      : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 hover:border-emerald-500 shadow-sm'
                  }`}
                >
                  {isSoldOut ? (
                    'Sold Out'
                  ) : isSelected ? (
                    <>
                      <span>Selected for Checkout</span>
                      <Check className="w-4 h-4 text-[#FAF7F2]" />
                    </>
                  ) : (
                    <>
                      <span>Select This Tier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Security & Validation Guarantee */}
        <div className="mt-12 p-4 rounded-2xl bg-white border border-[#E5DDD0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#375245] shadow-sm">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              <strong className="text-[#0F291E]">Server-Authoritative Pricing:</strong> Ticket prices and inventory reservations are strictly verified on the server.
            </span>
          </div>
          <div className="flex items-center gap-3 text-emerald-700 font-code text-[11px] shrink-0 font-bold">
            <span>PAYSTACK VERIFIED CHECKOUT</span>
            <span>•</span>
            <span>SECURE ISSUANCE</span>
          </div>
        </div>
      </div>
    </section>
  );
};
