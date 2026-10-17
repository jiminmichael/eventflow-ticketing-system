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
  ChevronRight,
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
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-xl border-b border-[#E5DDD0] text-[#0F291E] shadow-sm">
      {/* Top Ticker Bar: Emerald luxury gradient */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-sm text-[#FAF7F2] font-semibold">
        <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
        <span className="truncate tracking-wide text-[#FAF7F2]">
          Lagos Party Fiesta 2026 • Landmark Beach Pavilion • Live Passes, View-Only Menu & Instant QR Issuance
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleNav('hero')}
          className="flex items-center gap-3 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-xl p-1"
          tabIndex={0}
          role="button"
          onKeyDown={(e) => e.key === 'Enter' && handleNav('hero')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 flex items-center justify-center shadow-md shadow-emerald-700/20 font-black text-[#FAF7F2] text-lg border border-emerald-500/30 group-hover:scale-105 transition-transform duration-200">
            <Flame className="w-5 h-5 text-[#FAF7F2] fill-[#FAF7F2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-[#0F291E]">
                Party Fiesta
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-code font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                2026
              </span>
            </div>
            <p className="text-[10px] text-emerald-700 font-semibold tracking-wide">Afrobeats, Grills & Nightlife</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#2D4A3E]">
          <button
            onClick={() => handleNav('hero')}
            className="hover:text-emerald-700 transition-colors cursor-pointer py-1"
          >
            About
          </button>
          <button
            onClick={() => handleNav('schedule')}
            className="hover:text-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer py-1"
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            DJ Lineup
          </button>
          <button
            onClick={() => handleNav('tickets')}
            className="hover:text-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer py-1 font-bold text-[#0F291E] group"
          >
            <Ticket className="w-4 h-4 text-emerald-600 group-hover:rotate-12 transition-transform" />
            Passes & Tables
          </button>
          <button
            onClick={() => handleNav('menu')}
            className="hover:text-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer py-1 text-[#2D4A3E]"
          >
            <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
            Party Menu
            <span className="text-[9px] uppercase font-code px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-800 border border-emerald-200 font-bold">
              View Only
            </span>
          </button>
          <button
            onClick={() => handleNav('faqs')}
            className="hover:text-emerald-700 transition-colors cursor-pointer py-1"
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-50 transition-all shadow-sm cursor-pointer active:scale-95"
              title="Download Excel / CSV of all paid attendees (Admin Authenticated)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Export Paid Guests</span>
              <span className="sm:hidden">Export</span>
            </button>
          )}

          {onOpenLookup && (
            <button
              onClick={onOpenLookup}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#2D4A3E] hover:text-[#0F291E] bg-white border border-[#E5DDD0] hover:border-emerald-500 transition-all cursor-pointer shadow-sm"
              title="Lookup your confirmed ticket pass by Order Ref or UUID"
            >
              <Search className="w-3.5 h-3.5 text-emerald-600" />
              <span>Find Pass</span>
            </button>
          )}

          <button
            onClick={() => handleNav('tickets')}
            className="btn-primary py-2 px-4 text-xs font-extrabold shadow-emerald-700/20"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Get Pass</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm ${
              isAdminLoggedIn
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                : 'bg-white text-[#2D4A3E] border-[#E5DDD0] hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300'
            }`}
            title="Organizer / Door Host Management Portal"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">{isAdminLoggedIn ? 'Host Active' : 'Organizer Portal'}</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#2D4A3E] hover:text-[#0F291E] hover:bg-[#F3EFE6] cursor-pointer border border-[#E5DDD0] focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-600" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E5DDD0] bg-[#FAF7F2] px-4 pt-3 pb-6 space-y-2.5 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="text-[10px] uppercase font-code tracking-wider text-emerald-700 px-2 font-bold">
            Navigation Menu
          </div>

          <button
            onClick={() => handleNav('hero')}
            className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold text-[#0F291E] hover:bg-[#F3EFE6] hover:text-emerald-700 flex items-center justify-between cursor-pointer transition-colors"
          >
            <span>About Fiesta</span>
            <ChevronRight className="w-4 h-4 text-[#8C9E95]" />
          </button>

          <button
            onClick={() => handleNav('schedule')}
            className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold text-[#0F291E] hover:bg-[#F3EFE6] hover:text-emerald-700 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>DJ Lineup & Flow</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C9E95]" />
          </button>

          <button
            onClick={() => handleNav('tickets')}
            className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-bold text-emerald-900 bg-emerald-100/70 border border-emerald-300 flex items-center justify-between cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-emerald-700" />
              <span>Passes & Tables</span>
            </div>
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-700 text-[#FAF7F2] font-code">
              Online
            </span>
          </button>

          <button
            onClick={() => handleNav('menu')}
            className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold text-[#0F291E] hover:bg-[#F3EFE6] hover:text-emerald-700 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
              <span>Party Food & Drinks</span>
            </div>
            <span className="text-[9px] uppercase font-code px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              View Only
            </span>
          </button>

          <button
            onClick={() => handleNav('faqs')}
            className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold text-[#0F291E] hover:bg-[#F3EFE6] hover:text-emerald-700 flex items-center justify-between cursor-pointer transition-colors"
          >
            <span>FAQs & Venue Info</span>
            <ChevronRight className="w-4 h-4 text-[#8C9E95]" />
          </button>

          <div className="pt-3 border-t border-[#E5DDD0] space-y-2">
            {isAdminLoggedIn && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenExportGuestlist();
                }}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:bg-emerald-100"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Paid Guestlist (.xlsx / .csv)</span>
              </button>
            )}

            {onOpenLookup && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLookup();
                }}
                className="w-full py-2.5 rounded-xl font-semibold text-xs bg-white text-[#2D4A3E] border border-[#E5DDD0] flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-500 shadow-sm"
              >
                <Search className="w-4 h-4 text-emerald-600" />
                <span>Find My Ticket Pass</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
