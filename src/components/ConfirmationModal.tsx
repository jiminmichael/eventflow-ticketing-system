import React, { useState } from 'react';
import {
  CheckCircle2,
  Printer,
  X,
  Share2,
  Copy,
  Calendar,
  MapPin,
  Ticket,
  User,
  ShieldCheck,
  Check,
  Download,
  CalendarPlus,
  Flame,
} from 'lucide-react';
import { Order, Attendee } from '../types.js';

interface AttendeeWithQr extends Attendee {
  qrSvg?: string;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  attendees: AttendeeWithQr[];
  eventName: string;
  eventDate: string;
  venueName: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  order,
  attendees,
  eventName,
  eventDate,
  venueName,
}) => {
  const [selectedAttendeeIndex, setSelectedAttendeeIndex] = useState(0);
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen || !order || attendees.length === 0) return null;

  const currentAttendee = attendees[selectedAttendeeIndex] || attendees[0];

  const handleCopyUuid = (uuid: string) => {
    navigator.clipboard.writeText(uuid);
    setCopiedUuid(true);
    setTimeout(() => setCopiedUuid(false), 2000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate .ics file for Google Calendar / Apple Calendar
  const handleAddToCalendar = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Lagos Party Fiesta 2026//Event Ticketing//EN
BEGIN:VEVENT
SUMMARY:${eventName}
DESCRIPTION:Official Party Pass (${currentAttendee.ticketTierName}). Ticket Code: ${currentAttendee.ticketCode}, UUID: ${currentAttendee.uuid}. Landmark Beach, Lagos.
LOCATION:${venueName}, Victoria Island, Lagos, Nigeria
DTSTART:20261114T180000Z
DTEND:20261115T040000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LagosPartyFiesta_Pass_${currentAttendee.ticketCode}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#140A26] border border-[#7C3AED]/60 rounded-3xl shadow-2xl text-white overflow-hidden my-6">
        {/* Top Success Banner */}
        <div className="bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#EA580C] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-white shadow-inner">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Payment Verified & Passes Issued!</h2>
              <p className="text-xs text-[#DDD6FE] font-medium">
                Official Paystack transaction verified. Attendee UUIDs active for entrance.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Order Quick Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#0B0614] border border-[#3B2363] text-xs">
            <div>
              <span className="text-[#A78BFA] font-code text-[10px] uppercase font-bold">Order Ref</span>
              <div className="font-code font-bold text-white mt-0.5">{order.orderReference}</div>
            </div>
            <div>
              <span className="text-[#A78BFA] font-code text-[10px] uppercase font-bold">Total Settled</span>
              <div className="font-code font-bold text-[#EA580C] mt-0.5">
                ₦{order.totalAmount.toLocaleString('en-NG')}
              </div>
            </div>
            <div>
              <span className="text-[#A78BFA] font-code text-[10px] uppercase font-bold">Payment Status</span>
              <div className="font-bold text-[#A78BFA] mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#EA580C]" />
                VERIFIED (PAYSTACK)
              </div>
            </div>
            <div>
              <span className="text-[#A78BFA] font-code text-[10px] uppercase font-bold">Passes Issued</span>
              <div className="font-bold text-white mt-0.5">{attendees.length} Attendee Pass(es)</div>
            </div>
          </div>

          {/* Attendee Selector (if group order) */}
          {attendees.length > 1 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#A78BFA] mb-2 font-code">
                Select Attendee Pass to View / Print ({attendees.length} Passes):
              </label>
              <div className="flex flex-wrap gap-2">
                {attendees.map((att, idx) => (
                  <button
                    key={att.uuid}
                    onClick={() => setSelectedAttendeeIndex(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedAttendeeIndex === idx
                        ? 'bg-[#EA580C] text-white shadow-md shadow-[#EA580C]/25'
                        : 'bg-[#0B0614] text-zinc-300 hover:text-white border border-[#3B2363]'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>#{idx + 1}: {att.firstName} {att.lastName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PHYSICAL TICKET PASS CARD (PRINTABLE & WALLET STYLE) */}
          <div
            id="printable-ticket"
            className="relative rounded-3xl bg-[#0B0614] border border-[#7C3AED]/60 p-6 sm:p-7 shadow-2xl overflow-hidden print:m-0 print:border-black print:text-black print:bg-white"
          >
            {/* Holographic Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3B2363] pb-4">
              <div>
                <span className="text-[10px] font-code uppercase tracking-widest text-[#DDD6FE] font-extrabold bg-[#7C3AED]/30 px-2.5 py-0.5 rounded border border-[#7C3AED]/50">
                  OFFICIAL PARTY FIESTA ENTRY PASS
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1.5">{eventName}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#A78BFA]" />
                    {eventDate}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
                    {venueName}
                  </span>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] font-code text-[#A78BFA] uppercase tracking-wider font-bold">
                  TIER CATEGORY
                </span>
                <div className="text-base font-extrabold text-[#FDBA74] font-code">
                  {currentAttendee.ticketTierName}
                </div>
                <div className="text-xs font-code text-[#EA580C] font-bold">
                  ₦{currentAttendee.unitPrice.toLocaleString('en-NG')}
                </div>
              </div>
            </div>

            {/* Ticket Body: Attendee Personal Details & Vector QR Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center py-5">
              <div className="sm:col-span-2 space-y-3.5">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#A78BFA] font-bold font-code">
                    PASS HOLDER
                  </span>
                  <div className="text-2xl font-extrabold text-white tracking-tight">
                    {currentAttendee.firstName} {currentAttendee.lastName}
                  </div>
                  <div className="text-xs text-zinc-300 mt-0.5">
                    {currentAttendee.email} • {currentAttendee.phone}
                  </div>
                  {currentAttendee.institution && (
                    <div className="text-xs text-[#A78BFA] font-medium mt-1">
                      Organization: {currentAttendee.institution}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <div>
                    <span className="text-[10px] text-[#A78BFA] uppercase tracking-wider font-code font-bold">
                      TICKET CODE
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-code font-bold text-white text-base">
                        {currentAttendee.ticketCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(currentAttendee.ticketCode)}
                        className="text-[#A78BFA] hover:text-white p-0.5 cursor-pointer"
                        title="Copy ticket code"
                      >
                        {copiedCode ? <Check className="w-3 h-3 text-[#EA580C]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#A78BFA] uppercase tracking-wider font-code font-bold">
                      GATE ENTRANCE STATUS
                    </span>
                    <div className="font-bold text-[#EA580C] flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-pulse" />
                      <span>{currentAttendee.checkedIn ? 'CHECKED IN' : 'ADMISSION READY'}</span>
                    </div>
                  </div>
                </div>

                {/* Unique Backend UUID */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[10px] text-[#A78BFA] font-code mb-1 font-bold">
                    <span>ATTENDEE BACKEND UUID (SYSTEM KEY)</span>
                    <button
                      type="button"
                      onClick={() => handleCopyUuid(currentAttendee.uuid)}
                      className="text-[#EA580C] hover:text-[#FDBA74] flex items-center gap-1 cursor-pointer font-sans"
                    >
                      {copiedUuid ? (
                        <>
                          <Check className="w-3 h-3 text-[#EA580C]" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy UUID</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#140A26] font-code text-[11px] text-zinc-300 border border-[#3B2363] break-all select-all">
                    {currentAttendee.uuid}
                  </div>
                </div>
              </div>

              {/* QR Code Presentation Box */}
              <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white text-zinc-950 shadow-xl">
                {currentAttendee.qrSvg ? (
                  <div
                    className="w-32 h-32 flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: currentAttendee.qrSvg }}
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center bg-zinc-100 font-code text-[10px] text-zinc-500 text-center p-2 rounded-lg">
                    [QR CODE PASS]
                  </div>
                )}
                <span className="text-[10px] font-code text-zinc-800 mt-1 uppercase font-bold tracking-wider">
                  SCAN AT GATE
                </span>
              </div>
            </div>

            {/* Ticket Footer Security Stripe */}
            <div className="border-t border-[#3B2363] pt-3 flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-400 font-code">
              <span>PAYSTACK REF: {order.paymentReference}</span>
              <span>VERIFIED: {new Date(order.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1E1038] border border-[#7C3AED]/60 hover:bg-[#7C3AED] text-white transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#A78BFA]" />
                <span>Print Pass / PDF</span>
              </button>

              <button
                onClick={handleAddToCalendar}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1E1038] border border-[#7C3AED]/60 hover:bg-[#7C3AED] text-white transition-colors cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4 text-[#EA580C]" />
                <span>Add to Calendar (.ics)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#EA580C] text-white hover:bg-[#C2410C] transition-colors shadow-md shadow-[#EA580C]/25 cursor-pointer"
            >
              Close & Back to Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
