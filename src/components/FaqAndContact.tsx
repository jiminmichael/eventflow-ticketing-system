import React from "react";
import { ArrowUpRight, ArrowUp, Waves, Plus } from "lucide-react";
import { EventDetails } from "../types.js";
interface Props {
  event: EventDetails;
  onNavigateSection: (id: string) => void;
  onOpenAdmin?: () => void;
}
export const FaqAndContact: React.FC<Props> = ({
  event,
  onNavigateSection,
  onOpenAdmin,
}) => (
  <footer id="faqs">
    <div className="section-shell faq-layout">
      <div>
        <p className="eyebrow">A FEW THINGS TO KNOW</p>
        <h2>
          Before you <em>escape.</em>
        </h2>
        <p>
          For bookings, venue details or a little more information, get in touch
          with the team.
        </p>
        <a className="text-link" href={`tel:${event.organizerPhone}`}>
          Let’s talk <ArrowUpRight size={18} />
        </a>
      </div>
      <div className="faq-list">
        {event.faqs.map((faq) => (
          <details key={faq.question}>
            <summary>
              {faq.question}
              <Plus size={17} />
            </summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
    <div className="contact-strip section-shell">
      <div>
        <p className="eyebrow">BOOKINGS & SPONSORSHIP</p>
        <a href={`tel:${event.organizerPhone}`}>+234 903 006 4744</a>
        <a href={`tel:${event.organizerPhoneSecondary}`}>+234 813 117 3415</a>
      </div>
      <div>
        <p className="eyebrow">STAY IN THE KNOW</p>
        <a href={event.socialLinks.instagram} target="_blank" rel="noreferrer">
          @vybecheckGlobal <ArrowUpRight size={16} />
        </a>
        <a
          href={event.socialLinks.hostInstagram}
          target="_blank"
          rel="noreferrer"
        >
          @iam_Bama <ArrowUpRight size={16} />
        </a>
      </div>
    </div>
    <div className="footer-bottom">
      <span className="brand">
        <Waves size={25} />
        The Hideout
      </span>
      <span>© 2026 · {event.organizerName}</span>
      <button onClick={onOpenAdmin}>Organizer access</button>
      <button onClick={() => onNavigateSection("hero")}>Back to top <ArrowUp size={14} aria-hidden="true" /></button>
    </div>
  </footer>
);
