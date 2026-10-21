import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  CheckCircle2,
  X,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  Ticket,
  Calendar,
  CreditCard,
  Users,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { downloadFile } from '../utils/download.js';

interface PaidGuest {
  uuid: string;
  ticketCode: string;
  fullName: string;
  email: string;
  phone: string;
  ticketTierId: string;
  ticketTierName: string;
  amount: number;
  paymentReference: string;
  orderReference: string;
  paidAt: string;
  checkedIn: boolean;
}

interface CollationSummary {
  totalRevenue: number;
  totalOrders: number;
  totalSold: number;
  totalInventory: number;
  paidAttendeesCount: number;
  tierBreakdown: Array<{
    id: string;
    name: string;
    price: number;
    sold: number;
    available: number;
    revenue: number;
  }>;
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
  const [isExporting, setIsExporting] = useState<'xlsx' | 'csv' | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Embedded admin login state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
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
      if (data.token) {
        localStorage.setItem('naijavibe_admin_token', data.token);
        if (onLoginSuccess) {
          onLoginSuccess(data.token);
        }
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
    try {
      // 1. Fetch live collation statistics
      const summaryRes = await fetch('/api/guestlist/collation-summary', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      if (summaryRes.ok) {
        const sData = await summaryRes.json();
        setCollation(sData);
      }

      // 2. Fetch raw attendees list for instant UI preview and search
      const listRes = await fetch('/api/admin/attendees', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      if (listRes.ok) {
        const lData = await listRes.json();
        if (Array.isArray(lData.attendees)) {
          const paidGuests: PaidGuest[] = lData.attendees
            .filter((a: any) => a.paymentStatus === 'verified')
            .map((a: any) => ({
              uuid: a.uuid,
              ticketCode: a.ticketCode,
              fullName: `${a.firstName} ${a.lastName}`.trim(),
              email: a.email,
              phone: a.phone,
              ticketTierId: a.ticketTierId,
              ticketTierName: a.ticketTierName,
              amount: a.amount || a.unitPrice || 0,
              paymentReference: a.paymentReference,
              orderReference: a.orderReference,
              paidAt: a.paidAt || a.createdAt,
              checkedIn: Boolean(a.checkedIn),
            }));
          setGuests(paidGuests);
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
      let downloadUrl = `/api/export/paid-guestlist?format=${format}`;
      if (tierId !== 'ALL') {
        downloadUrl += `&tierId=${encodeURIComponent(tierId)}`;
      }

      const filename = `Hideout_Paid_Guestlist_${timestamp}.${format}`;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[var(--brand-surface)] border border-[var(--ui-border)] rounded-3xl shadow-2xl flex flex-col text-[var(--ui-text)] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[var(--brand-obsidian)] px-6 py-4 border-b border-[var(--ui-border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--brand-violet)] via-[var(--brand-violet)] to-[var(--brand-blue)] flex items-center justify-center text-[var(--ui-text)] shadow-sm font-bold">
              <FileSpreadsheet className="w-5 h-5 text-[var(--ui-text)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-[var(--ui-text)]">
                  Payment Collation & Export Center
                </h3>
                <span className="text-[10px] uppercase font-code px-2 py-0.5 rounded bg-[var(--ui-raised)] text-[var(--ui-success)] border border-[var(--brand-emerald)] font-bold">
                  {adminToken ? 'Admin Authenticated' : 'Restricted Access'}
                </span>
              </div>
              <p className="text-xs text-[var(--ui-muted)]">
                Paystack verified transactions, attendee data collation, and instant Excel / CSV exports.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {adminToken && (
              <button
                onClick={loadGuestlistData}
                className="p-2 rounded-xl bg-[var(--brand-surface)] hover:bg-[var(--brand-obsidian)] text-[var(--ui-success)] transition-colors cursor-pointer border border-[var(--ui-border)]"
                title="Refresh Collation Data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[var(--ui-success)]' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--ui-muted)] hover:text-[var(--ui-text)] hover:bg-[var(--brand-obsidian)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* RESTRICTED: Admin Authentication Gate if not logged in */}
        {!adminToken ? (
          <div className="flex-1 p-6 sm:p-10 flex items-center justify-center overflow-y-auto bg-[var(--brand-obsidian)]">
            <div className="max-w-md w-full bg-[var(--brand-surface)] border border-[var(--ui-border)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[var(--ui-raised)] border border-[var(--brand-emerald)] text-[var(--ui-success)] flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xl font-extrabold text-[var(--ui-text)]">
                  Administrator Authentication Required
                </h4>
                <p className="text-xs text-[var(--ui-muted)]">
                  Payment collation statistics, attendee contact information, and guestlist export downloads are strictly confidential and restricted to authenticated event administrators.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-300 text-xs flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-3.5 text-left">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ui-text)] mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[var(--brand-obsidian)] border border-[var(--ui-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--ui-text)] focus:outline-none focus:border-[var(--brand-emerald)] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ui-text)] mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[var(--brand-obsidian)] border border-[var(--ui-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--ui-text)] focus:outline-none focus:border-[var(--brand-emerald)]"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--brand-obsidian)] border border-[var(--ui-border)] text-[11px] text-[var(--ui-muted)]">
                  Use your organizer username and password.
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-3 rounded-xl font-extrabold text-xs bg-gradient-to-r from-[var(--brand-violet)] via-[var(--brand-violet)] to-[var(--brand-blue)] text-[var(--ui-text)] hover:from-[var(--brand-violet)] hover:to-[var(--brand-blue)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[var(--brand-emerald)]/20 disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isAuthenticating ? 'Authenticating...' : 'Sign In & Unlock Collation'}</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN CONTENT */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[var(--brand-surface)]">
            {/* Live Collation Summary Cards */}
            {collation && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-[var(--brand-obsidian)] border border-[var(--ui-border)] space-y-1">
                  <div className="text-[11px] uppercase tracking-wider font-code font-bold text-[var(--ui-success)] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[var(--ui-success)]" />
                    <span>Total Collated Revenue</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[var(--ui-success)] font-code">
                    ₦{collation.totalRevenue.toLocaleString('en-NG')}
                  </div>
                  <div className="text-[10px] text-[var(--ui-success)] font-medium">
                    100% Verified Paystack
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--brand-obsidian)] border border-[var(--ui-border)] space-y-1">
                  <div className="text-[11px] uppercase tracking-wider font-code font-bold text-[var(--brand-blue)] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[var(--brand-blue)]" />
                    <span>Paid Confirmed Guests</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[var(--ui-text)] font-code">
                    {collation.paidAttendeesCount}{' '}
                    <span className="text-xs font-sans text-[var(--ui-muted)] font-normal">Attendees</span>
                  </div>
                  <div className="text-[10px] text-[var(--ui-muted)]">
                    Across {collation.totalOrders} total orders
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--brand-obsidian)] border border-[var(--ui-border)] space-y-1">
                  <div className="text-[11px] uppercase tracking-wider font-code font-bold text-[var(--ui-success)] flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-[var(--ui-success)]" />
                    <span>Tickets Sold</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[var(--ui-text)] font-code">
                    {collation.totalSold}{' '}
                    <span className="text-xs font-sans text-[var(--ui-muted)] font-normal">
                      / {collation.totalInventory}
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--ui-success)] font-medium">
                    {collation.totalInventory - collation.totalSold} passes remaining
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--brand-obsidian)] border border-[var(--ui-border)] space-y-1">
                  <div className="text-[11px] uppercase tracking-wider font-code font-bold text-[var(--ui-success)] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--ui-success)]" />
                    <span>Collation Audit</span>
                  </div>
                  <div className="text-sm font-bold text-[var(--ui-text)] flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-4 h-4 text-[var(--ui-success)]" />
                    <span>Live Auto-Sync Active</span>
                  </div>
                  <div className="text-[10px] text-[var(--ui-muted)]">
                    Host & Door check-in ready
                  </div>
                </div>
              </div>
            )}

            {/* Prominent Export Download Bar */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[var(--brand-violet)] via-[var(--brand-blue)] to-[var(--brand-violet)] border border-[var(--brand-emerald)] shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-[var(--ui-text)] flex items-center gap-2">
                    <Download className="w-4 h-4 text-[var(--ui-success)]" />
                    <span>Download Official Spreadsheet Reports</span>
                  </h4>
                  <p className="text-xs text-[var(--ui-muted)]">
                    Exports contain complete guest roster, buyer details, phone numbers, UUIDs, ticket codes, and Paystack reference numbers.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => handleDownload('xlsx', selectedTier)}
                    disabled={Boolean(isExporting)}
                    className="px-4 py-2.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-[var(--brand-violet)] via-[var(--brand-violet)] to-[var(--brand-blue)] text-[var(--ui-text)] hover:from-[var(--brand-violet)] hover:to-[var(--brand-blue)] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[var(--brand-emerald)]/20 disabled:opacity-50"
                  >
                    <Download className={`w-3.5 h-3.5 ${isExporting === 'xlsx' ? 'animate-bounce' : ''}`} />
                    <span>{isExporting === 'xlsx' ? 'Generating Excel...' : 'Export Excel (.xlsx)'}</span>
                  </button>

                  <button
                    onClick={() => handleDownload('csv', selectedTier)}
                    disabled={Boolean(isExporting)}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[var(--brand-surface)] text-[var(--ui-success)] border border-[var(--brand-emerald)] hover:bg-[var(--ui-raised)] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Download className={`w-3.5 h-3.5 ${isExporting === 'csv' ? 'animate-bounce' : ''}`} />
                    <span>{isExporting === 'csv' ? 'Generating CSV...' : 'Export CSV (.csv)'}</span>
                  </button>
                </div>
              </div>

              {exportMessage && (
                <div className="p-3 rounded-xl bg-[var(--ui-raised)] border border-[var(--brand-emerald)] text-[var(--ui-success)] text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-[var(--ui-success)] shrink-0" />
                  <span>{exportMessage}</span>
                </div>
              )}
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[var(--ui-success)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by attendee name, email, phone, ticket code, order ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--brand-obsidian)] border border-[var(--ui-border)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--ui-text)] placeholder-[#8C9E95] focus:outline-none focus:border-[var(--brand-emerald)]"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-[var(--ui-success)]" />
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="bg-[var(--brand-obsidian)] border border-[var(--ui-border)] rounded-xl px-3 py-2 text-xs text-[var(--ui-text)] focus:outline-none focus:border-[var(--brand-emerald)]"
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
            <div className="border border-[var(--ui-border)] rounded-2xl overflow-hidden bg-[var(--brand-surface)] shadow-sm">
              <div className="overflow-x-auto max-h-[380px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--brand-obsidian)] text-[var(--ui-success)] uppercase font-code tracking-wider sticky top-0 border-b border-[var(--ui-border)]">
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
                  <tbody className="divide-y divide-[#E5DDD0] font-sans">
                    {filteredGuests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-[var(--ui-muted)]">
                          {isLoading ? (
                            <div className="flex flex-col items-center gap-2">
                              <RefreshCw className="w-6 h-6 animate-spin text-[var(--ui-success)]" />
                              <span>Loading paid guestlist collation...</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="font-semibold text-[var(--ui-text)]">No paid attendees match the filters</div>
                              <div className="text-xs text-[var(--ui-muted)]">Try adjusting your search query or tier filter.</div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredGuests.map((guest) => (
                        <tr key={guest.uuid} className="hover:bg-[var(--brand-obsidian)] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-[var(--ui-text)]">{guest.fullName}</div>
                            <div className="flex items-center gap-3 text-[11px] text-[var(--ui-muted)] mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-[var(--ui-success)]" />
                                {guest.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-[var(--brand-blue)]" />
                                {guest.phone}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[var(--ui-raised)] text-[var(--ui-success)] border border-[var(--brand-emerald)]">
                              {guest.ticketTierName}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-code font-bold text-[var(--ui-text)]">
                            ₦{guest.amount.toLocaleString('en-NG')}
                          </td>

                          <td className="py-3 px-4 font-code text-[var(--ui-success)] font-semibold">
                            {guest.ticketCode}
                          </td>

                          <td className="py-3 px-4 font-code text-[var(--ui-muted)] text-[11px]">
                            {guest.paymentReference}
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--ui-success)]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Paid & Verified</span>
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleCopy(guest.ticketCode, guest.uuid)}
                              className="p-1.5 rounded-lg bg-[var(--brand-obsidian)] hover:bg-[var(--ui-raised)] text-[var(--ui-text)] hover:text-[var(--ui-success)] transition-colors cursor-pointer border border-[var(--ui-border)]"
                              title="Copy Ticket Code"
                            >
                              {copiedId === guest.uuid ? (
                                <Check className="w-3.5 h-3.5 text-[var(--ui-success)]" />
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
        <div className="bg-[var(--brand-obsidian)] px-6 py-3.5 border-t border-[var(--ui-border)] flex items-center justify-between text-xs text-[var(--ui-muted)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--ui-success)]" />
            <span>Collation records and exports are protected by Administrator Authentication</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[var(--brand-surface)] text-[var(--ui-text)] hover:bg-[var(--brand-obsidian)] transition-colors cursor-pointer border border-[var(--ui-border)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
