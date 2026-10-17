import React, { useState } from 'react';
import { Search, X, Loader2, AlertCircle, Ticket, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-white space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
            <h4 className="text-base font-bold text-white">Find My Summit Pass</h4>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Enter your <strong>Order Reference</strong> (e.g. <code>ORD-2026-78421</code>) or your <strong>Attendee UUID</strong> to view or reprint your verified pass.
        </p>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              placeholder="e.g. ORD-2026-78421 or 550e8400-..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
