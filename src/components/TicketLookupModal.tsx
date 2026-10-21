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
      <div className="relative w-full max-w-md bg-[var(--brand-surface)] border border-[var(--ui-border)] rounded-3xl p-6 text-[var(--ui-text)] space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--ui-border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--ui-raised)] text-[var(--ui-success)] flex items-center justify-center border border-[var(--brand-emerald)]">
              <Ticket className="w-4 h-4" />
            </div>
            <h4 className="text-base font-bold text-[var(--ui-text)]">Find My Hideout Pass</h4>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--ui-muted)] hover:text-[var(--ui-text)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[var(--ui-muted)] leading-relaxed">
          Enter your <strong>Order Reference</strong> (e.g. <code className="text-[var(--ui-success)] font-bold">ORD-2026-78421</code>) or your <strong>Attendee UUID</strong> to view or reprint your verified party pass.
        </p>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--ui-success)] absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              placeholder="e.g. ORD-2026-78421 or 550e8400-..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--brand-obsidian)] border border-[var(--ui-border)] rounded-xl text-xs text-[var(--ui-text)] font-mono focus:outline-none focus:border-[var(--brand-emerald)]"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="w-full py-3 rounded-xl font-extrabold text-xs bg-gradient-to-r from-[var(--brand-violet)] via-[var(--brand-violet)] to-[var(--brand-blue)] text-[var(--ui-text)] hover:from-[var(--brand-violet)] hover:to-[var(--brand-blue)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-[var(--brand-emerald)]/20 active:scale-95"
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
