import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  CreditCard,
  Ticket,
  UtensilsCrossed,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Plus,
  Trash2,
  Edit2,
  LogOut,
  X,
  AlertCircle,
  RefreshCw,
  QrCode,
  DollarSign,
  TrendingUp,
  Settings,
  ArrowUpDown,
  Lock,
  Copy,
  Check,
  Sparkles,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  DashboardStats,
  Attendee,
  TicketTier,
  MenuItem,
  PaymentAudit,
  EventDetails,
} from '../types.js';
import { downloadFile } from '../utils/download.js';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  adminToken: string | null;
  onLoginSuccess: (token: string) => void;
  onLogout: () => void;
  event: EventDetails;
  onUpdateEvent: (updated: EventDetails) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  adminToken,
  onLoginSuccess,
  onLogout,
  event,
  onUpdateEvent,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'attendees' | 'tiers' | 'menu' | 'payments' | 'checkin' | 'settings'
  >('overview');

  // Login form state
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [payments, setPayments] = useState<PaymentAudit[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Filters for Attendees tab
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [checkinFilter, setCheckinFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Selected attendee for details modal
  const [viewingAttendee, setViewingAttendee] = useState<Attendee | null>(null);
  const [copiedAttendeeUuid, setCopiedAttendeeUuid] = useState(false);

  // Fast Gate check-in state
  const [checkinInput, setCheckinInput] = useState('');
  const [checkinResult, setCheckinResult] = useState<{
    success: boolean;
    message: string;
    attendee?: Attendee;
  } | null>(null);

  // Ticket tier modal state
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<TicketTier | null>(null);
  const [tierForm, setTierForm] = useState({
    name: '',
    code: '',
    description: '',
    price: 25000,
    availableQuantity: 100,
    maxPerRegistration: 4,
    salesStartDate: '2026-08-01',
    salesEndDate: '2026-11-13',
    benefits: '',
    isActive: true,
    badge: '',
  });

  // Menu item modal state
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    category: 'Food',
    price: 3500,
    isAvailable: true,
    displayOrder: 1,
    imageUrl: '',
    dietaryOrTag: '',
  });

  // Event settings form state
  const [eventSettingsForm, setEventSettingsForm] = useState({ ...event });

  // Load dashboard data when token is available and modal is open
  useEffect(() => {
    if (isOpen && adminToken) {
      loadAllAdminData();
    }
  }, [isOpen, adminToken]);

  // Sync event settings form when event prop changes
  useEffect(() => {
    setEventSettingsForm({ ...event });
  }, [event]);

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

  const loadAllAdminData = async () => {
    if (!adminToken) return;
    setIsLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${adminToken}` };

      const [statsRes, attendeesRes, tiersRes, menuRes, paymentsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/attendees', { headers }),
        fetch('/api/tickets'),
        fetch('/api/menu'),
        fetch('/api/admin/payments', { headers }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (attendeesRes.ok) {
        const attData = await attendeesRes.json();
        setAttendees(attData.attendees || []);
      }
      if (tiersRes.ok) setTiers(await tiersRes.json());
      if (menuRes.ok) {
        const mData = await menuRes.json();
        setMenuItems(mData.items || []);
      }
      if (paymentsRes.ok) setPayments(await paymentsRes.json());
    } catch (err) {
      console.error('[Admin] Error fetching dashboard data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.token);
      } else {
        setLoginError(data.message || 'Invalid username or password');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleToggleCheckin = async (uuid: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/attendees/${uuid}/checkin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const { attendee } = await res.json();
        setAttendees((prev) => prev.map((a) => (a.uuid === uuid ? attendee : a)));
        if (viewingAttendee?.uuid === uuid) {
          setViewingAttendee(attendee);
        }
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${adminToken}` } })
          .then((r) => r.json())
          .then(setStats)
          .catch(() => {});
      }
    } catch (err) {
      console.error('[Checkin error]', err);
    }
  };

  const handleFastCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkinInput.trim() || !adminToken) return;

    const query = checkinInput.trim().toLowerCase();
    const matched = attendees.find(
      (a) => a.uuid.toLowerCase() === query || a.ticketCode.toLowerCase() === query
    );

    if (!matched) {
      setCheckinResult({
        success: false,
        message: `No attendee found matching ticket code or UUID "${checkinInput}"`,
      });
      return;
    }

    if (matched.paymentStatus !== 'verified') {
      setCheckinResult({
        success: false,
        message: `Admission Denied: Ticket has unverified payment status (${matched.paymentStatus})`,
        attendee: matched,
      });
      return;
    }

    if (matched.checkedIn) {
      setCheckinResult({
        success: true,
        message: `Already Checked In at ${new Date(matched.checkedInAt || '').toLocaleTimeString()}!`,
        attendee: matched,
      });
      return;
    }

    await handleToggleCheckin(matched.uuid);
    setCheckinResult({
      success: true,
      message: `Verified & Successfully Checked In: ${matched.firstName} ${matched.lastName} (${matched.ticketTierName})`,
      attendee: { ...matched, checkedIn: true },
    });
    setCheckinInput('');
  };

  const handleDownloadExport = async (
    type: 'all' | 'paid' | 'tier' | 'filtered' | 'payments',
    format: 'xlsx' | 'csv' = 'xlsx',
    tierId?: string
  ) => {
    if (!adminToken) return;
    const params = new URLSearchParams();
    params.set('format', format);

    if (type === 'tier' && tierId) {
      params.set('tierId', tierId);
    }

    if (type === 'filtered') {
      if (searchQuery) params.set('search', searchQuery);
      if (tierFilter !== 'ALL') params.set('ticketTierId', tierFilter);
      if (paymentFilter !== 'ALL') params.set('paymentStatus', paymentFilter);
      if (checkinFilter !== 'ALL') params.set('checkedIn', checkinFilter);
      if (dateFilter) params.set('startDate', dateFilter);
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `LagosPartyFiesta_Attendees_${type}_${timestamp}.${format}`;
    const url = `/api/admin/export/${type}?${params.toString()}`;
    await downloadFile(url, filename, adminToken);
  };

  const handleSaveTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;

    const payload = {
      name: tierForm.name.trim(),
      code: tierForm.code.trim().toUpperCase(),
      description: tierForm.description.trim(),
      price: Number(tierForm.price),
      availableQuantity: Number(tierForm.availableQuantity),
      maxPerRegistration: Number(tierForm.maxPerRegistration),
      salesStartDate: tierForm.salesStartDate,
      salesEndDate: tierForm.salesEndDate,
      benefits: tierForm.benefits.split('\n').map((b) => b.trim()).filter(Boolean),
      isActive: tierForm.isActive,
      badge: tierForm.badge.trim() || undefined,
    };

    try {
      const url = editingTier ? `/api/admin/tickets/${editingTier.id}` : '/api/admin/tickets';
      const method = editingTier ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setTierModalOpen(false);
        setEditingTier(null);
        loadAllAdminData();
      }
    } catch (err) {
      console.error('[Tier save error]', err);
    }
  };

  const handleDeleteTier = async (id: string) => {
    if (!adminToken || !confirm('Are you sure you want to deactivate/delete this ticket tier?')) return;
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        loadAllAdminData();
      }
    } catch (err) {
      console.error('[Tier delete error]', err);
    }
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;

    const payload = {
      name: menuForm.name.trim(),
      description: menuForm.description.trim(),
      category: menuForm.category.trim(),
      price: Number(menuForm.price),
      isAvailable: menuForm.isAvailable,
      displayOrder: Number(menuForm.displayOrder),
      imageUrl: menuForm.imageUrl.trim(),
      dietaryOrTag: menuForm.dietaryOrTag.trim() || undefined,
    };

    try {
      const url = editingMenuItem ? `/api/admin/menu/${editingMenuItem.id}` : '/api/admin/menu';
      const method = editingMenuItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMenuModalOpen(false);
        setEditingMenuItem(null);
        loadAllAdminData();
      }
    } catch (err) {
      console.error('[Menu item save error]', err);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!adminToken || !confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        loadAllAdminData();
      }
    } catch (err) {
      console.error('[Menu item delete error]', err);
    }
  };

  const handleToggleMenuAvailability = async (item: MenuItem) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/menu/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      if (res.ok) {
        setMenuItems((prev) =>
          prev.map((m) => (m.id === item.id ? { ...m, isAvailable: !item.isAvailable } : m))
        );
      }
    } catch (err) {
      console.error('[Toggle availability error]', err);
    }
  };

  const handleSaveEventSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;

    try {
      const res = await fetch('/api/admin/event', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(eventSettingsForm),
      });

      if (res.ok) {
        const updated = await res.json();
        onUpdateEvent(updated);
        alert('Event configuration saved and synchronized with public portal!');
      }
    } catch (err) {
      console.error('[Save event error]', err);
    }
  };

  const filteredAttendees = attendees.filter((a) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        a.uuid.toLowerCase().includes(q) ||
        a.ticketCode.toLowerCase().includes(q) ||
        a.firstName.toLowerCase().includes(q) ||
        a.lastName.toLowerCase().includes(q) ||
        `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q) ||
        a.orderReference.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (tierFilter !== 'ALL' && a.ticketTierId !== tierFilter) return false;
    if (paymentFilter !== 'ALL' && a.paymentStatus !== paymentFilter) return false;
    if (checkinFilter !== 'ALL') {
      const isChecked = checkinFilter === 'true';
      if (a.checkedIn !== isChecked) return false;
    }
    if (dateFilter) {
      const dateStr = a.createdAt.slice(0, 10);
      if (dateStr !== dateFilter) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl h-[92vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col text-white overflow-hidden">
        {/* Top Portal Header */}
        <div className="bg-[#0E061A] px-6 py-4 border-b border-[#3B2363] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#EA580C] flex items-center justify-center text-white font-bold shadow-md shadow-[#7C3AED]/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">Lagos Party Fiesta — Admin & Door Portal</h2>
                <span className="text-[10px] font-code px-2 py-0.5 rounded bg-[#7C3AED]/30 text-[#DDD6FE] border border-[#7C3AED]/50 font-bold">
                  Host Active
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                Ticketing inventory, attendee database, Paystack verification, and spreadsheet exports.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {adminToken && (
              <>
                <button
                  onClick={loadAllAdminData}
                  disabled={isLoadingData}
                  className="p-2 rounded-xl bg-[#1E1038] hover:bg-[#7C3AED] text-[#DDD6FE] hover:text-white transition-colors cursor-pointer border border-[#3B2363]"
                  title="Refresh Dashboard Data"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-[#EA580C]' : ''}`} />
                </button>

                <button
                  onClick={onLogout}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-500/30 hover:bg-rose-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#1E1038] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ADMIN CONTENT: Login Gate vs Authenticated Dashboard */}
        {!adminToken ? (
          /* LOGIN GATE */
          <div className="flex-1 flex items-center justify-center p-6 bg-zinc-950 overflow-y-auto">
            <div className="w-full max-w-md p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">Administrator Access</h3>
                <p className="text-xs text-zinc-400">
                  Authenticate to manage attendee records, adjust pricing, and download Excel reports.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter admin password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Convenience Demo Notice */}
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                  <div className="text-amber-400 font-bold">Standard Credentials (.env.example):</div>
                  <div className="font-mono text-zinc-300">
                    Username: <span className="text-white font-bold">admin</span> | Password:{' '}
                    <span className="text-white font-bold">Admin@2026!</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 hover:from-amber-400 hover:to-amber-500 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isLoggingIn ? 'Authenticating...' : 'Sign In to Admin Portal'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED DASHBOARD */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-60 bg-[#0E061A] border-r border-[#3B2363] p-3 flex md:flex-col gap-1.5 shrink-0 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-[#EA580C] text-white font-bold shadow-md shadow-[#EA580C]/25'
                    : 'text-zinc-300 hover:text-white hover:bg-[#1E1038]'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Overview & Metrics</span>
              </button>

              <button
                onClick={() => setActiveTab('attendees')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'attendees'
                    ? 'bg-[#EA580C] text-white font-bold shadow-md shadow-[#EA580C]/25'
                    : 'text-zinc-300 hover:text-white hover:bg-[#1E1038]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Attendees & UUIDs</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[#140A26] font-code">
                  {attendees.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('checkin')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'checkin'
                    ? 'bg-[#EA580C] text-white font-bold shadow-md shadow-[#EA580C]/25'
                    : 'text-zinc-300 hover:text-white hover:bg-[#1E1038]'
                }`}
              >
                <QrCode className="w-4 h-4 text-[#A78BFA]" />
                <span>Gate Check-In</span>
              </button>

              <button
                onClick={() => setActiveTab('tiers')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'tiers'
                    ? 'bg-[#EA580C] text-white font-bold shadow-md shadow-[#EA580C]/25'
                    : 'text-zinc-300 hover:text-white hover:bg-[#1E1038]'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>Ticket Tiers</span>
              </button>

              <button
                onClick={() => setActiveTab('menu')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'menu'
                    ? 'bg-[#EA580C] text-white font-bold shadow-md shadow-[#EA580C]/25'
                    : 'text-zinc-300 hover:text-white hover:bg-[#1E1038]'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Party Menu (View-Only)</span>
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'payments'
                    ? 'bg-[#EA580C] text-white font-bold shadow-md shadow-[#EA580C]/25'
                    : 'text-zinc-300 hover:text-white hover:bg-[#1E1038]'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Payment Audit Trail</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-[#EA580C] text-white font-bold shadow-md shadow-[#EA580C]/25'
                    : 'text-zinc-300 hover:text-white hover:bg-[#1E1038]'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Event Settings</span>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-zinc-950">
              {/* TAB 1: OVERVIEW & STATS */}
              {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                  {/* Revenue Target Progress Bar */}
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-zinc-900 border border-emerald-500/30 shadow-lg space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                          Total Verified Revenue: ₦{stats.totalVerifiedRevenue.toLocaleString('en-NG')}
                        </h4>
                      </div>
                      <span className="text-xs text-zinc-400 font-mono">
                        Target Goal: ₦10,000,000 (
                        {Math.round((stats.totalVerifiedRevenue / 10000000) * 100)}% achieved)
                      </span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.round((stats.totalVerifiedRevenue / 10000000) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                      <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                        <span>Total Revenue</span>
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-2">
                        ₦{stats.totalVerifiedRevenue.toLocaleString('en-NG')}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-1">
                        From {stats.paidOrdersCount} verified Paystack orders
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                      <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                        <span>Confirmed Attendees</span>
                        <Users className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-2xl font-extrabold text-white font-mono mt-2">
                        {stats.totalConfirmedAttendees}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-1">
                        Active UUID passes generated
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                      <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                        <span>Tickets Sold / Inventory</span>
                        <Ticket className="w-4 h-4 text-teal-400" />
                      </div>
                      <div className="text-2xl font-extrabold text-teal-400 font-mono mt-2">
                        {stats.totalSoldTickets} / {stats.totalAvailableInventory}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-1">
                        {Math.round((stats.totalSoldTickets / (stats.totalAvailableInventory || 1)) * 100)}% capacity sold
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                      <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                        <span>Pending / Failed Orders</span>
                        <Clock className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="text-2xl font-extrabold text-zinc-300 font-mono mt-2">
                        {stats.pendingOrdersCount} / {stats.failedOrdersCount}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-1">
                        Unconfirmed checkout attempts
                      </div>
                    </div>
                  </div>

                  {/* Ticket Tier Breakdown */}
                  <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
                    <h3 className="text-base font-bold text-white">Ticket Sales by Category</h3>
                    <div className="space-y-3.5">
                      {stats.tierBreakdown.map((t) => (
                        <div key={t.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-white">
                              {t.name} (₦{t.price.toLocaleString('en-NG')})
                            </span>
                            <span className="text-zinc-400 font-mono">
                              {t.sold} / {t.available} sold ({t.percentSold}%) • ₦{t.revenue.toLocaleString('en-NG')}
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full"
                              style={{ width: `${Math.min(100, t.percentSold)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Spreadsheet Export Launch Bar */}
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        Spreadsheet Export Hub
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Download attendee databases and financial reports with text-formatted UUIDs.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleDownloadExport('all', 'xlsx')}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export All (.xlsx)</span>
                      </button>
                      <button
                        onClick={() => handleDownloadExport('paid', 'xlsx')}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Paid Attendees</span>
                      </button>
                      <button
                        onClick={() => handleDownloadExport('payments', 'xlsx')}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Payment Report</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ATTENDEES & UUIDS */}
              {activeTab === 'attendees' && (
                <div className="space-y-4">
                  {/* Filter & Export Bar */}
                  <div className="p-4 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {/* Search Input */}
                      <div className="relative lg:col-span-2">
                        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Search UUID, name, email, phone, order ref..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 placeholder:text-zinc-600"
                        />
                      </div>

                      {/* Tier Filter */}
                      <select
                        value={tierFilter}
                        onChange={(e) => setTierFilter(e.target.value)}
                        className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="ALL">All Ticket Tiers</option>
                        {tiers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>

                      {/* Payment Filter */}
                      <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="ALL">All Payment Statuses</option>
                        <option value="verified">Verified (Paid)</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed / Abandoned</option>
                      </select>

                      {/* Check-In Filter */}
                      <select
                        value={checkinFilter}
                        onChange={(e) => setCheckinFilter(e.target.value)}
                        className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="ALL">All Check-In States</option>
                        <option value="true">Checked In Only</option>
                        <option value="false">Not Yet Checked In</option>
                      </select>
                    </div>

                    {/* Export Actions for Current View */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800 text-xs">
                      <div className="text-zinc-400">
                        Showing <strong className="text-white">{filteredAttendees.length}</strong> of{' '}
                        {attendees.length} total attendees
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadExport('filtered', 'xlsx')}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export Filtered (.xlsx)</span>
                        </button>
                        <button
                          onClick={() => handleDownloadExport('filtered', 'csv')}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export CSV</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Attendees Table */}
                  <div className="rounded-3xl bg-zinc-900 border border-zinc-800 overflow-x-auto shadow-xl">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-zinc-950/80 text-zinc-400 font-mono uppercase text-[10px] border-b border-zinc-800">
                        <tr>
                          <th className="p-3.5">Attendee UUID</th>
                          <th className="p-3.5">Name</th>
                          <th className="p-3.5">Contact</th>
                          <th className="p-3.5">Ticket Tier</th>
                          <th className="p-3.5">Order Ref</th>
                          <th className="p-3.5">Payment</th>
                          <th className="p-3.5">Check-In</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/80 font-normal">
                        {filteredAttendees.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-zinc-500">
                              No attendees match your filter criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredAttendees.map((att) => (
                            <tr key={att.uuid} className="hover:bg-zinc-800/40 transition-colors">
                              <td className="p-3.5 font-mono text-[11px] text-zinc-400 max-w-[140px] truncate" title={att.uuid}>
                                {att.uuid}
                              </td>
                              <td className="p-3.5 font-semibold text-white">
                                <div>{att.firstName} {att.lastName}</div>
                                {att.institution && (
                                  <div className="text-[10px] text-zinc-500">{att.institution}</div>
                                )}
                              </td>
                              <td className="p-3.5 text-[11px]">
                                <div>{att.email}</div>
                                <div className="text-zinc-500 font-mono">{att.phone}</div>
                              </td>
                              <td className="p-3.5 font-medium text-amber-300">
                                <div>{att.ticketTierName}</div>
                                <div className="text-[10px] text-zinc-500 font-mono">{att.ticketCode}</div>
                              </td>
                              <td className="p-3.5 font-mono text-[11px] text-zinc-400">
                                {att.orderReference}
                              </td>
                              <td className="p-3.5">
                                {att.paymentStatus === 'verified' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Verified
                                  </span>
                                ) : att.paymentStatus === 'pending' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-500/30">
                                    <Clock className="w-3 h-3" />
                                    Pending
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950 text-rose-400 border border-rose-500/30">
                                    <XCircle className="w-3 h-3" />
                                    Failed
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCheckin(att.uuid)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                                    att.checkedIn
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300'
                                      : 'bg-zinc-800 text-zinc-400 hover:bg-emerald-500 hover:text-zinc-950'
                                  }`}
                                  title="Toggle check-in status"
                                >
                                  {att.checkedIn ? 'Checked In' : 'Mark In'}
                                </button>
                              </td>
                              <td className="p-3.5 text-right">
                                <button
                                  onClick={() => setViewingAttendee(att)}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                                  title="View Attendee Record"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: GATE CHECK-IN SCANNER */}
              {activeTab === 'checkin' && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                      <QrCode className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-white">Event Entrance Check-In</h3>
                      <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                        Scan with physical barcode scanner or paste an attendee Ticket Code (e.g. NVT-VIP-74921) or UUID for admission.
                      </p>
                    </div>

                    <form onSubmit={handleFastCheckin} className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Scan or paste Ticket Code or UUID..."
                        value={checkinInput}
                        onChange={(e) => setCheckinInput(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        className="px-6 py-3.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-sm hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                      >
                        Verify & Admit
                      </button>
                    </form>
                  </div>

                  {checkinResult && (
                    <div
                      className={`p-6 rounded-3xl border text-sm space-y-3 ${
                        checkinResult.success
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                          : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 font-bold text-base">
                        {checkinResult.success ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <XCircle className="w-6 h-6 text-rose-400" />
                        )}
                        <span>{checkinResult.message}</span>
                      </div>

                      {checkinResult.attendee && (
                        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs font-mono text-zinc-300 space-y-1.5">
                          <div className="flex justify-between">
                            <span>Name:</span>
                            <span className="text-white font-bold">{checkinResult.attendee.firstName} {checkinResult.attendee.lastName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tier:</span>
                            <span className="text-amber-400">{checkinResult.attendee.ticketTierName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ticket Code:</span>
                            <span className="text-white font-bold">{checkinResult.attendee.ticketCode}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Order Ref:</span>
                            <span>{checkinResult.attendee.orderReference}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: TICKET TIERS MANAGEMENT */}
              {activeTab === 'tiers' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">Ticket Tier Configuration</h3>
                      <p className="text-xs text-zinc-400">
                        Create, edit, or adjust pricing & inventory for all event ticket categories.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingTier(null);
                        setTierForm({
                          name: '',
                          code: '',
                          description: '',
                          price: 25000,
                          availableQuantity: 100,
                          maxPerRegistration: 4,
                          salesStartDate: '2026-08-01',
                          salesEndDate: '2026-11-13',
                          benefits: '',
                          isActive: true,
                          badge: '',
                        });
                        setTierModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Ticket Tier</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tiers.map((t) => (
                      <div
                        key={t.id}
                        className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {t.code} PASS
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              t.isActive
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-zinc-800 text-zinc-500'
                            }`}
                          >
                            {t.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-lg font-bold text-white">{t.name}</h4>
                          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{t.description}</p>
                        </div>

                        <div className="pt-2 border-t border-zinc-800 flex justify-between text-xs">
                          <div>
                            <span className="text-zinc-500 block text-[10px]">Price (NGN)</span>
                            <span className="font-extrabold text-white font-mono text-sm">
                              ₦{t.price.toLocaleString('en-NG')}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px]">Sold / Slots</span>
                            <span className="font-bold text-emerald-400 font-mono">
                              {t.soldQuantity} / {t.availableQuantity}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800/60">
                          <button
                            onClick={() => {
                              setEditingTier(t);
                              setTierForm({
                                name: t.name,
                                code: t.code,
                                description: t.description,
                                price: t.price,
                                availableQuantity: t.availableQuantity,
                                maxPerRegistration: t.maxPerRegistration,
                                salesStartDate: t.salesStartDate,
                                salesEndDate: t.salesEndDate,
                                benefits: t.benefits.join('\n'),
                                isActive: t.isActive,
                                badge: t.badge || '',
                              });
                              setTierModalOpen(true);
                            }}
                            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                            title="Edit Tier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTier(t.id)}
                            className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-900/60 text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
                            title="Delete or Deactivate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: EVENT MENU MANAGEMENT (VIEW-ONLY MENU) */}
              {activeTab === 'menu' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-white">Event Menu Offerings Management</h3>
                      <p className="text-xs text-zinc-400">
                        Manage food, drinks, and merchandise displayed on the public event page.
                        <span className="text-amber-300 font-semibold block sm:inline sm:ml-1">
                          (View-only on frontend — items are strictly non-purchasable online).
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingMenuItem(null);
                        setMenuForm({
                          name: '',
                          description: '',
                          category: 'Food',
                          price: 3500,
                          isAvailable: true,
                          displayOrder: menuItems.length + 1,
                          imageUrl: '',
                          dietaryOrTag: '',
                        });
                        setMenuModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-400 text-zinc-950 hover:bg-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Menu Item</span>
                    </button>
                  </div>

                  <div className="rounded-3xl bg-zinc-900 border border-zinc-800 overflow-x-auto shadow-xl">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-zinc-950/80 text-zinc-400 font-mono uppercase text-[10px] border-b border-zinc-800">
                        <tr>
                          <th className="p-3.5">Order</th>
                          <th className="p-3.5">Item Name</th>
                          <th className="p-3.5">Category</th>
                          <th className="p-3.5">Displayed Price (₦)</th>
                          <th className="p-3.5">Availability</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/80">
                        {menuItems.map((item) => (
                          <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="p-3.5 font-mono text-zinc-500">{item.displayOrder}</td>
                            <td className="p-3.5 font-semibold text-white">
                              <div className="flex items-center gap-3">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-10 h-10 rounded-lg object-cover bg-zinc-800"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                                    <UtensilsCrossed className="w-5 h-5" />
                                  </div>
                                )}
                                <div>
                                  <div>{item.name}</div>
                                  <div className="text-[10px] text-zinc-400 line-clamp-1 max-w-xs font-normal">
                                    {item.description}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 font-mono text-[11px] text-amber-300">{item.category}</td>
                            <td className="p-3.5 font-mono font-bold text-white">
                              ₦{item.price.toLocaleString('en-NG')}
                            </td>
                            <td className="p-3.5">
                              <button
                                type="button"
                                onClick={() => handleToggleMenuAvailability(item)}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                                  item.isAvailable
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-zinc-800 text-zinc-500'
                                }`}
                              >
                                {item.isAvailable ? 'Available at Event' : 'Currently Unavailable'}
                              </button>
                            </td>
                            <td className="p-3.5 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setEditingMenuItem(item);
                                  setMenuForm({
                                    name: item.name,
                                    description: item.description,
                                    category: item.category,
                                    price: item.price,
                                    isAvailable: item.isAvailable,
                                    displayOrder: item.displayOrder,
                                    imageUrl: item.imageUrl || '',
                                    dietaryOrTag: item.dietaryOrTag || '',
                                  });
                                  setMenuModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                title="Edit Item"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMenuItem(item.id)}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/60 text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
                                title="Delete Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: PAYMENT AUDIT TRAIL */}
              {activeTab === 'payments' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">Paystack Payment Audit Trail</h3>
                      <p className="text-xs text-zinc-400">
                        Immutable ledger of payment attempts, webhook callbacks, gateway confirmations, and amounts.
                      </p>
                    </div>

                    <button
                      onClick={() => handleDownloadExport('payments', 'xlsx')}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Payment Report (.xlsx)</span>
                    </button>
                  </div>

                  <div className="rounded-3xl bg-zinc-900 border border-zinc-800 overflow-x-auto shadow-xl">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-zinc-950/80 text-zinc-400 font-mono uppercase text-[10px] border-b border-zinc-800">
                        <tr>
                          <th className="p-3.5">Payment Reference</th>
                          <th className="p-3.5">Order Ref</th>
                          <th className="p-3.5">Amount (NGN)</th>
                          <th className="p-3.5">Channel</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5">Gateway Log</th>
                          <th className="p-3.5">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/80 font-mono text-[11px]">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="p-3.5 font-bold text-white">{p.paymentReference}</td>
                            <td className="p-3.5 text-zinc-400">{p.orderReference}</td>
                            <td className="p-3.5 font-bold text-emerald-400">
                              ₦{p.amount.toLocaleString('en-NG')}
                            </td>
                            <td className="p-3.5 text-zinc-300 uppercase">{p.channel || 'online'}</td>
                            <td className="p-3.5">
                              {p.status === 'verified' ? (
                                <span className="text-emerald-400 font-semibold">VERIFIED</span>
                              ) : p.status === 'pending' ? (
                                <span className="text-amber-400 font-semibold">PENDING</span>
                              ) : (
                                <span className="text-rose-400 font-semibold">FAILED</span>
                              )}
                            </td>
                            <td className="p-3.5 text-zinc-400 max-w-xs truncate" title={p.gatewayResponse}>
                              {p.gatewayResponse || 'Initialized'}
                            </td>
                            <td className="p-3.5 text-zinc-500">
                              {new Date(p.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 7: EVENT SETTINGS */}
              {activeTab === 'settings' && (
                <div className="max-w-3xl space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Event Configuration</h3>
                    <p className="text-xs text-zinc-400">
                      Update live summit titles, banner visuals, venue location, and contact information.
                    </p>
                  </div>

                  <form onSubmit={handleSaveEventSettings} className="space-y-4">
                    <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 text-xs">
                      <div>
                        <label className="block text-zinc-300 font-semibold mb-1">
                          Summit Title
                        </label>
                        <input
                          type="text"
                          required
                          value={eventSettingsForm.title}
                          onChange={(e) =>
                            setEventSettingsForm({ ...eventSettingsForm, title: e.target.value })
                          }
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-300 font-semibold mb-1">
                          Summit Theme
                        </label>
                        <input
                          type="text"
                          required
                          value={eventSettingsForm.theme}
                          onChange={(e) =>
                            setEventSettingsForm({ ...eventSettingsForm, theme: e.target.value })
                          }
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-zinc-300 font-semibold mb-1">Dates</label>
                          <input
                            type="text"
                            value={eventSettingsForm.date}
                            onChange={(e) =>
                              setEventSettingsForm({ ...eventSettingsForm, date: e.target.value })
                            }
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-300 font-semibold mb-1">Venue Name</label>
                          <input
                            type="text"
                            value={eventSettingsForm.venue}
                            onChange={(e) =>
                              setEventSettingsForm({ ...eventSettingsForm, venue: e.target.value })
                            }
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-zinc-300 font-semibold mb-1">
                          Banner Image URL
                        </label>
                        <input
                          type="url"
                          value={eventSettingsForm.bannerImage}
                          onChange={(e) =>
                            setEventSettingsForm({
                              ...eventSettingsForm,
                              bannerImage: e.target.value,
                            })
                          }
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-300 font-semibold mb-1">
                          Full Summit Description
                        </label>
                        <textarea
                          rows={4}
                          value={eventSettingsForm.description}
                          onChange={(e) =>
                            setEventSettingsForm({
                              ...eventSettingsForm,
                              description: e.target.value,
                            })
                          }
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="py-2.5 px-6 rounded-xl font-bold text-xs bg-amber-400 text-zinc-950 hover:bg-amber-300 transition-colors shadow-md shadow-amber-400/20 cursor-pointer"
                      >
                        Save Summit Settings
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: VIEW SINGLE ATTENDEE RECORD */}
        {viewingAttendee && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h4 className="text-base font-bold text-white">Attendee Registration Record</h4>
                <button
                  onClick={() => setViewingAttendee(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase font-mono block">
                    Attendee Full Name
                  </span>
                  <div className="text-xl font-extrabold text-white mt-0.5">
                    {viewingAttendee.firstName} {viewingAttendee.lastName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div>
                    <span className="text-zinc-500 text-[10px] block font-mono">Ticket Code</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {viewingAttendee.ticketCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] block font-mono">Pass Tier</span>
                    <span className="font-semibold text-amber-300">
                      {viewingAttendee.ticketTierName}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] block font-mono">Email</span>
                    <span className="text-zinc-300">{viewingAttendee.email}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] block font-mono">Phone</span>
                    <span className="text-zinc-300">{viewingAttendee.phone}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono mb-1">
                    <span>UNIQUE BACKEND UUID (SYSTEM KEY)</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(viewingAttendee.uuid);
                        setCopiedAttendeeUuid(true);
                        setTimeout(() => setCopiedAttendeeUuid(false), 2000);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-sans"
                    >
                      {copiedAttendeeUuid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedAttendeeUuid ? 'Copied' : 'Copy UUID'}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-900 font-mono text-zinc-300 text-[11px] break-all border border-zinc-800 select-all">
                    {viewingAttendee.uuid}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block font-mono">
                      Gate Check-In Status
                    </span>
                    <span className="font-semibold text-white">
                      {viewingAttendee.checkedIn ? 'Checked In' : 'Not Yet Checked In'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleCheckin(viewingAttendee.uuid)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors cursor-pointer"
                  >
                    Toggle Check-In
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT TICKET TIER */}
        {tierModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl my-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h4 className="text-base font-bold text-white">
                  {editingTier ? 'Edit Ticket Tier' : 'Add New Ticket Tier'}
                </h4>
                <button
                  onClick={() => setTierModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTier} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Ticket Name *</label>
                  <input
                    type="text"
                    required
                    value={tierForm.name}
                    onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Code / Prefix *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VIP, REG, PASS"
                      value={tierForm.code}
                      onChange={(e) => setTierForm({ ...tierForm, code: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Price in Naira (₦) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={tierForm.price}
                      onChange={(e) => setTierForm({ ...tierForm, price: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Total Inventory *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={tierForm.availableQuantity}
                      onChange={(e) =>
                        setTierForm({ ...tierForm, availableQuantity: Number(e.target.value) })
                      }
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Max Per Registration *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={10}
                      value={tierForm.maxPerRegistration}
                      onChange={(e) =>
                        setTierForm({ ...tierForm, maxPerRegistration: Number(e.target.value) })
                      }
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={tierForm.description}
                    onChange={(e) => setTierForm({ ...tierForm, description: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Benefits / Inclusions (One per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Full Summit Access&#10;VIP Lounge Pass&#10;Delegate Welcome Pack"
                    value={tierForm.benefits}
                    onChange={(e) => setTierForm({ ...tierForm, benefits: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveTier"
                    checked={tierForm.isActive}
                    onChange={(e) => setTierForm({ ...tierForm, isActive: e.target.checked })}
                    className="rounded border-zinc-700 text-emerald-500 w-4 h-4 bg-zinc-900 cursor-pointer"
                  />
                  <label htmlFor="isActiveTier" className="text-zinc-300 font-semibold cursor-pointer">
                    Tier is Active & Available for Public Registration
                  </label>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setTierModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-bold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 cursor-pointer"
                  >
                    Save Ticket Tier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT MENU ITEM */}
        {menuModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl my-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h4 className="text-base font-bold text-white">
                  {editingMenuItem ? 'Edit Menu Item' : 'Add View-Only Menu Item'}
                </h4>
                <button
                  onClick={() => setMenuModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMenuItem} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={menuForm.name}
                    onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Category *</label>
                    <select
                      value={menuForm.category}
                      onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="Food">Food</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Refreshments">Refreshments</option>
                      <option value="Merchandise">Merchandise</option>
                      <option value="VIP Lounge">VIP Lounge</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Displayed Price (₦)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={menuForm.price}
                      onChange={(e) => setMenuForm({ ...menuForm, price: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={menuForm.description}
                    onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Image URL</label>
                  <input
                    type="url"
                    value={menuForm.imageUrl}
                    onChange={(e) => setMenuForm({ ...menuForm, imageUrl: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Special Tag (e.g. Chef Special, Spicy, Halal)
                  </label>
                  <input
                    type="text"
                    value={menuForm.dietaryOrTag}
                    onChange={(e) => setMenuForm({ ...menuForm, dietaryOrTag: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isAvailableItem"
                    checked={menuForm.isAvailable}
                    onChange={(e) => setMenuForm({ ...menuForm, isAvailable: e.target.checked })}
                    className="rounded border-zinc-700 text-amber-500 w-4 h-4 bg-zinc-900 cursor-pointer"
                  />
                  <label htmlFor="isAvailableItem" className="text-zinc-300 font-semibold cursor-pointer">
                    Mark as "Available at the Event"
                  </label>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setMenuModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-bold bg-amber-400 text-zinc-950 hover:bg-amber-300 cursor-pointer"
                  >
                    Save Menu Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
