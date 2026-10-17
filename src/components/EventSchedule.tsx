import React, { useState } from 'react';
import { Clock, MapPin, Sparkles, Music, ChevronDown, ChevronUp, UserCheck } from 'lucide-react';
import { EventDetails } from '../types.js';

interface EventScheduleProps {
  schedule: EventDetails['schedule'];
}

export const EventSchedule: React.FC<EventScheduleProps> = ({ schedule }) => {
  const [activeStage, setActiveStage] = useState<string>('ALL');
  // State for tracking which schedule items are expanded on mobile
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const stages = [
    'ALL',
    'Beachside Foyer',
    'Main Party Arena',
    'Food & BBQ Courtyard',
    'Ocean Terrace',
    'Lakeside VIP Club',
  ];

  const filteredSchedule =
    activeStage === 'ALL'
      ? schedule
      : schedule.filter((item) => (item.stage || '').toLowerCase().includes(activeStage.toLowerCase()));

  const toggleItem = (idx: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <section id="schedule" className="py-20 bg-[#FAF7F2] border-b border-[#E5DDD0] text-[#0F291E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-3 border border-emerald-300">
            <Music className="w-3.5 h-3.5 text-emerald-700" />
            <span>ALL-NIGHT PARTY FLOW & DJ SETS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F291E]">
            Curated Party Flow, Grills & DJ Sets
          </h2>
          <p className="mt-3 text-[#375245] text-sm sm:text-base">
            From sunset welcome cocktails to midnight fireworks and after-hours sunrise grooves.
          </p>

          {/* MOBILE DROPDOWN: Stage Filter Dropdown on Smaller Screens */}
          <div className="mt-6 block sm:hidden">
            <label htmlFor="stage-dropdown-mobile" className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
              Filter by Stage / Arena:
            </label>
            <div className="relative">
              <select
                id="stage-dropdown-mobile"
                value={activeStage}
                onChange={(e) => setActiveStage(e.target.value)}
                className="w-full appearance-none py-3 px-4 rounded-xl bg-white border border-emerald-300 text-sm font-bold text-[#0F291E] focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              >
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage === 'ALL' ? 'All Party Stages (All Events)' : stage}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-emerald-700 absolute right-4 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* DESKTOP / TABLET PILL BUTTONS */}
          <div className="hidden sm:flex flex-wrap justify-center gap-2 mt-6">
            {stages.map((stage) => (
              <button
                key={stage}
                onClick={() => setActiveStage(stage)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeStage === stage
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-[#FAF7F2] shadow-sm font-bold'
                    : 'bg-white text-[#2D4A3E] hover:text-emerald-800 border border-[#E5DDD0] hover:border-emerald-300'
                }`}
              >
                {stage === 'ALL' ? 'All Party Stages' : stage}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Timeline */}
        <div className="max-w-4xl mx-auto space-y-3.5">
          {filteredSchedule.map((item, idx) => {
            const isExpanded = Boolean(expandedItems[idx]);
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-[#E5DDD0] hover:border-emerald-400 transition-all shadow-sm group"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-code font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 w-fit">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{item.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.stage && (
                      <div className="flex items-center gap-1.5 text-xs text-teal-800 font-semibold bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 w-fit">
                        <MapPin className="w-3 h-3 text-teal-700" />
                        <span>{item.stage}</span>
                      </div>
                    )}

                    {/* Mobile Detail Toggle Dropdown Button */}
                    <button
                      type="button"
                      onClick={() => toggleItem(idx)}
                      className="sm:hidden text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold ml-auto cursor-pointer p-1"
                      aria-expanded={isExpanded}
                    >
                      <span>{isExpanded ? 'Less' : 'Details'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-[#0F291E] mt-2.5 group-hover:text-emerald-800 transition-colors">
                  {item.title}
                </h3>

                {/* Speaker / Artist Line */}
                {item.speaker && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mt-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{item.speaker}</span>
                  </div>
                )}

                {/* Description - Collapsible on Mobile, always visible on sm+ */}
                {item.description && (
                  <p
                    className={`text-xs text-[#516E60] mt-2 leading-relaxed ${
                      isExpanded ? 'block' : 'hidden sm:block'
                    }`}
                  >
                    {item.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
