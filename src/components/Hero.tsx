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
  Music2,
  Waves,
} from 'lucide-react';
import { EventDetails } from '../types.js';

interface HeroProps {
  event: EventDetails;
  onGetTicketsClick: () => void;
  onViewMenuClick: () => void;
  onOpenExportModal?: () => void;
  isAdminLoggedIn?: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  event,
  onGetTicketsClick,
  onViewMenuClick,
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
      className="relative bg-[#FAF7F2] text-[#0F291E] overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#E5DDD0]"
    >
      {/* Warm Milk & Emerald Atmosphere Glows */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute -top-10 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[170px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 right-10 w-72 h-72 bg-emerald-300/15 rounded-full blur-[140px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Pitch & Call to Action */}
          <div className="lg:col-span-7 space-y-6">
            {/* Theme Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-300/70 text-emerald-900 text-xs font-bold tracking-wide shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>THE ULTIMATE LAGOS AFROBEATS & NIGHTLIFE FIESTA</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0F291E] leading-[1.08]">
              Non-Stop Sound,{' '}
              <span className="font-editorial italic font-normal bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 bg-clip-text text-transparent">
                Fiery Grills & Cocktails
              </span>{' '}
              All Night!
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#375245] max-w-2xl font-normal leading-relaxed">
              {event.description ||
                'Welcome to the official party portal! Secure your entry passes, view our mouthwatering menu of drinks and chops available at the venue, and get your verified digital entry pass. Instant Paystack online payment and real-time pass generation.'}
            </p>

            {/* Event Key Details Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-sm">
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#E5DDD0] shadow-sm hover:border-emerald-500/50 transition-all">
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 shrink-0 border border-emerald-200">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-code text-emerald-700 font-bold tracking-wider">
                    Date & Party Hours
                  </div>
                  <div className="font-bold text-[#0F291E] text-sm">{event.date}</div>
                  <div className="text-xs text-emerald-800 font-semibold">
                    {event.startTime} – {event.endTime}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#E5DDD0] shadow-sm hover:border-emerald-500/50 transition-all">
                <div className="p-3 rounded-xl bg-teal-50 text-teal-700 shrink-0 border border-teal-200">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-code text-teal-700 font-bold tracking-wider">
                    Beachside Venue
                  </div>
                  <div className="font-bold text-[#0F291E] text-sm truncate max-w-[210px]" title={event.venue}>
                    {event.venue}
                  </div>
                  <div className="text-xs text-[#516E60]">
                    {event.city}, {event.country}
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={onGetTicketsClick}
                className="btn-primary text-sm shadow-md"
              >
                <Ticket className="w-4 h-4" />
                <span>Select Pass & Pay Online</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onViewMenuClick}
                className="btn-secondary text-sm"
              >
                <UtensilsCrossed className="w-4 h-4 text-emerald-700" />
                <span>Explore Party Menu</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-code font-bold">
                  View Only
                </span>
              </button>
            </div>

            {/* Quick Guarantees */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#516E60]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Paystack Verified Instant Pass</span>
              </div>
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-teal-600" />
                <span>Landmark Beach Waterfront</span>
              </div>
              <div className="flex items-center gap-2">
                <Music2 className="w-4 h-4 text-emerald-700" />
                <span>Top Lagos DJs & Headliners</span>
              </div>
            </div>
          </div>

          {/* Right: Live Countdown & Digital Pass Preview Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-white p-6 sm:p-8 border border-[#E5DDD0] shadow-xl shadow-emerald-950/5">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-6 border-b border-[#E5DDD0]">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-code font-bold uppercase tracking-wider text-emerald-800">
                    Party Countdown Clock
                  </span>
                </div>
                <span className="text-xs font-code px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                  WAT Lagos Time
                </span>
              </div>

              {/* Countdown Digits */}
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 my-6 text-center">
                <div className="p-3 sm:p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DDD0]">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-code">
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-[#516E60] mt-1">Days</div>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DDD0]">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-code">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-[#516E60] mt-1">Hours</div>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DDD0]">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-code">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-[#516E60] mt-1">Mins</div>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DDD0]">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-code animate-pulse">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-[#516E60] mt-1">Secs</div>
                </div>
              </div>

              {/* Pass Highlights Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#0F291E]">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="font-bold">Instant Digital Pass Issuance</span>
                  </span>
                  <span className="text-emerald-700 font-code font-bold">Unique QR</span>
                </div>
                <p className="text-xs text-[#375245] leading-relaxed">
                  Every attendee receives a unique cryptographic QR pass for rapid red-carpet scanning at Landmark Beach Waterfront.
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-emerald-200/70 text-[11px] text-[#2D4A3E]">
                  <span>Standard & VIP Passes Active</span>
                  <span className="text-emerald-800 font-bold">From ₦8,000</span>
                </div>
              </div>

              {/* Bottom Quick Button */}
              <button
                onClick={onGetTicketsClick}
                className="mt-6 w-full py-3.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-[#FAF7F2] hover:from-emerald-500 hover:to-teal-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-700/20 active:scale-98"
              >
                <span>Grab Your Passes Before Sold Out</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
