import React from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Waves,
  Sun,
  Music2,
  ArrowDown,
} from "lucide-react";
import { EventDetails } from "../types.js";
interface HeroProps {
  event: EventDetails;
  onGetTicketsClick: () => void;
  onViewMenuClick: () => void;
  onOpenExportModal?: () => void;
  isAdminLoggedIn?: boolean;
}
export const Hero: React.FC<HeroProps> = ({ event, onGetTicketsClick }) => (
  <section id="hero" className="hideout-hero">
    <div className="hero-copy">
      <p className="eyebrow">
        <span className="small-rule" /> THE VYBECHECK WITH BAMA PRESENTS
      </p>
      <h1>
        {event.title === 'The Hideout — Pool Edition' ? <>The Hideout<span>Pool Edition.</span></> : event.title}
      </h1>
      <p className="hero-tagline">{event.subtitle}</p>
      <p className="hero-description">{event.description}</p>
      <div className="hero-details">
        <span>
          <CalendarDays aria-hidden="true" />
          {event.date}
        </span>
        <span>
          <Clock3 aria-hidden="true" />
          {event.startTime} — {event.endTime}
        </span>
      </div>
      <div className="hero-actions">
        <button className="btn-primary" onClick={onGetTicketsClick}>
          Discover your escape <ArrowUpRight size={18} />
        </button>
        <a href="#schedule" className="text-link">
          Explore the experience <ArrowDown size={16} />
        </a>
      </div>
      <div className="hero-note">
        <Waves size={22} aria-hidden="true" />
        <span>A little escape. A beautiful sunset. A whole new vibe.</span>
      </div>
    </div>
    <div className="hero-artwork">
      <div className="poster-frame">
        <img
          src={event.bannerImage}
          alt="The Hideout Pool Edition official event poster: 28 November 2026, 2 PM till late, presented by The Vybecheck with Bama"
          width="1080"
          height="1512"
          fetchPriority="high"
        />
      </div>
      {/* <div className="sunset-glass">
        <Sun size={30} strokeWidth={1.3} aria-hidden="true" />
        <div>
          <span className="eyebrow">SAVE THE SATURDAY</span>
          <strong>Meet us at golden hour.</strong>
        </div>
      </div> */}
      <span className="artwork-caption">THE HIDEOUT / POOL EDITION / 2026</span>
    </div>
    <div className="experience-ribbon">
      {[
        [Waves, "Poolside moments"],
        [Music2, "Music & fun games"],
        [Sun, "Sunset & connection"],
      ].map(([Icon, label]) => {
        const Symbol = Icon as typeof Waves;
        return (
          <span key={String(label)}>
            <Symbol size={19} strokeWidth={1.4} aria-hidden="true" />
            {String(label)}
          </span>
        );
      })}
    </div>
  </section>
);
