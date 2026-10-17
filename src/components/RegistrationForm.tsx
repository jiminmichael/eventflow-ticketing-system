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
  ChevronDown,
  ChevronUp,
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

  // Accordion state for multiple attendees on mobile
  const [openAttendeeAccordion, setOpenAttendeeAccordion] = useState<Record<number, boolean>>({
    0: true,
    1: true,
  });

  const toggleAttendeeAccordion = (idx: number) => {
    setOpenAttendeeAccordion((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

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
    // Auto-open newly added attendee card
    setOpenAttendeeAccordion((prev) => ({
      ...prev,
      [quantity - 1]: true,
    }));
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
    <section id="register" className="py-20 bg-[#FAF7F2] text-[#0F291E] border-b border-[#E5DDD0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-3 border border-emerald-300">
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            <span>PAYSTACK SECURE REGISTRATION</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#0F291E]">Complete Your Registration</h2>
          <p className="mt-2 text-[#375245] text-sm max-w-xl mx-auto">
            Provide your details below to initialize your Paystack order. Every individual ticket holder receives a unique backend UUID pass.
          </p>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-center gap-3 mt-6 text-xs font-code font-bold">
            <div className="flex items-center gap-1.5 text-emerald-800">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-[#FAF7F2] flex items-center justify-center text-[11px] font-bold">1</span>
              <span>Select Pass</span>
            </div>
            <span className="text-[#C2B7A5]">—</span>
            <div className="flex items-center gap-1.5 text-teal-800">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-[#FAF7F2] flex items-center justify-center text-[11px] font-bold">2</span>
              <span>Attendee Info</span>
            </div>
            <span className="text-[#C2B7A5]">—</span>
            <div className="flex items-center gap-1.5 text-[#516E60]">
              <span className="w-5 h-5 rounded-full bg-[#EAE4D8] text-[#516E60] border border-[#D5CDC0] flex items-center justify-center text-[11px] font-bold">3</span>
              <span>Paystack Checkout</span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-sm flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Checkout Initialization Notice</p>
              <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Select Tier & Quantity */}
          <div className="p-6 rounded-3xl bg-white border border-[#E5DDD0] space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E5DDD0] pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase tracking-wider">
                  Step 1
                </span>
                <h3 className="text-lg font-bold text-[#0F291E]">Ticket Category & Quantity</h3>
              </div>
              <Users className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2D4A3E] mb-1.5">
                  Selected Ticket Tier *
                </label>
                <div className="relative">
                  <select
                    value={selectedTier?.id || ''}
                    onChange={(e) => {
                      const tier = tiers.find((t) => t.id === e.target.value);
                      if (tier) {
                        onSelectTier(tier);
                        setQuantity(1);
                      }
                    }}
                    className="w-full appearance-none bg-[#FAF7F2] border border-[#D5CDC0] rounded-xl px-3.5 py-3 text-sm text-[#0F291E] focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 cursor-pointer"
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
                  <ChevronDown className="w-4 h-4 text-emerald-700 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D4A3E] mb-1.5">
                  Number of Tickets * (Max {maxAllowed})
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-11 h-11 rounded-xl bg-[#FAF7F2] border border-[#D5CDC0] text-[#0F291E] font-bold text-lg flex items-center justify-center hover:bg-[#EAE4D8] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    –
                  </button>
                  <span className="w-12 text-center text-xl font-bold text-emerald-800 font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxAllowed, q + 1))}
                    disabled={quantity >= maxAllowed}
                    className="w-11 h-11 rounded-xl bg-[#FAF7F2] border border-[#D5CDC0] text-[#0F291E] font-bold text-lg flex items-center justify-center hover:bg-[#EAE4D8] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    +
                  </button>
                  <span className="text-xs text-[#516E60] font-mono ml-2">
                    {quantity} ticket{quantity > 1 ? 's' : ''} requested
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: Primary Purchaser Contact Details */}
          <div className="p-6 rounded-3xl bg-[#0D1527] border border-slate-800 space-y-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Step 2
                </span>
                <h3 className="text-lg font-bold text-[#0F291E]">Purchaser Contact Details</h3>
              </div>
              <User className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2D4A3E] mb-1.5">
                  First Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C9E95] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Babatunde"
                    value={purchaser.firstName}
                    onChange={(e) => setPurchaser({ ...purchaser, firstName: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 bg-[#FAF7F2] border border-[#D5CDC0] rounded-xl text-sm text-[#0F291E] focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 placeholder:text-[#8C9E95]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D4A3E] mb-1.5">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C9E95] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adeleke"
                    value={purchaser.lastName}
                    onChange={(e) => setPurchaser({ ...purchaser, lastName: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 bg-[#FAF7F2] border border-[#D5CDC0] rounded-xl text-sm text-[#0F291E] focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 placeholder:text-[#8C9E95]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#2D4A3E]">
                    Email Address *
                  </label>
                  {touched.email && isEmailValid && (
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Valid email
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C9E95] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.ng"
                    value={purchaser.email}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    onChange={(e) => setPurchaser({ ...purchaser, email: e.target.value })}
                    className={`w-full pl-10 pr-3 py-3 bg-[#FAF7F2] border rounded-xl text-sm text-[#0F291E] focus:outline-none placeholder:text-[#8C9E95] ${
                      touched.email && !isEmailValid
                        ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-[#D5CDC0] focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                    }`}
                  />
                </div>
                <span className="text-[11px] text-[#516E60] mt-1 block">
                  Official ticket receipt and UUID passes will be dispatched to this email.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#2D4A3E]">
                    Phone Number * (e.g. +234 803 ...)
                  </label>
                  {touched.phone && isPhoneValid && (
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Valid format
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8C9E95] absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="+234 803 000 0000"
                    value={purchaser.phone}
                    onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                    onChange={(e) => setPurchaser({ ...purchaser, phone: e.target.value })}
                    className={`w-full pl-10 pr-3 py-3 bg-[#FAF7F2] border rounded-xl text-sm text-[#0F291E] focus:outline-none placeholder:text-[#8C9E95] ${
                      touched.phone && !isPhoneValid
                        ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-[#D5CDC0] focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                    }`}
                  />
                </div>
                <span className="text-[11px] text-[#516E60] mt-1 block">
                  SMS entrance alerts and gate pass retrieval code.
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#2D4A3E] mb-1.5">
                  Party Crew, Group Name, or Organization (Optional)
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#8C9E95] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="e.g. Adeleke & Friends Crew, The Lagos Vibe Squad, VIP Table 4..."
                    value={purchaser.institution}
                    onChange={(e) => setPurchaser({ ...purchaser, institution: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 bg-[#FAF7F2] border border-[#D5CDC0] rounded-xl text-sm text-[#0F291E] focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 placeholder:text-[#8C9E95]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Individual Ticket Holder Passes (Accordion on mobile when multiple) */}
          <div className="p-6 rounded-3xl bg-white border border-[#E5DDD0] space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E5DDD0] pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase tracking-wider">
                  Step 3
                </span>
                <h3 className="text-lg font-bold text-[#0F291E]">
                  Individual Ticket Holder Details ({quantity} Attendee{quantity > 1 ? 's' : ''})
                </h3>
                <p className="text-xs text-[#516E60] mt-0.5">
                  Each attendee is issued a separate backend UUID and individual QR code badge.
                </p>
              </div>

              {selectedTier && (
                <span className="text-xs px-2.5 py-1 rounded-md font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  {selectedTier.code} Pass
                </span>
              )}
            </div>

            {quantity === 1 ? (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DDD0] text-xs text-[#2D4A3E]">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-semibold text-[#0F291E]">
                    Ticket #1 will be registered in the name of Primary Purchaser
                  </p>
                  <p className="text-[#516E60] text-[11px]">
                    {purchaser.firstName || purchaser.lastName
                      ? `${purchaser.firstName} ${purchaser.lastName} (${purchaser.email})`
                      : 'Complete purchaser fields above to auto-assign.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DDD0]">
                  <input
                    type="checkbox"
                    id="sameAsPurchaser"
                    checked={attendeeOneSameAsPurchaser}
                    onChange={(e) => setAttendeeOneSameAsPurchaser(e.target.checked)}
                    className="rounded border-[#D5CDC0] text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="sameAsPurchaser" className="text-xs text-[#2D4A3E] font-medium cursor-pointer">
                    Pass #1 holder is the same as Primary Purchaser ({purchaser.firstName || 'Purchaser'})
                  </label>
                </div>

                {attendees.map((att, idx) => {
                  const isOpen = Boolean(openAttendeeAccordion[idx]);
                  const guestName = idx === 0 && attendeeOneSameAsPurchaser
                    ? `${purchaser.firstName} ${purchaser.lastName}`.trim() || 'Purchaser'
                    : `${att.firstName} ${att.lastName}`.trim() || 'Click to fill attendee info';

                  return (
                    <div
                      key={idx}
                      className="rounded-2xl bg-[#FAF7F2] border border-[#E5DDD0] overflow-hidden shadow-sm transition-all"
                    >
                      {/* Accordion Header on mobile / Header row on desktop */}
                      <button
                        type="button"
                        onClick={() => toggleAttendeeAccordion(idx)}
                        className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-[#EFE9DF] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-mono">
                            Attendee Pass #{idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-[#2D4A3E] truncate max-w-[180px] sm:max-w-none">
                            • {guestName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[#516E60] hidden sm:inline">
                            UUID v4 generated
                          </span>
                          <span className="sm:hidden text-emerald-700">
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </span>
                        </div>
                      </button>

                      {/* Accordion Inputs: Expandable on mobile, always accessible */}
                      <div className={`p-4 pt-1 sm:pt-4 border-t border-[#E5DDD0] ${isOpen ? 'block' : 'hidden sm:block'}`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              required
                              disabled={idx === 0 && attendeeOneSameAsPurchaser}
                              placeholder="Attendee First Name"
                              value={idx === 0 && attendeeOneSameAsPurchaser ? purchaser.firstName : att.firstName}
                              onChange={(e) => handleAttendeeChange(idx, 'firstName', e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#D5CDC0] rounded-xl text-xs text-[#0F291E] focus:outline-none focus:border-emerald-600 disabled:opacity-50"
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
                              className="w-full px-3.5 py-2.5 bg-white border border-[#D5CDC0] rounded-xl text-xs text-[#0F291E] focus:outline-none focus:border-emerald-600 disabled:opacity-50"
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
                              className="w-full px-3.5 py-2.5 bg-white border border-[#D5CDC0] rounded-xl text-xs text-[#0F291E] focus:outline-none focus:border-emerald-600 disabled:opacity-50"
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
                              className="w-full px-3.5 py-2.5 bg-white border border-[#D5CDC0] rounded-xl text-xs text-[#0F291E] focus:outline-none focus:border-emerald-600 disabled:opacity-50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ORDER SUMMARY & PAYSTACK CHECKOUT BAR */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-emerald-300 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DDD0] pb-5">
              <div>
                <span className="text-xs uppercase font-code text-emerald-800 font-bold tracking-wider">
                  Order Breakdown
                </span>
                <div className="text-xl font-extrabold text-[#0F291E] flex items-center gap-2 mt-0.5">
                  <span>{selectedTier ? selectedTier.name : 'Select a ticket tier'}</span>
                  {selectedTier && (
                    <span className="text-xs font-code text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-bold">
                      ₦{selectedTier.price.toLocaleString('en-NG')} × {quantity}
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#516E60] mt-1 flex items-center gap-2">
                  <span>Paystack processing: <strong className="text-emerald-700">₦0.00</strong> (Free)</span>
                  <span>•</span>
                  <span>Instant digital pass generation</span>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-xs uppercase font-code text-emerald-800 font-bold tracking-wider block">
                  Net Amount Payable (NGN)
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-800 font-code tracking-tight mt-0.5">
                  ₦{totalAmount.toLocaleString('en-NG')}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-[#516E60]">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Official Paystack verification • Zero processing markup • Instant confirmation
                </span>
              </div>

              <button
                type="submit"
                disabled={!selectedTier || isLoading || totalAmount <= 0}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-extrabold text-sm bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-[#FAF7F2] active:scale-[0.98] transition-all shadow-md shadow-emerald-700/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 cursor-pointer"
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
