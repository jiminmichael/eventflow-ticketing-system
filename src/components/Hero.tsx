import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Ticket,
  UtensilsCrossed,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Flame,
  FileSpreadsheet,
} from 'lucide-react';
import { EventDetails } from '../types.js';

interface HeroProps {
  event: EventDetails;
  onGetTicketsClick: () => void;
  onViewMenuClick: () => void;
  onOpenExportModal: () => void;
  isAdminLoggedIn?: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  event,
  onGetTicketsClick,
  onViewMenuClick,
  onOpenExportModal,
  isAdminLoggedIn = false,
}) => {
  // Live countdown to party date
  const [timeLeft, setTimeLeft] = useState({
    days: 28,
    hours: 14,
    minutes: 36,
    seconds: 45,
  });

  useEffect(() => {
    const target = new Date('2026-11-14T19:00:00+01:00').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hero"
      className="relative bg-[#0B0614] text-[#FAF5FF] overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#3B2363]/60"
    >
      {/* Dynamic Party Glows & Atmosphere matching Vibrant Duotone in MASTER.md */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-[#7C3AED]/40 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-[#EA580C]/35 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 right-10 w-72 h-72 bg-[#9333EA]/35 rounded-full blur-[140px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Pitch & Call to Action */}
          <div className="lg:col-span-7 space-y-6">
            {/* Theme Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E1038] border border-[#7C3AED]/50 text-[#DDD6FE] text-xs font-bold tracking-wide shadow-sm">
              <Flame className="w-3.5 h-3.5 text-[#EA580C] fill-[#EA580C]" />
              <span>THE ULTIMATE LAGOS PARTY & NIGHTLIFE FIESTA</span>
            </div>

            {/* Main Headline: Bold typography + Editorial accent */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
              Non-Stop Sound,{' '}
              <span className="font-editorial italic font-normal bg-gradient-to-r from-[#A78BFA] via-[#FAF5FF] to-[#EA580C] bg-clip-text text-transparent">
                Fiery Grills & Cocktails
              </span>{' '}
              All Night!
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl font-normal leading-relaxed">
              {event.description ||
                'Welcome to the official party portal! Secure your entry passes, view our mouthwatering menu of drinks and chops available at the venue, and get your verified digital entry pass. Organizers can easily monitor payment collation and export the complete guestlist of everyone who has paid.'}
            </p>

            {/* Event Key Details Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-zinc-300">
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#140A26]/90 border border-[#3B2363]/80 shadow-sm hover:border-[#7C3AED] transition-colors">
                <div className="p-2.5 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] uppercase font-code text-[#A78BFA] font-semibold tracking-wider">
                    Date & Party Hours
                  </div>
                  <div className="font-bold text-white text-sm">{event.date}</div>
                  <div className="text-xs text-[#EA580C] font-semibold">
                    {event.startTime} – {event.endTime}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#140A26]/90 border border-[#3B2363]/80 shadow-sm hover:border-[#7C3AED] transition-colors">
                <div className="p-2.5 rounded-xl bg-[#EA580C]/20 text-[#EA580C] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] uppercase font-code text-[#A78BFA] font-semibold tracking-wider">
                    Beachside Venue
                  </div>
                  <div className="font-bold text-white text-sm truncate max-w-[210px]" title={event.venue}>
                    {event.venue}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {event.city}, {event.country}
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Actions matching MASTER.md buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={onGetTicketsClick}
                className="btn-primary"
              >
                <Ticket className="w-4 h-4" />
                <span>Select Pass & Pay Online</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onViewMenuClick}
                className="btn-secondary group"
              >
                <UtensilsCrossed className="w-4 h-4 text-[#EA580C] group-hover:rotate-12 transition-transform" />
                <span>View Party Menu</span>
                <span className="text-[10px] uppercase font-code px-2 py-0.5 rounded bg-[#EA580C]/20 text-[#FDBA74] border border-[#EA580C]/30 font-bold ml-1">
                  View Only
                </span>
              </button>

              {isAdminLoggedIn && (
                <button
                  onClick={onOpenExportModal}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs bg-[#1E1038] text-[#DDD6FE] border border-[#7C3AED]/70 hover:bg-[#7C3AED] hover:text-white active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-[#7C3AED]/20"
                  title="View verified paid guestlist and download Excel (Admin Authenticated)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#A78BFA]" />
                  <span>Collation & Export</span>
                  <span className="text-[10px] uppercase font-code px-1.5 py-0.5 rounded bg-[#7C3AED]/40 text-[#DDD6FE]">Admin</span>
                </button>
              )}
            </div>

            {/* Micro-Features / Trust signals */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#A78BFA]" />
                Official Paystack Checkout
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-[#EA580C]" />
                Individual UUID & QR Pass
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#A78BFA]" />
                Instant Entry Verification
              </span>
            </div>
          </div>

          {/* Right Live Countdown & Visual Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-3xl bg-[#140A26]/90 border border-[#3B2363] p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#3B2363]/80">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#EA580C] animate-pulse" />
                  <span className="text-xs uppercase font-code tracking-wider text-[#A78BFA] font-bold">
                    Countdown to Doors Open
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-code font-bold bg-[#7C3AED]/30 text-[#DDD6FE] border border-[#7C3AED]/50">
                  Nov 14, 2026
                </span>
              </div>

              {/* Countdown Digits */}
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3 text-center">
                <div className="p-3 rounded-2xl bg-[#0B0614] border border-[#3B2363]">
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#FAF5FF] font-code">
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-code uppercase text-[#A78BFA] mt-1 font-semibold">Days</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#0B0614] border border-[#3B2363]">
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#A78BFA] font-code">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-code uppercase text-[#A78BFA] mt-1 font-semibold">Hours</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#0B0614] border border-[#3B2363]">
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#EA580C] font-code">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-code uppercase text-[#A78BFA] mt-1 font-semibold">Mins</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#0B0614] border border-[#3B2363]">
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#F472B6] font-code">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-code uppercase text-[#A78BFA] mt-1 font-semibold">Secs</div>
                </div>
              </div>

              {/* Party Vibe Showcase Image with Overlay */}
              <div className="relative rounded-2xl overflow-hidden aspect-video border border-[#3B2363] group">
                <img
                  src={
                    event.bannerImage ||
                    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80'
                  }
                  alt="Party Fiesta Lagos"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0614] via-[#0B0614]/40 to-transparent flex flex-col justify-end p-4">
                  <span className="text-xs font-bold text-white tracking-wide">
                    Landmark Beachfront Pavilion, Victoria Island
                  </span>
                  <span className="text-[11px] text-[#A78BFA]">
                    Live DJ Sets • BBQ & Chops • VIP Tables • Fireworks
                  </span>
                </div>
              </div>

              {/* Fast Party Pass Trigger */}
              <div className="pt-2">
                <button
                  onClick={onGetTicketsClick}
                  className="w-full py-3.5 rounded-xl font-bold text-xs bg-[#EA580C] text-white hover:bg-[#C2410C] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#EA580C]/25"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Choose Your Pass & Register</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
