import React, { useState } from 'react';
import { Search, X, Loader2, AlertCircle, Ticket } from 'lucide-react';
import { Order, Attendee } from '../types.js';

interface AttendeeWithQr extends Attendee {
  qrSvg?: string;
}

interface TicketLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketFound: (order: Order, attendees: AttendeeWithQr[]) => void;
}

export const TicketLookupModal: React.FC<TicketLookupModalProps> = ({
  isOpen,
  onClose,
  onTicketFound,
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const trimmed = query.trim();
      // Try order reference lookup first
      const orderRes = await fetch(`/api/orders/${encodeURIComponent(trimmed)}`);
      if (orderRes.ok) {
        const data = await orderRes.json();
        onTicketFound(data.order, data.attendees);
        onClose();
        return;
      }

      // Try attendee UUID lookup
      const attRes = await fetch(`/api/attendees/${encodeURIComponent(trimmed)}`);
      if (attRes.ok) {
        const { attendee } = await attRes.json();
        const fullOrderRes = await fetch(`/api/orders/${encodeURIComponent(attendee.orderReference)}`);
        if (fullOrderRes.ok) {
          const fullData = await fullOrderRes.json();
          onTicketFound(fullData.order, fullData.attendees);
          onClose();
          return;
        }
      }

      setError('No confirmed registration found with this Order Reference or Attendee UUID.');
    } catch (err: any) {
      setError(err.message || 'Lookup failed. Please check network connection.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-[#E5DDD0] rounded-3xl p-6 text-[#0F291E] space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5DDD0] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
              <Ticket className="w-4 h-4" />
            </div>
            <h4 className="text-base font-bold text-[#0F291E]">Find My Hideout Pass</h4>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#516E60] hover:text-[#0F291E] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#516E60] leading-relaxed">
          Enter your <strong>Order Reference</strong> (e.g. <code className="text-emerald-800 font-bold">ORD-2026-78421</code>) or your <strong>Attendee UUID</strong> to view or reprint your verified party pass.
        </p>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              placeholder="e.g. ORD-2026-78421 or 550e8400-..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#D5CDC0] rounded-xl text-xs text-[#0F291E] font-mono focus:outline-none focus:border-emerald-600"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="w-full py-3 rounded-xl font-extrabold text-xs bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-[#FAF7F2] hover:from-emerald-500 hover:to-teal-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-700/20 active:scale-95"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Locating Attendee Pass...</span>
              </>
            ) : (
              <span>Retrieve Digital Pass</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
