import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Globe,
  Twitter,
  Instagram,
  Linkedin,
  ShieldCheck,
  CreditCard,
  Ticket,
} from 'lucide-react';
import { EventDetails } from '../types.js';

interface FaqAndContactProps {
  event: EventDetails;
  onNavigateSection: (sectionId: string) => void;
  onOpenAdmin?: () => void;
}

export const FaqAndContact: React.FC<FaqAndContactProps> = ({ event, onNavigateSection, onOpenAdmin }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <footer id="faqs" className="bg-[#FAF7F2] text-[#0F291E]">
      {/* FAQ Section */}
      <div className="py-20 border-b border-[#E5DDD0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-3 border border-emerald-300">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F291E]">
              Got Questions? We Have Answers.
            </h2>
            <p className="mt-2 text-[#375245] text-sm">
              Everything you need to know about party passes, Paystack payment verification, view-only menu, and guestlist collation.
            </p>
          </div>

          <div className="space-y-3">
            {event.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl transition-all border ${
                    isOpen
                      ? 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-400/30'
                      : 'bg-white border-[#E5DDD0] hover:border-emerald-400 shadow-sm'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-[#0F291E] hover:text-emerald-800 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#8C9E95] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-700' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#375245] leading-relaxed border-t border-[#E5DDD0] bg-[#FAF7F2]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contact & Venue Information */}
      <div className="py-16 border-b border-[#E5DDD0] bg-[#F3EFE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Organizer Contact */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#0F291E]">Party Host & Support</h3>
              <p className="text-xs text-[#516E60] leading-relaxed">
                Organized by {event.organizerName}. Reach out for VIP cabanas, group bookings, table bottle service, and door inquiries.
              </p>
              <div className="space-y-2.5 text-xs text-[#2D4A3E]">
                <a
                  href={`mailto:${event.organizerEmail}`}
                  className="flex items-center gap-2 hover:text-emerald-700 transition-colors group"
                >
                  <Mail className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span>{event.organizerEmail}</span>
                </a>
                <a
                  href={`tel:${event.organizerPhone}`}
                  className="flex items-center gap-2 hover:text-emerald-700 transition-colors group"
                >
                  <Phone className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span>{event.organizerPhone}</span>
                </a>
              </div>
            </div>

            {/* Venue Location */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#0F291E]">Fiesta Venue</h3>
              <div className="flex items-start gap-2.5 text-xs text-[#2D4A3E]">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#0F291E]">{event.venue}</div>
                  <div className="text-[#516E60] mt-0.5">{event.address}</div>
                  <div className="text-[#516E60]">{event.city}, {event.country}</div>
                </div>
              </div>
              <p className="text-[11px] text-[#516E60]">
                Secure on-site parking and designated shuttle services available from VI and Lekki Phase 1.
              </p>
            </div>

            {/* Social & Security Badges */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#0F291E]">Connect & Stay Updated</h3>
              <div className="flex items-center gap-3">
                {event.socialLinks.twitter && (
                  <a
                    href={event.socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-white border border-[#E5DDD0] flex items-center justify-center text-[#2D4A3E] hover:text-emerald-700 hover:border-emerald-400 transition-all cursor-pointer shadow-sm"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {event.socialLinks.instagram && (
                  <a
                    href={event.socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-white border border-[#E5DDD0] flex items-center justify-center text-[#2D4A3E] hover:text-emerald-700 hover:border-emerald-400 transition-all cursor-pointer shadow-sm"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {event.socialLinks.linkedin && (
                  <a
                    href={event.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-white border border-[#E5DDD0] flex items-center justify-center text-[#2D4A3E] hover:text-emerald-700 hover:border-emerald-400 transition-all cursor-pointer shadow-sm"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {event.socialLinks.website && (
                  <a
                    href={event.socialLinks.website}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-white border border-[#E5DDD0] flex items-center justify-center text-[#2D4A3E] hover:text-emerald-700 hover:border-emerald-400 transition-all cursor-pointer shadow-sm"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-code text-[#516E60]">
                <span className="px-2.5 py-1 rounded bg-white border border-[#E5DDD0] shadow-sm">
                  PAYSTACK NGN INTEGRATED
                </span>
                <span className="px-2.5 py-1 rounded bg-white border border-[#E5DDD0] shadow-sm">
                  DIGITAL QR PASSES
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="py-6 bg-[#FAF7F2] text-xs text-[#516E60]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© 2026 Lagos Party Fiesta & NaijaVibe Events. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[#2D4A3E]">
            <button
              onClick={() => onNavigateSection('tickets')}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Get Passes
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigateSection('menu')}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Party Menu
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigateSection('schedule')}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              DJ Flow
            </button>
            {onOpenAdmin && (
              <>
                <span>•</span>
                <button
                  onClick={onOpenAdmin}
                  className="text-[#8C9E95] hover:text-emerald-700 transition-colors cursor-pointer text-[11px]"
                  title="Organizer & Door Host Sign In"
                >
                  Organizer Access
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
