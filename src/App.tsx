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

function MainApp() {
  const { showToast } = useToast();
  const [event, setEvent] = useState<EventDetails>(fallbackEvent);
  const [tiers, setTiers] = useState<TicketTier[]>(fallbackTicketTiers);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(fallbackMenuItems);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);

  // Selected ticket tier for registration
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(() => {
    return fallbackTicketTiers.find((t) => t.isActive && t.soldQuantity < t.availableQuantity) || null;
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
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('naijavibe_admin_token');
  });

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
          const activeOne = trs.find((t) => t.isActive && t.soldQuantity < t.availableQuantity);
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
      regSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
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

      const data = await res.json();
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
  const handleConfirmVerification = async (action: 'success' | 'failed') => {
    if (!checkoutData) return;
    setIsVerifyingPayment(true);

    try {
      const res = await fetch('/api/orders/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: checkoutData.paymentReference,
          sandboxAction: action,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.status) {
        throw new Error(data.message || 'Payment verification failed or was declined.');
      }

      // Fetch confirmed order with generated QR SVGs
      const orderFetch = await fetch(`/api/orders/${checkoutData.paymentReference}`);
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
      setConfirmationOpen(true);
      showToast('Payment verified! Attendee passes issued.', 'success');

      // Refresh ticket tiers to reflect updated inventory
      fetch('/api/tickets')
        .then((r) => r.json())
        .then(setTiers)
        .catch(() => {});
    } catch (err: any) {
      showToast(`Payment Error: ${err.message}`, 'error');
      alert(`Payment Error: ${err.message}`);
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
    localStorage.setItem('naijavibe_admin_token', token);
    showToast('Signed in as Administrator', 'success');
  };

  const handleLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('naijavibe_admin_token');
    showToast('Admin session logged out', 'info');
  };

  const handleTicketFound = (order: Order, atts: AttendeeWithQr[]) => {
    setConfirmedOrder(order);
    setConfirmedAttendees(atts);
    setConfirmationOpen(true);
    showToast(`Found Order ${order.orderReference}`, 'success');
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white space-y-4 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
          <Ticket className="w-6 h-6" />
        </div>
        <div className="text-lg font-bold text-white">
          Lagos Party Fiesta Portal
        </div>
        <p className="text-sm text-zinc-400 max-w-md">
          Unable to connect to the event servers. Please check your connection and retry.
        </p>
        <button
          onClick={fetchInitialData}
          className="mt-3 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-emerald-500/20"
        >
          <RefreshCw className="w-4 h-4" /> Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500 selection:text-zinc-950">
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
        <RegistrationForm
          tiers={tiers}
          selectedTier={selectedTier}
          onSelectTier={setSelectedTier}
          onInitializePayment={handleInitializePayment}
          isLoading={isInitializingPayment}
          errorMessage={registrationError}
        />

        {/* Step 6: Available Event Menu (STRICT REQUIREMENT: Displayed directly below ticket registration and payment section) */}
        <EventMenuSection menuItems={menuItems} />

        {/* Step 7: Contact information, FAQs, and footer */}
        <FaqAndContact event={event} onNavigateSection={handleNavigateSection} />
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
      <ExportGuestlistModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        adminToken={adminToken}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Secure Admin Management Dashboard */}
      <AdminPortal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        adminToken={adminToken}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        event={event}
        onUpdateEvent={(updated) => setEvent(updated)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
