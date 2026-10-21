import React, { useState } from 'react';
import {
  CheckCircle2,
  Printer,
  X,
  Copy,
  Calendar,
  MapPin,
  User,
  ShieldCheck,
  Check,
  CalendarPlus,
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
    const startDate = new Date(`${eventDate} 14:00:00 GMT+0100`).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//The Hideout//Event Ticketing//EN
BEGIN:VEVENT
SUMMARY:${eventName}
DESCRIPTION:Official Party Pass (${currentAttendee.ticketTierName}). Ticket Code: ${currentAttendee.ticketCode}, UUID: ${currentAttendee.uuid}.
LOCATION:${venueName}
DTSTART:${startDate}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Hideout_Pass_${currentAttendee.ticketCode}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-[#E5DDD0] rounded-3xl shadow-2xl text-[#0F291E] overflow-hidden my-6">
        {/* Top Success Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 px-6 py-5 text-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-[#FAF7F2] shadow-inner">
              <CheckCircle2 className="w-7 h-7 text-[#FAF7F2]" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#FAF7F2]">Payment Verified & Passes Issued!</h2>
              <p className="text-xs text-emerald-100 font-semibold">
                {['VVIP', 'Cabana'].some(name => order?.ticketTierName.includes(name)) ? 'Payment confirmed. Our team will contact you to arrange your package and guest details. Keep this booking reference.' : 'Payment confirmed. Each guest has an individual UUID and QR entry pass.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#FAF7F2] hover:bg-white/15 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Order Quick Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DDD0] text-xs">
            <div>
              <span className="text-emerald-800 font-code text-[10px] uppercase font-bold">Order Ref</span>
              <div className="font-code font-bold text-[#0F291E] mt-0.5">{order.orderReference}</div>
            </div>
            <div>
              <span className="text-emerald-800 font-code text-[10px] uppercase font-bold">Total Settled</span>
              <div className="font-code font-bold text-emerald-800 mt-0.5">
                ₦{order.totalAmount.toLocaleString('en-NG')}
              </div>
            </div>
            <div>
              <span className="text-emerald-800 font-code text-[10px] uppercase font-bold">Payment Status</span>
              <div className="font-bold text-emerald-800 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                VERIFIED (PAYSTACK)
              </div>
            </div>
            <div>
              <span className="text-emerald-800 font-code text-[10px] uppercase font-bold">Passes Issued</span>
              <div className="font-bold text-[#0F291E] mt-0.5">{attendees.length} Attendee Pass(es)</div>
            </div>
          </div>

          {/* Attendee Selector (if group order) */}
          {attendees.length > 1 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 font-code">
                Select Attendee Pass to View / Print ({attendees.length} Passes):
              </label>
              <div className="flex flex-wrap gap-2">
                {attendees.map((att, idx) => (
                  <button
                    key={att.uuid}
                    onClick={() => setSelectedAttendeeIndex(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedAttendeeIndex === idx
                        ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-[#FAF7F2] font-black shadow-sm'
                        : 'bg-white text-[#2D4A3E] hover:text-[#0F291E] border border-[#E5DDD0] hover:border-emerald-400'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>#{idx + 1}: {att.firstName} {att.lastName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PHYSICAL TICKET PASS CARD */}
          <div
            id="printable-ticket"
            className="relative rounded-3xl bg-[#FAF7F2] border-2 border-emerald-600/60 p-6 sm:p-7 shadow-xl overflow-hidden print:m-0 print:border-black print:text-black print:bg-white"
          >
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DDD0] pb-4">
              <div>
                <span className="text-[10px] font-code uppercase tracking-widest text-emerald-900 font-extrabold bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                  OFFICIAL PARTY FIESTA ENTRY PASS
                </span>
                <h3 className="text-xl font-extrabold text-[#0F291E] mt-1.5">{eventName}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#375245] mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    {eventDate}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    {venueName}
                  </span>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] font-code text-emerald-800 uppercase tracking-wider font-bold">
                  TIER CATEGORY
                </span>
                <div className="text-base font-extrabold text-emerald-800 font-code">
                  {currentAttendee.ticketTierName}
                </div>
                <div className="text-xs font-code text-[#375245] font-bold">
                  ₦{currentAttendee.unitPrice.toLocaleString('en-NG')}
                </div>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center py-5">
              <div className="sm:col-span-2 space-y-3.5">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold font-code">
                    PASS HOLDER
                  </span>
                  <div className="text-2xl font-extrabold text-[#0F291E] tracking-tight">
                    {currentAttendee.firstName} {currentAttendee.lastName}
                  </div>
                  <div className="text-xs text-[#516E60] mt-0.5">
                    {currentAttendee.email} • {currentAttendee.phone}
                  </div>
                  {currentAttendee.institution && (
                    <div className="text-xs text-emerald-700 font-medium mt-1">
                      Organization: {currentAttendee.institution}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-code font-bold">
                      TICKET CODE
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-code font-bold text-[#0F291E] text-base">
                        {currentAttendee.ticketCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(currentAttendee.ticketCode)}
                        className="text-emerald-700 hover:text-emerald-900 p-0.5 cursor-pointer"
                        title="Copy ticket code"
                      >
                        {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-code font-bold">
                      GATE ENTRANCE STATUS
                    </span>
                    <div className="font-bold text-emerald-800 flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      <span>{currentAttendee.checkedIn ? 'CHECKED IN' : 'ADMISSION READY'}</span>
                    </div>
                  </div>
                </div>

                {/* Unique Backend UUID */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[10px] text-emerald-800 font-code mb-1 font-bold">
                    <span>ATTENDEE BACKEND UUID (SYSTEM KEY)</span>
                    <button
                      type="button"
                      onClick={() => handleCopyUuid(currentAttendee.uuid)}
                      className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer font-sans"
                    >
                      {copiedUuid ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
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
                  <div className="p-2.5 rounded-xl bg-white font-code text-[11px] text-[#2D4A3E] border border-[#D5CDC0] break-all select-all">
                    {currentAttendee.uuid}
                  </div>
                </div>
              </div>

              {/* QR Code Presentation Box */}
              <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white text-slate-950 shadow-md border-2 border-emerald-500">
                {currentAttendee.qrSvg ? (
                  <div
                    className="w-32 h-32 flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: currentAttendee.qrSvg }}
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center bg-slate-100 font-code text-[10px] text-slate-500 text-center p-2 rounded-lg">
                    [QR CODE PASS]
                  </div>
                )}
                <span className="text-[10px] font-code text-slate-800 mt-1 uppercase font-bold tracking-wider">
                  SCAN AT GATE
                </span>
              </div>
            </div>

            {/* Ticket Footer Security Stripe */}
            <div className="border-t border-[#E5DDD0] pt-3 flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#516E60] font-code">
              <span>PAYSTACK REF: {order.paymentReference}</span>
              <span>VERIFIED: {new Date(order.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-[#D5CDC0] hover:bg-[#FAF7F2] text-[#0F291E] transition-colors cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4 text-emerald-600" />
                <span>Print Pass / PDF</span>
              </button>

              <button
                onClick={handleAddToCalendar}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-[#D5CDC0] hover:bg-[#FAF7F2] text-[#0F291E] transition-colors cursor-pointer shadow-sm"
              >
                <CalendarPlus className="w-4 h-4 text-emerald-600" />
                <span>Add to Calendar (.ics)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-[#FAF7F2] hover:from-emerald-500 hover:to-teal-700 transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              Close & Back to Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
