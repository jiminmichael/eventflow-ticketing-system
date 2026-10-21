import { TicketDownloads } from './components/TicketDownloads.js';
import React, { useState, useEffect } from 'react';
import { EventDetails, TicketTier, MenuItem, Order, Attendee } from './types.js';
import { Navbar } from './components/Navbar.js';
import { Hero } from './components/Hero.js';
import { EventSchedule } from './components/EventSchedule.js';
import { TicketTiers } from './components/TicketTiers.js';
import { RegistrationForm } from './components/RegistrationForm.js';
import { PaystackCheckoutModal } from './components/PaystackCheckoutModal.js';
import { ConfirmationModal } from './components/ConfirmationModal.js';
import { EventMenuSection } from './components/EventMenuSection.js';
import { FaqAndContact } from './components/FaqAndContact.js';
import { AdminPortal } from './components/AdminPortal.js';
import { TicketLookupModal } from './components/TicketLookupModal.js';
import { ToastProvider, useToast } from './components/Toast.js';
import { PartyCollationBanner } from './components/PartyCollationBanner.js';
import { ExportGuestlistModal } from './components/ExportGuestlistModal.js';
import { Loader2, Ticket, ArrowUp, RefreshCw } from 'lucide-react';
import { fallbackEvent, fallbackTicketTiers, fallbackMenuItems } from './fallbackData.js';

interface AttendeeWithQr extends Attendee {
  qrSvg?: string;
}

async function readApiJson(response: Response) {
  const body = await response.text();
  try {
    return JSON.parse(body);
  } catch {
    const detail = body.trim().replace(/\s+/g, ' ').slice(0, 240);
    throw new Error(
      `Payment service returned an invalid response (HTTP ${response.status})${detail ? `: ${detail}` : ''}`,
    );
  }
}

