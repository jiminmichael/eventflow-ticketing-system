import React from 'react';
import { Check, Ticket, AlertCircle, ArrowRight, ShieldCheck, Zap, Users, Sparkles, Flame } from 'lucide-react';
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
  return (
    <section id="tickets" className="py-20 bg-[#0B0614] text-[#FAF5FF] border-b border-[#3B2363]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E1038] text-[#DDD6FE] text-xs font-bold mb-3 border border-[#7C3AED]/50">
            <Ticket className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>OFFICIAL PARTY PASSES & VIP TABLES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Choose Your Party Pass & Table
          </h2>
          <p className="mt-3 text-zinc-300 text-sm sm:text-base leading-relaxed">
            All passes grant verified entry to the Lagos Party Fiesta with digital QR entry passes and instant Paystack online payment in Nigerian Naira (₦).
          </p>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => {
            const remaining = Math.max(0, tier.availableQuantity - tier.soldQuantity);
            const isSoldOut = remaining <= 0 || !tier.isActive;
            const isSelected = selectedTierId === tier.id;
            const isPopular = tier.badge === 'Popular' || tier.code === 'VIP' || tier.code === 'VVIP';
            const percentSold =
              tier.availableQuantity > 0
                ? Math.round((tier.soldQuantity / tier.availableQuantity) * 100)
                : 100;
            const isUrgent = remaining > 0 && remaining <= 20;

            return (
              <div
                key={tier.id}
                onClick={() => !isSoldOut && onSelectTier(tier)}
                className={`relative flex flex-col rounded-3xl p-6 transition-all duration-200 border cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#1D1036] border-[#EA580C] shadow-2xl shadow-[#EA580C]/25 ring-2 ring-[#EA580C]/70 transform -translate-y-1'
                    : isPopular
                    ? 'bg-[#140A26] border-[#7C3AED]/60 shadow-lg shadow-[#7C3AED]/20 hover:border-[#A78BFA] hover:-translate-y-1'
                    : 'bg-[#140A26]/80 border-[#3B2363] hover:border-[#7C3AED] hover:-translate-y-0.5'
                } ${isSoldOut ? 'opacity-60 cursor-not-allowed hover:transform-none' : ''}`}
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
                      className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md flex items-center gap-1 ${
                        isPopular
                          ? 'bg-[#EA580C] text-white'
                          : 'bg-[#7C3AED] text-white'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {tier.badge}
                    </span>
                  </div>
                )}

                {/* Tier Name & Code */}
                <div className="mb-4">
                  <div className="text-[11px] uppercase font-code tracking-wider text-[#A78BFA] font-bold mb-1">
                    Pass Category: {tier.code}
                  </div>
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  <p className="text-xs text-zinc-300 mt-1.5 min-h-[36px] line-clamp-2 leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="py-4 my-2 border-y border-[#3B2363]/80">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-white tracking-tight font-code">
                      ₦{tier.price.toLocaleString('en-NG')}
                    </span>
                    <span className="text-xs text-[#A78BFA] font-medium">/ attendee</span>
                  </div>

                  {/* Visual Inventory Bar */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      {isSoldOut ? (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Sold Out
                        </span>
                      ) : isUrgent ? (
                        <span className="text-[#EA580C] font-bold flex items-center gap-1 animate-pulse">
                          <Zap className="w-3.5 h-3.5" />
                          Only {remaining} slots remaining!
                        </span>
                      ) : (
                        <span className="text-[#A78BFA] font-semibold flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-[#EA580C]" />
                          {remaining} of {tier.availableQuantity} slots left
                        </span>
                      )}
                      <span className="text-zinc-400 text-[10px] font-code">
                        Max {tier.maxPerRegistration}/order
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[#0B0614] overflow-hidden border border-[#3B2363]/60">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isSoldOut
                            ? 'bg-rose-500'
                            : isUrgent
                            ? 'bg-[#EA580C]'
                            : 'bg-gradient-to-r from-[#7C3AED] to-[#EA580C]'
                        }`}
                        style={{ width: `${Math.min(100, percentSold)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Benefits Checklist */}
                <div className="flex-1 space-y-2.5 mb-6 pt-2">
                  <div className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider">
                    Included In This Pass:
                  </div>
                  {tier.benefits.map((benefit, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                      <div className="mt-0.5 rounded-full p-0.5 bg-[#7C3AED]/30 text-[#DDD6FE] shrink-0">
                        <Check className="w-3 h-3 text-[#A78BFA]" />
                      </div>
                      <span className="leading-snug">{benefit}</span>
                    </div>
                  ))}
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
                      ? 'bg-[#140A26] text-zinc-500 cursor-not-allowed border border-[#3B2363]'
                      : isSelected
                      ? 'bg-[#EA580C] text-white font-extrabold shadow-lg shadow-[#EA580C]/30'
                      : 'bg-[#1E1038] hover:bg-[#7C3AED] text-[#FAF5FF] border border-[#7C3AED]/50 hover:text-white'
                  }`}
                >
                  {isSoldOut ? (
                    'Sold Out'
                  ) : isSelected ? (
                    <>
                      <span>Selected for Registration</span>
                      <Check className="w-4 h-4" />
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
        <div className="mt-12 p-4 rounded-2xl bg-[#140A26]/80 border border-[#3B2363] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#A78BFA] shrink-0" />
            <span>
              <strong className="text-white">Server-Authoritative Pricing:</strong> Ticket prices and inventory reservations are strictly verified on the server. Never altered by browser data.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[#A78BFA] font-code text-[11px] shrink-0 font-bold">
            <span>PAYSTACK VERIFIED CHECKOUT</span>
            <span>•</span>
            <span>OFFICIAL ISSUANCE</span>
          </div>
        </div>
      </div>
    </section>
  );
};
