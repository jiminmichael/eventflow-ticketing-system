import React from "react";
import { Waves, Music2, Sun, Users } from "lucide-react";
import { EventDetails } from "../types.js";
export const EventSchedule: React.FC<{
  schedule: EventDetails["schedule"];
}> = ({ schedule }) => (
  <section id="schedule" className="experience-section section-shell">
    <div className="section-heading">
      <p className="eyebrow">SLOW DOWN. SHOW UP. SOAK IT IN.</p>
      <h2>
        Your Saturday, <em>beautifully spent.</em>
      </h2>
      <p>{schedule[0]?.description}</p>
    </div>
    <div className="experience-grid">
      {[
        {
          Icon: Waves,
          title: "By the pool",
          text: "Ease into the afternoon, poolside.",
        },
        {
          Icon: Music2,
          title: "Find your rhythm",
          text: "Music and fun games to set the mood.",
        },
        {
          Icon: Users,
          title: "Make a connection",
          text: "Good company. New faces. Shared moments.",
        },
        {
          Icon: Sun,
          title: "Chase the sunset",
          text: "Stay for the golden hour on the hilltop.",
        },
      ].map(({ Icon, title, text }, i) => (
        <article className="experience-card" key={title}>
          <span className="card-number">0{i + 1}</span>
          <Icon size={32} strokeWidth={1.2} aria-hidden="true" />
          <h3>{title}</h3>
          <p>{text}</p>
        </article>
      ))}
    </div>
  </section>
);