function MainApp() {
  const { showToast } = useToast();
  const [event, setEvent] = useState<EventDetails>(fallbackEvent);
  const [tiers, setTiers] = useState<TicketTier[]>(fallbackTicketTiers);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(fallbackMenuItems);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);

  // Selected ticket tier for registration
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(() => {
    return fallbackTicketTiers.find((t) => t.isActive && (t.inventoryUnlimited || t.soldQuantity < t.availableQuantity)) || null;
  });

  // Registration & Payment state
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  // Paystack checkout modal state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    orderReference: string;
    paymentReference: string;
    totalAmount: number;
    customerEmail: string;
    isSandboxMode?: boolean;
    publicKey?: string;
    authorizationUrl?: string;
  } | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // Confirmation modal state
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [confirmedAttendees, setConfirmedAttendees] = useState<AttendeeWithQr[]>([]);

  // Ticket Lookup modal state
  const [lookupOpen, setLookupOpen] = useState(false);

  // Export Paid Guestlist modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Admin Portal state
  const [adminOpen, setAdminOpen] = useState(() => window.location.pathname === '/admin');
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem('hideout_admin_token');
  });

  // Paystack redirects back with a reference; only the server can confirm payment.
  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get('reference');
    if (!reference || window.location.pathname !== '/order-confirmation') return;
    fetch(`/api/orders/${encodeURIComponent(reference)}`).then(async response => {
      if (!response.ok) throw new Error('Payment reference not found. Use Find my pass or contact support.');
      const { order } = await response.json();
      setCheckoutData({ orderReference: order.orderReference, paymentReference: reference,
        totalAmount: order.totalAmount, customerEmail: order.customerEmail, isSandboxMode: false });
      setCheckoutModalOpen(true);
      await handleConfirmVerification('success', reference);
    }).catch(error => showToast(error.message, 'error'));
  }, []);

  // Load public data on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoadingInitial(true);
      const [eventRes, tiersRes, menuRes] = await Promise.all([
        fetch('/api/event').catch(() => null),
        fetch('/api/tickets').catch(() => null),
        fetch('/api/menu').catch(() => null),
      ]);

      if (eventRes && eventRes.ok) {
        const ev = await eventRes.json();
        if (ev && ev.id) setEvent(ev);
      }
      if (tiersRes && tiersRes.ok) {
        const trs: TicketTier[] = await tiersRes.json();
        if (Array.isArray(trs) && trs.length > 0) {
          setTiers(trs);
          const activeOne = trs.find((t) => t.isActive && (t.inventoryUnlimited || t.soldQuantity < t.availableQuantity));
          if (activeOne) setSelectedTier(activeOne);
        }
      }
      if (menuRes && menuRes.ok) {
        const m = await menuRes.json();
        if (m && Array.isArray(m.items)) {
          setMenuItems(m.items);
        }
      }
    } catch (err) {
      console.warn('[App] Could not load live server data, using cached fallback:', err);
    } finally {
      setIsLoadingInitial(false);
    }
  };

  const handleSelectTier = (tier: TicketTier) => {
    setSelectedTier(tier);
    showToast(`Selected ${tier.name} (₦${tier.price.toLocaleString('en-NG')})`);
    const regSection = document.getElementById('register');
    if (regSection) {
      regSection.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  };

  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  };

  // 1. Initialize Order with Server-Side Price Calculation & Reserve Inventory
  const handleInitializePayment = async (orderData: {
    ticketTierId: string;
    quantity: number;
    purchaser: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      institution?: string;
    };
    attendees: Array<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      institution?: string;
      notes?: string;
    }>;
  }) => {
    setIsInitializingPayment(true);
    setRegistrationError(null);

    try {
      const res = await fetch('/api/orders/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await readApiJson(res);
      if (!res.ok || !data.status) {
        throw new Error(data.message || 'Failed to initialize ticket order');
      }

      setCheckoutData({
        orderReference: data.orderReference,
        paymentReference: data.paymentReference,
        totalAmount: data.totalAmount,
        customerEmail: orderData.purchaser.email,
        isSandboxMode: data.isSandboxMode,
        publicKey: data.publicKey,
        authorizationUrl: data.paystack?.authorization_url,
      });

      showToast('Order initialized. Opening Paystack checkout...', 'info');
      setCheckoutModalOpen(true);
    } catch (err: any) {
      setRegistrationError(err.message || 'Failed to initialize checkout');
      showToast(err.message || 'Failed to initialize checkout', 'error');
    } finally {
      setIsInitializingPayment(false);
    }
  };

  // 2. Complete Server-Side Payment Verification (Never trust browser alone)
  const handleConfirmVerification = async (action: 'success' | 'failed', returnedReference?: string) => {
    const reference = returnedReference || checkoutData?.paymentReference;
    if (!reference) return;
    setIsVerifyingPayment(true);
    setRegistrationError(null);

    try {
      const res = await fetch('/api/orders/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          sandboxAction: action,
        }),
      });

      const data = await readApiJson(res);

      if (!res.ok || !data.status) {
        throw new Error(data.message || 'Payment verification failed or was declined.');
      }

      // Fetch confirmed order with generated QR SVGs
      const orderFetch = await fetch(`/api/orders/${encodeURIComponent(reference)}`);
      if (orderFetch.ok) {
        const fullOrder = await orderFetch.json();
        setConfirmedOrder(fullOrder.order);
        setConfirmedAttendees(fullOrder.attendees);
      } else {
        setConfirmedOrder(data.order);
        setConfirmedAttendees(data.attendees);
      }

      // Close checkout modal & show confirmation ticket
      setCheckoutModalOpen(false);
      window.location.replace(`/tickets/${encodeURIComponent(data.order.orderReference)}`);
      showToast('Payment verified! Your tickets are ready to download.', 'success');

      // Refresh ticket tiers to reflect updated inventory
      fetch('/api/tickets')
        .then((r) => r.json())
        .then(setTiers)
        .catch(() => {});
    } catch (err: any) {
      showToast(`Payment Error: ${err.message}`, 'error');
      setRegistrationError(err.message || 'Payment verification is pending. Please retry.');
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
    sessionStorage.setItem('hideout_admin_token', token);
    showToast('Signed in as Administrator', 'success');
  };

  const handleLogout = () => {
    if (adminToken) void fetch('/api/admin/logout', {method:'POST', headers:{Authorization:`Bearer ${adminToken}`}});
    setAdminToken(null);
    sessionStorage.removeItem('hideout_admin_token');
    showToast('Admin session logged out', 'info');
  };

  const handleTicketFound = (order: Order, atts: AttendeeWithQr[]) => {
    if (order.paymentStatus !== 'verified') { showToast('Payment is not verified yet. Please check payment status.', 'info'); return; }
    window.location.assign(`/tickets/${encodeURIComponent(order.orderReference)}`);
    showToast(`Found Order ${order.orderReference}`, 'success');
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-[var(--brand-obsidian)] flex flex-col items-center justify-center text-[var(--ui-text)] space-y-4 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-[var(--brand-emerald)]/10 border border-[var(--brand-emerald)]/20 flex items-center justify-center text-[var(--ui-success)] mb-2 shadow-sm">
          <Ticket className="w-6 h-6" />
        </div>
        <div className="text-lg font-bold text-[var(--ui-text)]">
          The Hideout — Pool Edition
        </div>
        <p className="text-sm text-[var(--ui-muted)] max-w-md">
          Unable to connect to the event servers. Please check your connection and retry.
        </p>
        <button
          onClick={fetchInitialData}
          className="mt-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--brand-violet)] to-[var(--brand-blue)] hover:from-[var(--brand-violet)] hover:to-[var(--brand-blue)] text-[var(--ui-text)] font-bold text-sm flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-[var(--brand-emerald)]/20 active:scale-95"
        >
          <RefreshCw className="w-4 h-4" /> Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen hideout-app">
      {/* 1. Header / Navbar */}
      <Navbar
        onOpenAdmin={() => setAdminOpen(true)}
        isAdminLoggedIn={Boolean(adminToken)}
        onNavigateSection={handleNavigateSection}
        onOpenLookup={() => setLookupOpen(true)}
        onOpenExportGuestlist={() => setExportModalOpen(true)}
      />

      {/* Main Content Layout */}
      <main>
        {/* Step 1: Event banner and information */}
        <Hero
          event={event}
          onGetTicketsClick={() => handleNavigateSection('tickets')}
          onViewMenuClick={() => handleNavigateSection('menu')}
          onOpenExportModal={() => setExportModalOpen(true)}
          isAdminLoggedIn={Boolean(adminToken)}
        />

        {/* Live Party Payment Collation & Instant Excel Export Bar (Admin-Restricted) */}
        <PartyCollationBanner
          onOpenExportModal={() => setExportModalOpen(true)}
          onOpenAdmin={() => setAdminOpen(true)}
          adminToken={adminToken}
        />

        {/* Step 2: Event DJ lineup and details */}
        <EventSchedule schedule={event.schedule} />

        {/* Step 3: Available ticket tiers */}
        <TicketTiers
          tiers={tiers}
          selectedTierId={selectedTier?.id || ''}
          onSelectTier={handleSelectTier}
        />

        {/* Step 4: Attendee registration form */}
        {tiers.some(t => t.isActive) && <RegistrationForm
          tiers={tiers}
          selectedTier={selectedTier}
          onSelectTier={setSelectedTier}
          onInitializePayment={handleInitializePayment}
          isLoading={isInitializingPayment}
          errorMessage={registrationError}
        />}

        {/* Step 6: Available Event Menu (STRICT REQUIREMENT: Displayed directly below ticket registration and payment section) */}
        {menuItems.length > 0 && <EventMenuSection menuItems={menuItems} />}

        {/* Step 7: Contact information, FAQs, and footer */}
        <FaqAndContact
          event={event}
          onNavigateSection={handleNavigateSection}
          onOpenAdmin={() => setAdminOpen(true)}
        />
      </main>

      {/* Step 5: Paystack payment checkout modal */}
      {checkoutData && (
        <PaystackCheckoutModal
          isOpen={checkoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          orderReference={checkoutData.orderReference}
          paymentReference={checkoutData.paymentReference}
          totalAmount={checkoutData.totalAmount}
          customerEmail={checkoutData.customerEmail}
          isSandboxMode={checkoutData.isSandboxMode}
          authorizationUrl={checkoutData.authorizationUrl}
          errorMessage={registrationError}
          onConfirmVerification={handleConfirmVerification}
          isVerifying={isVerifyingPayment}
        />
      )}

      {/* Confirmation & Printable Attendee Pass Modal */}
      <ConfirmationModal
        isOpen={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        order={confirmedOrder}
        attendees={confirmedAttendees}
        eventName={event.title}
        eventDate={event.date}
        venueName={event.venue}
      />

      {/* Ticket Lookup Modal */}
      <TicketLookupModal
        isOpen={lookupOpen}
        onClose={() => setLookupOpen(false)}
        onTicketFound={handleTicketFound}
      />

      {/* Dedicated Paid Guestlist Export Modal (Restricted to Authenticated Admins) */}
      {exportModalOpen && (
        <ExportGuestlistModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          adminToken={adminToken}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Secure Admin Management Dashboard */}
      {adminOpen && (
        <AdminPortal
          isOpen={adminOpen}
          onClose={() => { setAdminOpen(false); void fetchInitialData(); }}
          adminToken={adminToken}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          event={event}
          onUpdateEvent={(updated) => setEvent(updated)}
        />
      )}
    </div>
  );
}

export default function App() {
  if (window.location.pathname.startsWith('/tickets/')) {
    let reference = '';
    try { reference = decodeURIComponent(window.location.pathname.slice('/tickets/'.length)); } catch {}
    return <TicketDownloads reference={reference} />;
  }
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
