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
}

export const FaqAndContact: React.FC<FaqAndContactProps> = ({ event, onNavigateSection }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <footer id="faqs" className="bg-[#0B0614] text-[#FAF5FF]">
      {/* FAQ Section */}
      <div className="py-20 border-b border-[#3B2363]/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E1038] text-[#DDD6FE] text-xs font-bold mb-3 border border-[#7C3AED]/50">
              <HelpCircle className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Got Questions? We Have Answers.</h2>
            <p className="mt-2 text-zinc-300 text-sm">
              Everything you need to know about party passes, Paystack payment verification, view-only menu, and guestlist collation.
            </p>
          </div>

          <div className="space-y-3">
            {event.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#140A26] border border-[#3B2363] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-white hover:text-[#A78BFA] transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#EA580C]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-[#3B2363]/60 bg-[#0B0614]/60">
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
      <div className="py-16 border-b border-zinc-800 bg-zinc-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Organizer Contact */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Party Host & Support</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Organized by {event.organizerName}. Reach out for VIP cabanas, group bookings, table bottle service, and door inquiries.
              </p>
              <div className="space-y-2 text-xs text-zinc-300">
                <a
                  href={`mailto:${event.organizerEmail}`}
                  className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
                >
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>{event.organizerEmail}</span>
                </a>
                <a
                  href={`tel:${event.organizerPhone}`}
                  className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>{event.organizerPhone}</span>
                </a>
              </div>
            </div>

            {/* Venue Location */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Summit Venue</h3>
              <div className="flex items-start gap-2.5 text-xs text-zinc-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">{event.venue}</div>
                  <div className="text-zinc-400 mt-0.5">{event.address}</div>
                  <div className="text-zinc-400">{event.city}, {event.country}</div>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500">
                Secure on-site parking and designated shuttle services available from VI and Lekki Phase 1.
              </p>
            </div>

            {/* Social & Security Badges */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Connect & Stay Updated</h3>
              <div className="flex items-center gap-3">
                {event.socialLinks.twitter && (
                  <a
                    href={event.socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {event.socialLinks.instagram && (
                  <a
                    href={event.socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {event.socialLinks.linkedin && (
                  <a
                    href={event.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {event.socialLinks.website && (
                  <a
                    href={event.socialLinks.website}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="pt-2 text-xs text-zinc-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Paystack Verified Merchant • Instant UUID Issuance</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <div>
          © 2026 NaijaVibe Tech & Culture Summit. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigateSection('tickets')}
            className="hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Ticket Tiers
          </button>
          <button
            onClick={() => onNavigateSection('menu')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Event Menu
          </button>
          <button
            onClick={() => onNavigateSection('schedule')}
            className="hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Programme
          </button>
        </div>
      </div>
    </footer>
  );
};
