import React, { useState } from 'react';
import {
  Ticket,
  Calendar,
  UtensilsCrossed,
  ShieldCheck,
  Search,
  Sparkles,
  Menu,
  X,
  FileSpreadsheet,
  Flame,
} from 'lucide-react';

interface NavbarProps {
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  onNavigateSection: (sectionId: string) => void;
  onOpenLookup?: () => void;
  onOpenExportGuestlist: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAdmin,
  isAdminLoggedIn,
  onNavigateSection,
  onOpenLookup,
  onOpenExportGuestlist,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (sectionId: string) => {
    setMobileMenuOpen(false);
    onNavigateSection(sectionId);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0614]/95 backdrop-blur-md border-b border-[#3B2363]/60 text-white">
      {/* Top Ticker Bar: Vibrant duotone as per MASTER.md */}
      <div className="bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#EA580C] text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-sm text-white">
        <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
        <span className="truncate tracking-wide font-semibold">
          Lagos Party Fiesta 2026 • Landmark Beach Pavilion • Paystack Passes, View-Only Party Menu & Live Guest Collation!
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleNav('hero')}
          className="flex items-center gap-3 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] rounded-xl p-1"
          tabIndex={0}
          role="button"
          onKeyDown={(e) => e.key === 'Enter' && handleNav('hero')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#EA580C] flex items-center justify-center shadow-lg shadow-[#7C3AED]/30 font-black text-white text-lg border border-[#A78BFA]/40 group-hover:scale-105 transition-transform duration-200">
            <Flame className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-[#FAF5FF] to-[#A78BFA] bg-clip-text text-transparent">
                Party Fiesta
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-code font-bold bg-[#7C3AED]/30 text-[#DDD6FE] border border-[#7C3AED]/50">
                2026
              </span>
            </div>
            <p className="text-[10px] text-[#A78BFA] font-medium tracking-wide">Afrobeats, Grills & Nightlife</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-300">
          <button
            onClick={() => handleNav('hero')}
            className="hover:text-[#A78BFA] transition-colors cursor-pointer py-1"
          >
            About
          </button>
          <button
            onClick={() => handleNav('schedule')}
            className="hover:text-[#A78BFA] transition-colors flex items-center gap-1.5 cursor-pointer py-1"
          >
            <Calendar className="w-4 h-4 text-[#A78BFA]" />
            DJ Lineup
          </button>
          <button
            onClick={() => handleNav('tickets')}
            className="hover:text-[#EA580C] transition-colors flex items-center gap-1.5 cursor-pointer py-1 font-bold text-white"
          >
            <Ticket className="w-4 h-4 text-[#EA580C]" />
            Passes & Tables
          </button>
          <button
            onClick={() => handleNav('menu')}
            className="hover:text-[#A78BFA] transition-colors flex items-center gap-1.5 cursor-pointer py-1 text-zinc-200"
          >
            <UtensilsCrossed className="w-4 h-4 text-[#EA580C]" />
            Party Menu
            <span className="text-[10px] uppercase font-code px-1.5 py-0.5 rounded bg-[#EA580C]/20 text-[#FDBA74] border border-[#EA580C]/40 font-bold">
              View Only
            </span>
          </button>
          <button
            onClick={() => handleNav('faqs')}
            className="hover:text-[#A78BFA] transition-colors cursor-pointer py-1"
          >
            FAQs
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Prominent Export Paid Guestlist Button - RESTRICTED: Only visible when admin is authenticated */}
          {isAdminLoggedIn && (
            <button
              onClick={onOpenExportGuestlist}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#DDD6FE] bg-[#1E1038] border border-[#7C3AED]/60 hover:bg-[#7C3AED] hover:text-white transition-all shadow-md shadow-[#7C3AED]/20 cursor-pointer active:scale-95"
              title="Download Excel / CSV of all paid attendees (Admin Authenticated)"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#A78BFA]" />
              <span className="hidden sm:inline">Export Paid Guests</span>
              <span className="sm:hidden">Export</span>
            </button>
          )}

          {onOpenLookup && (
            <button
              onClick={onOpenLookup}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-[#140A26] border border-[#3B2363] hover:border-[#7C3AED] transition-all cursor-pointer"
              title="Lookup your confirmed ticket pass by Order Ref or UUID"
            >
              <Search className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Find Pass</span>
            </button>
          )}

          <button
            onClick={() => handleNav('tickets')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#EA580C] text-white hover:bg-[#C2410C] active:scale-[0.98] transition-all shadow-md shadow-[#EA580C]/30 cursor-pointer"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Get Pass</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isAdminLoggedIn
                ? 'bg-[#7C3AED]/30 text-[#DDD6FE] border-[#7C3AED] shadow-sm shadow-[#7C3AED]/30'
                : 'bg-[#140A26] text-zinc-300 border-[#3B2363] hover:bg-[#1F1138] hover:text-white hover:border-[#7C3AED]'
            }`}
            title="Organizer / Door Host Management Portal"
          >
            <ShieldCheck className="w-4 h-4 text-[#A78BFA]" />
            <span className="hidden sm:inline">{isAdminLoggedIn ? 'Host Active' : 'Organizer Portal'}</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-[#1E1038] cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#3B2363] bg-[#0E071A] px-4 pt-2 pb-6 space-y-3">
          <button
            onClick={() => handleNav('hero')}
            className="w-full text-left py-2 text-sm font-semibold text-zinc-200 hover:text-[#A78BFA] cursor-pointer"
          >
            About
          </button>
          <button
            onClick={() => handleNav('schedule')}
            className="w-full text-left py-2 text-sm font-semibold text-zinc-200 hover:text-[#A78BFA] flex items-center justify-between cursor-pointer"
          >
            <span>DJ Lineup & Flow</span>
            <Calendar className="w-4 h-4 text-[#A78BFA]" />
          </button>
          <button
            onClick={() => handleNav('tickets')}
            className="w-full text-left py-2 text-sm font-bold text-[#EA580C] flex items-center justify-between cursor-pointer"
          >
            <span>Passes & Tables</span>
            <Ticket className="w-4 h-4 text-[#EA580C]" />
          </button>
          <button
            onClick={() => handleNav('menu')}
            className="w-full text-left py-2 text-sm font-semibold text-zinc-200 hover:text-[#A78BFA] flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span>Party Menu</span>
              <span className="text-[10px] uppercase font-code px-1.5 py-0.5 rounded bg-[#EA580C]/20 text-[#FDBA74] border border-[#EA580C]/40 font-bold">
                View Only
              </span>
            </div>
            <UtensilsCrossed className="w-4 h-4 text-[#EA580C]" />
          </button>
          <button
            onClick={() => handleNav('faqs')}
            className="w-full text-left py-2 text-sm font-semibold text-zinc-200 hover:text-[#A78BFA] cursor-pointer"
          >
            FAQs
          </button>

          <div className="pt-2 border-t border-[#3B2363] space-y-2">
            {isAdminLoggedIn && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenExportGuestlist();
                }}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#1E1038] text-[#DDD6FE] border border-[#7C3AED]/70 flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#A78BFA]" />
                <span>Export Paid Guestlist (.xlsx / .csv)</span>
              </button>
            )}

            {onOpenLookup && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLookup();
                }}
                className="w-full py-2.5 rounded-xl font-medium text-xs bg-[#140A26] text-zinc-300 border border-[#3B2363] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#A78BFA]" />
                <span>Find My Ticket Pass</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
