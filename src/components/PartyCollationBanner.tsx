import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Sparkles,
  CheckCircle2,
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
  // Do not show any admin prompt or banner to regular public visitors
  if (!adminToken) {
    return null;
  }

  // Authenticated Administrator View
  return (
    <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-10">
      <div className="rounded-3xl bg-white border border-emerald-300 p-5 sm:p-7 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Purpose Badge & Collation Metrics */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Live Payment Collation (Admin Active)</span>
              </span>
              <span className="text-xs text-[#516E60] font-medium">
                Direct Paystack revenue collation & instant spreadsheet guestlist export
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 sm:gap-10">
              <div>
                <span className="text-[10px] uppercase font-code text-[#516E60] block font-bold">
                  Total Verified Revenue
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-800 font-code tracking-tight">
                  ₦{totalRevenue.toLocaleString('en-NG')}
                </span>
              </div>

              <div className="h-9 w-px bg-[#E5DDD0] hidden sm:block" />

              <div>
                <span className="text-[10px] uppercase font-code text-[#516E60] block font-bold">
                  Verified Paid Guests
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#0F291E] font-code tracking-tight">
                  {paidGuestsCount}{' '}
                  <span className="text-xs text-emerald-700 font-normal">checked / paid</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Export Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleQuickExcelExport}
              disabled={isDownloading}
              className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-[#FAF7F2] hover:from-emerald-500 hover:to-teal-700 transition-all shadow-md shadow-emerald-700/20 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#FAF7F2]" />
                  <span>Excel Spreadsheet Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Quick Export Excel (.xlsx)</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenExportModal}
              className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50 transition-all cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Full Collation & Filters</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
