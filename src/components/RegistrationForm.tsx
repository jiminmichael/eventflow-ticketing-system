import React, { useState, useEffect } from 'react';
import { TicketTier } from '../types.js';
import {
  User,
  Mail,
  Phone,
  Building2,
  Users,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';

interface AttendeeInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  institution?: string;
  notes?: string;
}

interface RegistrationFormProps {
  tiers: TicketTier[];
  selectedTier: TicketTier | null;
  onSelectTier: (tier: TicketTier) => void;
  onInitializePayment: (orderData: {
    ticketTierId: string;
    quantity: number;
    purchaser: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      institution?: string;
    };
    attendees: AttendeeInput[];
  }) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  tiers,
  selectedTier,
  onSelectTier,
  onInitializePayment,
  isLoading,
  errorMessage,
}) => {
  // Purchaser details
  const [purchaser, setPurchaser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    institution: '',
  });

  // Quantity
  const [quantity, setQuantity] = useState<number>(1);

  // Attendees list
  const [attendees, setAttendees] = useState<AttendeeInput[]>([
    { firstName: '', lastName: '', email: '', phone: '', institution: '' },
  ]);

  const [attendeeOneSameAsPurchaser, setAttendeeOneSameAsPurchaser] = useState(true);

  // Form field touched states for inline validation
  const [touched, setTouched] = useState({
    email: false,
    phone: false,
    firstName: false,
    lastName: false,
  });

  // Sync attendees array when quantity changes
  useEffect(() => {
    setAttendees((prev) => {
      const updated = [...prev];
      while (updated.length < quantity) {
        updated.push({ firstName: '', lastName: '', email: '', phone: '', institution: '' });
      }
      return updated.slice(0, quantity);
    });
  }, [quantity]);

  // Sync attendee 1 if same as purchaser
  useEffect(() => {
    if (attendeeOneSameAsPurchaser) {
      setAttendees((prev) => {
        const next = [...prev];
        next[0] = {
          firstName: purchaser.firstName,
          lastName: purchaser.lastName,
          email: purchaser.email,
          phone: purchaser.phone,
          institution: purchaser.institution,
        };
        return next;
      });
    }
  }, [attendeeOneSameAsPurchaser, purchaser]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(purchaser.email);
  const isPhoneValid = purchaser.phone.trim().length >= 8;

  const maxAllowed = selectedTier
    ? Math.min(
        selectedTier.maxPerRegistration,
        Math.max(1, selectedTier.availableQuantity - selectedTier.soldQuantity)
      )
    : 1;

  const totalAmount = selectedTier ? selectedTier.price * quantity : 0;

  const handleAttendeeChange = (index: number, field: keyof AttendeeInput, value: string) => {
    setAttendees((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    if (!purchaser.firstName || !purchaser.lastName || !isEmailValid || !isPhoneValid) {
      setTouched({ email: true, phone: true, firstName: true, lastName: true });
      return;
    }

    const finalAttendees = attendees.map((att, idx) => {
      if (idx === 0 && attendeeOneSameAsPurchaser) {
        return {
          firstName: purchaser.firstName.trim(),
          lastName: purchaser.lastName.trim(),
          email: purchaser.email.trim(),
          phone: purchaser.phone.trim(),
          institution: purchaser.institution?.trim() || '',
        };
      }
      return {
        firstName: att.firstName.trim() || purchaser.firstName.trim(),
        lastName: att.lastName.trim() || purchaser.lastName.trim(),
        email: att.email.trim() || purchaser.email.trim(),
        phone: att.phone.trim() || purchaser.phone.trim(),
        institution: att.institution?.trim() || purchaser.institution?.trim() || '',
      };
    });

    await onInitializePayment({
      ticketTierId: selectedTier.id,
      quantity,
      purchaser,
      attendees: finalAttendees,
    });
  };

  return (
    <section id="register" className="py-20 bg-[#0B0614] text-[#FAF5FF] border-b border-[#3B2363]/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E1038] text-[#DDD6FE] text-xs font-bold mb-3 border border-[#7C3AED]/50">
            <Lock className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>PAYSTACK SECURE REGISTRATION</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Complete Your Registration</h2>
          <p className="mt-2 text-zinc-300 text-sm max-w-xl mx-auto">
            Provide your details below to initialize your Paystack order. Every individual ticket holder receives a unique backend UUID pass.
          </p>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-center gap-3 mt-6 text-xs font-code font-bold">
            <div className="flex items-center gap-1.5 text-[#A78BFA]">
              <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-[11px] font-bold">1</span>
              <span>Select Pass</span>
            </div>
            <span className="text-[#3B2363]">—</span>
            <div className="flex items-center gap-1.5 text-[#EA580C]">
              <span className="w-5 h-5 rounded-full bg-[#EA580C] text-white flex items-center justify-center text-[11px] font-bold">2</span>
              <span>Attendee Info</span>
            </div>
            <span className="text-[#3B2363]">—</span>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-5 h-5 rounded-full bg-[#1E1038] text-[#DDD6FE] border border-[#3B2363] flex items-center justify-center text-[11px] font-bold">3</span>
              <span>Paystack Checkout</span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-sm flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Checkout Initialization Notice</p>
              <p className="text-xs text-rose-200 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Select Tier & Quantity */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Step 1
                </span>
                <h3 className="text-lg font-bold text-white">Ticket Category & Quantity</h3>
              </div>
              <Users className="w-5 h-5 text-zinc-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Selected Ticket Tier *
                </label>
                <select
                  value={selectedTier?.id || ''}
                  onChange={(e) => {
                    const tier = tiers.find((t) => t.id === e.target.value);
                    if (tier) {
                      onSelectTier(tier);
                      setQuantity(1);
                    }
                  }}
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    -- Choose a ticket tier --
                  </option>
                  {tiers.map((t) => (
                    <option
                      key={t.id}
                      value={t.id}
                      disabled={!t.isActive || t.soldQuantity >= t.availableQuantity}
                    >
                      {t.name} — ₦{t.price.toLocaleString('en-NG')} (
                      {t.availableQuantity - t.soldQuantity > 0
                        ? `${t.availableQuantity - t.soldQuantity} remaining`
                        : 'Sold Out'}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Number of Tickets * (Max {maxAllowed})
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold text-lg flex items-center justify-center hover:bg-zinc-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    –
                  </button>
                  <span className="w-12 text-center text-xl font-bold text-white font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxAllowed, q + 1))}
                    disabled={quantity >= maxAllowed}
                    className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold text-lg flex items-center justify-center hover:bg-zinc-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    +
                  </button>
                  <span className="text-xs text-zinc-400 font-mono ml-2">
                    {quantity} ticket{quantity > 1 ? 's' : ''} requested
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: Primary Purchaser Contact Details */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Step 2
                </span>
                <h3 className="text-lg font-bold text-white">Purchaser Contact Details</h3>
              </div>
              <User className="w-5 h-5 text-zinc-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  First Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Babatunde"
                    value={purchaser.firstName}
                    onChange={(e) => setPurchaser({ ...purchaser, firstName: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 bg-zinc-950 border border-zinc-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adeleke"
                    value={purchaser.lastName}
                    onChange={(e) => setPurchaser({ ...purchaser, lastName: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 bg-zinc-950 border border-zinc-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Email Address *
                  </label>
                  {touched.email && isEmailValid && (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Valid email
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.ng"
                    value={purchaser.email}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    onChange={(e) => setPurchaser({ ...purchaser, email: e.target.value })}
                    className={`w-full pl-10 pr-3 py-3 bg-zinc-950 border rounded-xl text-sm text-white focus:outline-none placeholder:text-zinc-600 ${
                      touched.email && !isEmailValid
                        ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-zinc-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                    }`}
                  />
                </div>
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Official ticket receipt and UUID passes will be dispatched to this email.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Phone Number * (e.g. +234 803 ...)
                  </label>
                  {touched.phone && isPhoneValid && (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Valid format
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="+234 803 000 0000"
                    value={purchaser.phone}
                    onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                    onChange={(e) => setPurchaser({ ...purchaser, phone: e.target.value })}
                    className={`w-full pl-10 pr-3 py-3 bg-zinc-950 border rounded-xl text-sm text-white focus:outline-none placeholder:text-zinc-600 ${
                      touched.phone && !isPhoneValid
                        ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-zinc-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                    }`}
                  />
                </div>
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  SMS entrance alerts and gate pass retrieval code.
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Party Crew, Group Name, or Organization (Optional)
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="e.g. Ade & Friends Crew, The Lagos Vibe Squad, VIP Table 4..."
                    value={purchaser.institution}
                    onChange={(e) => setPurchaser({ ...purchaser, institution: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 bg-zinc-950 border border-zinc-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-zinc-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Individual Ticket Holder Passes for Unique UUIDs */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Step 3
                </span>
                <h3 className="text-lg font-bold text-white">
                  Individual Ticket Holder Details ({quantity} Attendee{quantity > 1 ? 's' : ''})
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Each attendee is issued a separate backend UUID and individual QR code badge.
                </p>
              </div>

              {selectedTier && (
                <span className="text-xs px-2.5 py-1 rounded-md font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  {selectedTier.code} Pass
                </span>
              )}
            </div>

            {quantity === 1 ? (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-white">
                    Ticket #1 will be registered in the name of Primary Purchaser
                  </p>
                  <p className="text-zinc-400 text-[11px]">
                    {purchaser.firstName || purchaser.lastName
                      ? `${purchaser.firstName} ${purchaser.lastName} (${purchaser.email})`
                      : 'Complete purchaser fields above to auto-assign.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <input
                    type="checkbox"
                    id="sameAsPurchaser"
                    checked={attendeeOneSameAsPurchaser}
                    onChange={(e) => setAttendeeOneSameAsPurchaser(e.target.checked)}
                    className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4 bg-zinc-900 cursor-pointer"
                  />
                  <label htmlFor="sameAsPurchaser" className="text-xs text-zinc-300 font-medium cursor-pointer">
                    Pass #1 holder is the same as Primary Purchaser ({purchaser.firstName || 'Purchaser'})
                  </label>
                </div>

                {attendees.map((att, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                        Attendee Pass #{idx + 1}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        UUID v4 assigned on payment
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          required
                          disabled={idx === 0 && attendeeOneSameAsPurchaser}
                          placeholder="Attendee First Name"
                          value={idx === 0 && attendeeOneSameAsPurchaser ? purchaser.firstName : att.firstName}
                          onChange={(e) => handleAttendeeChange(idx, 'firstName', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          required
                          disabled={idx === 0 && attendeeOneSameAsPurchaser}
                          placeholder="Attendee Last Name"
                          value={idx === 0 && attendeeOneSameAsPurchaser ? purchaser.lastName : att.lastName}
                          onChange={(e) => handleAttendeeChange(idx, 'lastName', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          required
                          disabled={idx === 0 && attendeeOneSameAsPurchaser}
                          placeholder="Attendee Email Address"
                          value={idx === 0 && attendeeOneSameAsPurchaser ? purchaser.email : att.email}
                          onChange={(e) => handleAttendeeChange(idx, 'email', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          required
                          disabled={idx === 0 && attendeeOneSameAsPurchaser}
                          placeholder="Attendee Phone Number"
                          value={idx === 0 && attendeeOneSameAsPurchaser ? purchaser.phone : att.phone}
                          onChange={(e) => handleAttendeeChange(idx, 'phone', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ORDER SUMMARY & PAYSTACK CHECKOUT BAR */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#140A26] border border-[#7C3AED]/60 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3B2363]/80 pb-5">
              <div>
                <span className="text-xs uppercase font-code text-[#A78BFA] font-bold tracking-wider">
                  Order Breakdown
                </span>
                <div className="text-xl font-extrabold text-white flex items-center gap-2 mt-0.5">
                  <span>{selectedTier ? selectedTier.name : 'Select a ticket tier'}</span>
                  {selectedTier && (
                    <span className="text-xs font-code text-[#DDD6FE] bg-[#7C3AED]/30 px-2 py-0.5 rounded border border-[#7C3AED]/50 font-bold">
                      ₦{selectedTier.price.toLocaleString('en-NG')} × {quantity}
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-300 mt-1 flex items-center gap-2">
                  <span>Paystack processing: <strong className="text-[#EA580C]">₦0.00</strong> (Free)</span>
                  <span>•</span>
                  <span>Instant digital pass generation</span>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-xs uppercase font-code text-[#A78BFA] font-bold tracking-wider block">
                  Net Amount Payable (NGN)
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#EA580C] font-code tracking-tight mt-0.5">
                  ₦{totalAmount.toLocaleString('en-NG')}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                <ShieldCheck className="w-5 h-5 text-[#A78BFA] shrink-0" />
                <span>
                  Official Paystack verification • Zero processing markup • Instant confirmation
                </span>
              </div>

              <button
                type="submit"
                disabled={!selectedTier || isLoading || totalAmount <= 0}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm bg-[#EA580C] hover:bg-[#C2410C] text-white active:scale-[0.98] transition-all shadow-xl shadow-[#EA580C]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connecting to Paystack Backend...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Pay ₦{totalAmount.toLocaleString('en-NG')} with Paystack</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};
