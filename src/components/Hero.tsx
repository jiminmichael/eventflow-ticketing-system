import React from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CalendarPlus,
  Clock3,
  Waves,
  Sun,
  Music2,
  ArrowDown,
} from "lucide-react";
import { EventDetails } from "../types.js";

const calendarDate = (value: string): Date | null => {
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  const date = isoDate
    ? new Date(Date.UTC(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3])))
    : new Date(value);

  if (Number.isNaN(date.getTime())) return null;
  if (isoDate && date.toISOString().slice(0, 10) !== value.trim()) return null;
  return date;
};

const googleCalendarUrl = (event: EventDetails): string | null => {
  const start = calendarDate(event.date);
  const end = calendarDate(event.endDate || event.date);
  if (!start || !end || end < start) return null;

  end.setUTCDate(end.getUTCDate() + 1);
  const formatDate = (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, "");
  const details = [
    `Time: ${event.startTime} – ${event.endTime}`,
    event.description,
  ].join("\n\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatDate(start)}/${formatDate(end)}`,
    details,
    location: [event.venue, event.address, event.city, event.country]
      .filter(Boolean)
      .join(", "),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

interface HeroProps {
  event: EventDetails;
  onGetTicketsClick: () => void;
  onViewMenuClick: () => void;
  onOpenExportModal?: () => void;
  isAdminLoggedIn?: boolean;
}
export const Hero: React.FC<HeroProps> = ({ event, onGetTicketsClick }) => {
  const calendarUrl = googleCalendarUrl(event);

  return (
  <section id="hero" className="hideout-hero">
    <div className="hero-copy">
      <p className="eyebrow">
        <span className="small-rule" /> THE VYBECHECK WITH BAMA PRESENTS
      </p>
      <h1>
        {event.title === 'The Hideout — Pool Edition' ? <>The Hideout<span className="hero-pool-edition">Pool Edition.</span></> : event.title}
      </h1>
      <p className="hero-tagline">{event.subtitle}</p>
      <p className="hero-description">{event.description}</p>
      <div className="hero-details">
        {calendarUrl ? (
          <a
            className="hero-calendar-link"
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Add ${event.title} on ${event.date} to Google Calendar`}
            title="Add event to Google Calendar"
          >
            <CalendarDays aria-hidden="true" />
            {event.date}
            <CalendarPlus className="hero-calendar-add" aria-hidden="true" />
          </a>
        ) : (
          <span>
            <CalendarDays aria-hidden="true" />
            {event.date}
          </span>
        )}
        <span>
          <Clock3 aria-hidden="true" />
          {event.startTime} — {event.endTime}
        </span>
      </div>
      <div className="hero-actions">
        <button className="btn-primary" onClick={onGetTicketsClick}>
          Discover your hideout <ArrowUpRight size={18} />
        </button>
        <a href="#schedule" className="text-link">
          Explore the experience <ArrowDown size={16} />
        </a>
      </div>
      <div className="hero-note">
        <Waves size={22} aria-hidden="true" />
        <span>A little hideout. A beautiful sunset. A whole new vibe.</span>
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
};
