import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { downloadFile } from '../utils/download.js';

interface PartyCollationBannerProps {
  onOpenExportModal: () => void;
  onOpenAdmin: () => void;
  adminToken: string | null;
}

export const PartyCollationBanner: React.FC<PartyCollationBannerProps> = ({
  onOpenExportModal,
  onOpenAdmin,
  adminToken,
}) => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paidGuestsCount, setPaidGuestsCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (adminToken) {
      fetchCollationStats();
    } else {
      setTotalRevenue(0);
      setPaidGuestsCount(0);
    }
  }, [adminToken]);

  const fetchCollationStats = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/guestlist/collation-summary', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTotalRevenue(data.totalRevenue || 0);
        setPaidGuestsCount(data.paidAttendeesCount || 0);
      }
    } catch (err) {
      console.error('[Collation Banner] Failed to fetch stats:', err);
    }
  };

  const handleQuickExcelExport = async () => {
    if (!adminToken) {
      onOpenAdmin();
      return;
    }

    setIsDownloading(true);
    setDownloadSuccess(false);
    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      const url = `/api/export/paid-guestlist?format=xlsx&token=${encodeURIComponent(adminToken)}`;
      const filename = `LagosPartyFiesta_Paid_Guestlist_${timestamp}.xlsx`;
      const result = await downloadFile(url, filename, adminToken);

      if (result.success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      }
    } catch (err) {
      console.error('[Collation Export Error]:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // If the user is NOT authenticated as an administrator:
  // Show a secure, locked admin gate - NO payment numbers, revenue, or guestlist exports are exposed
  if (!adminToken) {
    return (
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-10">
        <div className="rounded-3xl bg-[#140A26]/90 border border-[#3B2363] p-5 sm:p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#A78BFA] shrink-0">
                <Lock className="w-5 h-5 text-[#EA580C]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#A78BFA]">
                    Payment Collation & Export Portal
                  </span>
                  <span className="text-[10px] font-code px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-semibold">
                    Admin Protected
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-0.5 max-w-2xl">
                  Real-time payment revenue collation, guest counts, and spreadsheet exports (.xlsx/.csv) are private and visible only to authenticated event administrators.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenAdmin}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#1E1038] text-[#DDD6FE] border border-[#7C3AED]/70 hover:bg-[#7C3AED] hover:text-white transition-all cursor-pointer shadow-md shadow-[#7C3AED]/20"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Admin Sign In to Collate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Authenticated Administrator View: Full live payment collation and 1-click exports
  return (
    <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-10">
      <div className="rounded-3xl bg-[#140A26]/95 border border-[#7C3AED]/60 p-5 sm:p-7 shadow-2xl shadow-[#7C3AED]/20 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Purpose Badge & Collation Metrics */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#7C3AED]/25 text-[#DDD6FE] border border-[#7C3AED]/50">
                <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Live Payment Collation (Admin Authenticated)</span>
              </span>
              <span className="text-xs text-[#A78BFA] font-medium">
                Direct Paystack revenue collation & instant spreadsheet guestlist export
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 sm:gap-10">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-code font-bold text-[#A78BFA]">
                  Payments Collated
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#FAF5FF] font-code">
                  ₦{totalRevenue.toLocaleString('en-NG')}
                </div>
              </div>

              <div className="h-10 w-px bg-[#3B2363] hidden sm:block" />

              <div>
                <span className="text-[11px] uppercase tracking-wider font-code font-bold text-[#A78BFA]">
                  Paid Guests Confirmed
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#EA580C] font-code">
                  {paidGuestsCount}{' '}
                  <span className="text-xs font-sans text-[#DDD6FE] font-normal">Attendees</span>
                </div>
              </div>

              <div className="h-10 w-px bg-[#3B2363] hidden sm:block" />

              <div>
                <span className="text-[11px] uppercase tracking-wider font-code font-bold text-[#A78BFA]">
                  Payment Verification
                </span>
                <div className="flex items-center gap-1.5 text-xs text-zinc-200 font-semibold mt-1">
                  <ShieldCheck className="w-4 h-4 text-[#A78BFA]" />
                  <span>100% Verified Paystack</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Explicit Export Buttons matching MASTER.md */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={handleQuickExcelExport}
              disabled={isDownloading}
              className="px-5 py-3.5 rounded-xl font-bold text-xs bg-[#EA580C] text-white hover:bg-[#C2410C] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#EA580C]/25 cursor-pointer disabled:opacity-50"
              title="Download instant Excel spreadsheet of all confirmed paid guests"
            >
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>
                {isDownloading
                  ? 'Exporting Spreadsheet...'
                  : downloadSuccess
                  ? 'Spreadsheet Downloaded!'
                  : 'Export Paid Guestlist (.xlsx)'}
              </span>
            </button>

            <button
              onClick={onOpenExportModal}
              className="px-5 py-3.5 rounded-xl font-bold text-xs bg-[#1E1038] text-[#DDD6FE] border border-[#7C3AED]/70 hover:bg-[#7C3AED] hover:text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#7C3AED]/15"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#A78BFA]" />
              <span>View Full Collation Table</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A78BFA]" />
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mt-3 text-xs text-[#A78BFA] flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#EA580C]" />
            <span className="font-medium text-white">
              Excel file downloaded! Contains verified attendee names, phone numbers, UUIDs, ticket
              tiers, and Paystack reference numbers.
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
