import React, { useState } from 'react';
import { Clock, MapPin, User, Sparkles, Flame, Music } from 'lucide-react';
import { EventDetails } from '../types.js';

interface EventScheduleProps {
  schedule: EventDetails['schedule'];
}

export const EventSchedule: React.FC<EventScheduleProps> = ({ schedule }) => {
  const [activeStage, setActiveStage] = useState<string>('ALL');

  const stages = ['ALL', 'Beachside Foyer', 'Main Party Arena', 'Food & BBQ Courtyard', 'Ocean Terrace', 'Lakeside VIP Club'];

  const filteredSchedule = activeStage === 'ALL'
    ? schedule
    : schedule.filter((item) => (item.stage || '').toLowerCase().includes(activeStage.toLowerCase()));

  return (
    <section id="schedule" className="py-20 bg-[#0B0614] border-b border-[#3B2363]/60 text-[#FAF5FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E1038] text-[#DDD6FE] text-xs font-bold mb-3 border border-[#7C3AED]/50">
            <Music className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>ALL-NIGHT PARTY FLOW & DJ SETS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Curated Party Flow, Grills & DJ Sets
          </h2>
          <p className="mt-3 text-zinc-300 text-sm sm:text-base">
            From sunset welcome cocktails to midnight fireworks and after-hours sunrise grooves.
          </p>

          {/* Stage / Area Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {stages.map((stage) => (
              <button
                key={stage}
                onClick={() => setActiveStage(stage)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeStage === stage
                    ? 'bg-[#EA580C] text-white shadow-md shadow-[#EA580C]/25'
                    : 'bg-[#140A26] text-zinc-300 hover:text-white border border-[#3B2363] hover:border-[#7C3AED]'
                }`}
              >
                {stage === 'ALL' ? 'All Party Stages' : stage}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Timeline */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredSchedule.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#140A26] border border-[#3B2363] hover:border-[#7C3AED] transition-all shadow-md group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-code font-bold text-[#A78BFA] bg-[#1E1038] px-3 py-1 rounded-lg border border-[#7C3AED]/40 w-fit">
                  <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>{item.time}</span>
                </div>

                {item.stage && (
                  <div className="flex items-center gap-1.5 text-xs text-[#FDBA74] font-medium bg-[#EA580C]/15 px-2.5 py-1 rounded-md border border-[#EA580C]/30 w-fit">
                    <MapPin className="w-3 h-3 text-[#EA580C]" />
                    <span>{item.stage}</span>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold text-white mt-3 group-hover:text-[#DDD6FE] transition-colors">
                {item.title}
              </h3>

              {item.speaker && (
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-300 mt-2">
                  <Flame className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>{item.speaker}</span>
                </div>
              )}

              {item.description && (
                <p className="text-xs sm:text-sm text-zinc-300 mt-2 font-normal leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
