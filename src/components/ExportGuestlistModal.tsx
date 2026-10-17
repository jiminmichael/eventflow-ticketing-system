import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  X,
  Search,
  Filter,
  Users,
  CreditCard,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ArrowUpDown,
  Phone,
  Mail,
  Ticket,
  Lock,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { downloadFile } from '../utils/download.js';

interface PaidGuest {
  uuid: string;
  ticketCode: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ticketTierId: string;
  ticketTierName: string;
  amount: number;
  orderReference: string;
  paymentReference: string;
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
}

interface CollationSummary {
  totalRevenue: number;
  paidAttendeesCount: number;
  totalOrders: number;
  totalInventory: number;
  totalSold: number;
  tierBreakdown: Array<{
    id: string;
    name: string;
    sold: number;
    available: number;
    revenue: number;
  }>;
  recentPaidGuests: PaidGuest[];
}

interface ExportGuestlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminToken: string | null;
  onLoginSuccess?: (token: string) => void;
}

export const ExportGuestlistModal: React.FC<ExportGuestlistModalProps> = ({
  isOpen,
  onClose,
  adminToken,
  onLoginSuccess,
}) => {
  const [collation, setCollation] = useState<CollationSummary | null>(null);
  const [guests, setGuests] = useState<PaidGuest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // In-modal admin authentication state when not logged in
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@2026!');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (isOpen && adminToken) {
      loadGuestlistData();
    }
  }, [isOpen, adminToken]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid administrator credentials');
      }

      if (onLoginSuccess) {
        onLoginSuccess(data.token);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loadGuestlistData = async () => {
    if (!adminToken) return;
    setIsLoading(true);
    setExportMessage(null);
    try {
      // 1. Fetch live collation summary with authorization header
      const res = await fetch('/api/guestlist/collation-summary', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCollation(data);
        setGuests(data.recentPaidGuests || []);
      }

      // 2. Fetch full verified attendee roster
      const adminRes = await fetch('/api/admin/attendees', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (adminRes.ok) {
        const adminData = await adminRes.json();
        const paidOnly = (adminData.attendees || []).filter(
          (a: any) => a.paymentStatus === 'verified'
        );
        if (paidOnly.length > 0) {
          setGuests(
            paidOnly.map((a: any) => ({
              uuid: a.uuid,
              ticketCode: a.ticketCode,
              fullName: `${a.firstName} ${a.lastName}`,
              firstName: a.firstName,
              lastName: a.lastName,
              email: a.email,
              phone: a.phone,
              ticketTierId: a.ticketTierId,
              ticketTierName: a.ticketTierName,
              amount: a.unitPrice,
              orderReference: a.orderReference,
              paymentReference: a.paymentReference,
              checkedIn: a.checkedIn,
              checkedInAt: a.checkedInAt,
              createdAt: a.createdAt,
            }))
          );
        }
      }
    } catch (err) {
      console.error('[Export Modal] Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (format: 'xlsx' | 'csv', tierId = 'ALL') => {
    if (!adminToken) return;
    setIsExporting(format);
    setExportMessage(null);
    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      let downloadUrl = `/api/export/paid-guestlist?format=${format}&token=${encodeURIComponent(adminToken)}`;
      if (tierId !== 'ALL') {
        downloadUrl += `&tierId=${encodeURIComponent(tierId)}`;
      }

      const filename = `LagosPartyFiesta_Paid_Guestlist_${timestamp}.${format}`;
      const result = await downloadFile(downloadUrl, filename, adminToken);

      if (result.success) {
        setExportMessage(
          `Successfully exported ${format.toUpperCase()} spreadsheet! Ready to open in Excel or Google Sheets.`
        );
      } else {
        setExportMessage(`Export issue: ${result.message}`);
      }
    } catch (err: any) {
      setExportMessage(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredGuests = guests.filter((g) => {
    if (selectedTier !== 'ALL' && g.ticketTierId !== selectedTier) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        g.fullName.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.toLowerCase().includes(q) ||
        g.ticketCode.toLowerCase().includes(q) ||
        g.orderReference.toLowerCase().includes(q) ||
        g.paymentReference.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0E061A] border border-[#7C3AED]/50 rounded-3xl shadow-2xl flex flex-col text-[#FAF5FF] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#140A26] px-6 py-4 border-b border-[#3B2363] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#EA580C] flex items-center justify-center text-white shadow-md shadow-[#7C3AED]/30">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Payment Collation & Export Center
                </h3>
                <span className="text-[10px] uppercase font-code px-2 py-0.5 rounded bg-[#7C3AED]/30 text-[#DDD6FE] border border-[#7C3AED]/50 font-bold">
                  {adminToken ? 'Admin Authenticated' : 'Restricted Access'}
                </span>
              </div>
              <p className="text-xs text-[#A78BFA]">
                Paystack verified transactions, attendee data collation, and instant Excel / CSV exports.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {adminToken && (
              <button
                onClick={loadGuestlistData}
                className="p-2 rounded-xl bg-[#1E1038] hover:bg-[#7C3AED] text-[#DDD6FE] hover:text-white transition-colors cursor-pointer border border-[#3B2363]"
                title="Refresh Collation Data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#EA580C]' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#1E1038] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* RESTRICTED: Admin Authentication Gate if not logged in */}
        {!adminToken ? (
          <div className="flex-1 p-6 sm:p-10 flex items-center justify-center overflow-y-auto">
            <div className="max-w-md w-full bg-[#140A26] border border-[#7C3AED]/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/20 border border-[#7C3AED]/50 text-[#EA580C] flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xl font-extrabold text-white">
                  Administrator Authentication Required
                </h4>
                <p className="text-xs text-[#A78BFA]">
                  Payment collation statistics, attendee contact information, and guestlist export downloads are strictly confidential and restricted to authenticated event administrators.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-3.5 text-left">
                <div>
                  <label className="block text-xs font-semibold text-[#DDD6FE] mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#0B0614] border border-[#3B2363] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#DDD6FE] mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0B0614] border border-[#3B2363] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-[#0B0614] border border-[#3B2363] text-[11px] text-zinc-400">
                  <span className="text-[#A78BFA] font-bold">Standard Credentials (.env.example): </span>
                  <span className="font-mono text-white">admin</span> / <span className="font-mono text-white">Admin@2026!</span>
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-[#EA580C] text-white hover:bg-[#C2410C] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#EA580C]/25 disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isAuthenticating ? 'Authenticating...' : 'Sign In & Unlock Collation'}</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN CONTENT */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Live Collation Summary Cards */}
            {collation && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-[#140A26] border border-[#3B2363] space-y-1">
                  <div className="text-[11px] uppercase tracking-wider font-code font-bold text-[#A78BFA] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>Total Collated Revenue</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-white font-code">
                    ₦{collation.totalRevenue.toLocaleString('en-NG')}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-medium">
                    100% Verified Paystack
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#140A26] border border-[#3B2363] space-y-1">
                  <div className="text-[11px] uppercase tracking-wider font-code font-bold text-[#A78BFA] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Paid Confirmed Guests</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#EA580C] font-code">
                    {collation.paidAttendeesCount}{' '}
                    <span className="text-xs font-sans text-zinc-400 font-normal">Attendees</span>
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Across {collation.totalOrders} total orders
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#140A26] border border-[#3B2363] space-y-1">
                  <div className="text-[11px] uppercase tracking-wider font-code font-bold text-[#A78BFA] flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>Tickets Sold</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-white font-code">
                    {collation.totalSold}{' '}
                    <span className="text-xs font-sans text-zinc-400 font-normal">
                      / {collation.totalInventory}
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-400 font-medium">
                    {collation.totalInventory - collation.totalSold} passes remaining
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#140A26] border border-[#3B2363] space-y-1">
                  <div className="text-[11px] uppercase tracking-wider font-code font-bold text-[#A78BFA] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Collation Audit</span>
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Live Auto-Sync Active</span>
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Host & Door check-in ready
                  </div>
                </div>
              </div>
            )}

            {/* Prominent Export Download Bar matching MASTER.md buttons */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#140A26] via-[#1E1038] to-[#140A26] border border-[#7C3AED]/60 shadow-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-[#EA580C]" />
                    <span>Download Official Spreadsheet Reports</span>
                  </h4>
                  <p className="text-xs text-[#DDD6FE]">
                    Exports contain complete guest roster, buyer details, phone numbers, UUIDs, ticket codes, and Paystack reference numbers.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => handleDownload('xlsx', selectedTier)}
                    disabled={Boolean(isExporting)}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#EA580C] text-white hover:bg-[#C2410C] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#EA580C]/30 disabled:opacity-50"
                  >
                    <Download className={`w-3.5 h-3.5 ${isExporting === 'xlsx' ? 'animate-bounce' : ''}`} />
                    <span>{isExporting === 'xlsx' ? 'Generating Excel...' : 'Export Excel (.xlsx)'}</span>
                  </button>

                  <button
                    onClick={() => handleDownload('csv', selectedTier)}
                    disabled={Boolean(isExporting)}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#1E1038] text-[#DDD6FE] border border-[#7C3AED]/70 hover:bg-[#7C3AED] hover:text-white active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Download className={`w-3.5 h-3.5 ${isExporting === 'csv' ? 'animate-bounce' : ''}`} />
                    <span>{isExporting === 'csv' ? 'Generating CSV...' : 'Export CSV (.csv)'}</span>
                  </button>
                </div>
              </div>

              {exportMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{exportMessage}</span>
                </div>
              )}
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#A78BFA] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by attendee name, email, phone, ticket code, order ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#140A26] border border-[#3B2363] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-[#A78BFA]" />
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="bg-[#140A26] border border-[#3B2363] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                >
                  <option value="ALL">All Ticket Tiers ({guests.length})</option>
                  {collation?.tierBreakdown?.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} ({tier.sold} sold)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Attendees Collation Table */}
            <div className="border border-[#3B2363] rounded-2xl overflow-hidden bg-[#140A26]">
              <div className="overflow-x-auto max-h-[380px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0E061A] text-[#A78BFA] uppercase font-code tracking-wider sticky top-0 border-b border-[#3B2363]">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Attendee</th>
                      <th className="py-3 px-4 font-semibold">Pass Type</th>
                      <th className="py-3 px-4 font-semibold">Amount</th>
                      <th className="py-3 px-4 font-semibold">Ticket Code</th>
                      <th className="py-3 px-4 font-semibold">Paystack Ref</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3B2363]/60 font-sans">
                    {filteredGuests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-zinc-400">
                          {isLoading ? (
                            <div className="flex flex-col items-center gap-2">
                              <RefreshCw className="w-6 h-6 animate-spin text-[#7C3AED]" />
                              <span>Loading paid guestlist collation...</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="font-semibold text-white">No paid attendees match the filters</div>
                              <div className="text-xs text-zinc-400">Try adjusting your search query or tier filter.</div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredGuests.map((guest) => (
                        <tr key={guest.uuid} className="hover:bg-[#1E1038]/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white">{guest.fullName}</div>
                            <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-[#A78BFA]" />
                                {guest.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-[#EA580C]" />
                                {guest.phone}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#7C3AED]/20 text-[#DDD6FE] border border-[#7C3AED]/40">
                              {guest.ticketTierName}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-code font-bold text-white">
                            ₦{guest.amount.toLocaleString('en-NG')}
                          </td>

                          <td className="py-3 px-4 font-code text-[#FDBA74]">
                            {guest.ticketCode}
                          </td>

                          <td className="py-3 px-4 font-code text-zinc-400 text-[11px]">
                            {guest.paymentReference}
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Paid & Verified</span>
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleCopy(guest.ticketCode, guest.uuid)}
                              className="p-1.5 rounded-lg bg-[#1E1038] hover:bg-[#7C3AED] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="Copy Ticket Code"
                            >
                              {copiedId === guest.uuid ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="bg-[#140A26] px-6 py-3.5 border-t border-[#3B2363] flex items-center justify-between text-xs text-[#A78BFA]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#EA580C]" />
            <span>Collation records and exports are protected by Administrator Authentication</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#1E1038] text-white hover:bg-[#7C3AED] transition-colors cursor-pointer border border-[#3B2363]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
