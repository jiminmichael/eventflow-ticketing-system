import React, { useState } from 'react';
import { MenuItem } from '../types.js';
import {
  UtensilsCrossed,
  Info,
  Search,
  MapPin,
  X,
  Sparkles,
  ChevronDown,
  LayoutGrid,
  List,
} from 'lucide-react';

interface EventMenuSectionProps {
  menuItems: MenuItem[];
}

export const EventMenuSection: React.FC<EventMenuSectionProps> = ({ menuItems }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemDetail, setSelectedItemDetail] = useState<MenuItem | null>(null);
  const [mobileViewMode, setMobileViewMode] = useState<'grid' | 'compact'>('compact');

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(menuItems.map((m) => m.category)))];

  const filteredItems = menuItems.filter((m) => {
    if (selectedCategory !== 'ALL' && m.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        (m.dietaryOrTag && m.dietaryOrTag.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <section id="menu" className="py-20 bg-[#FAF7F2] text-[#0F291E] border-b border-[#E5DDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-3 border border-emerald-300">
            <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-700" />
            <span>AVAILABLE AT THE PARTY • VIEW ONLY</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F291E]">
            Party Food, Grills & Drinks Menu
          </h2>

          <p className="mt-3 text-[#375245] text-sm sm:text-base leading-relaxed">
            Check out what will be cooking and pouring at the party! Smoky firewood asun, juicy suya skewers, craft cocktails, champagne, and ice-cold beers.
          </p>
        </div>

        {/* View-Only Informational Alert Banner */}
        <div className="max-w-4xl mx-auto mb-10 p-5 rounded-3xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 text-xs sm:text-sm flex items-start gap-3.5 shadow-sm">
          <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-extrabold text-[#0F291E] flex items-center gap-2 text-sm">
              <span>View-Only Menu • Ordered & Paid At Venue Stalls</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-code uppercase font-bold border border-emerald-300">
                On-Site Food & Drinks
              </span>
            </div>
            <p className="text-[#375245] text-xs leading-relaxed">
              All menu offerings below are for viewing only so guests know what food and drinks are available.
              <strong className="text-[#0F291E]"> Items cannot be purchased online or added to your entry ticket order.</strong> All food, grills, and drinks are purchased directly at the stalls during the fiesta.
            </p>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          {/* Search Box */}
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search suya, asun, jollof, cocktails, chapman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D5CDC0] rounded-2xl text-xs sm:text-sm text-[#0F291E] focus:outline-none focus:border-emerald-600 placeholder:text-[#8C9E95] transition-colors shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-[#516E60] hover:text-[#0F291E] text-xs cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* MOBILE DROPDOWN: Category Filter on Smaller Screens */}
          <div className="block sm:hidden">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="mobile-menu-category" className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Filter Category:
              </label>
              {/* Mobile View Toggle: Grid vs Compact */}
              <div className="flex items-center bg-white border border-[#D5CDC0] rounded-lg p-0.5 text-xs shadow-sm">
                <button
                  type="button"
                  onClick={() => setMobileViewMode('compact')}
                  className={`px-2 py-1 rounded flex items-center gap-1 cursor-pointer ${
                    mobileViewMode === 'compact' ? 'bg-emerald-700 text-[#FAF7F2] font-bold' : 'text-[#516E60]'
                  }`}
                  title="Compact list view"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileViewMode('grid')}
                  className={`px-2 py-1 rounded flex items-center gap-1 cursor-pointer ${
                    mobileViewMode === 'grid' ? 'bg-emerald-700 text-[#FAF7F2] font-bold' : 'text-[#516E60]'
                  }`}
                  title="Grid cards view"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <select
                id="mobile-menu-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none py-3 px-4 rounded-xl bg-white border border-emerald-300 text-sm font-bold text-[#0F291E] focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'ALL' ? 'All Party Offerings (Food, Drinks, Merch)' : cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-emerald-700 absolute right-4 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* DESKTOP / TABLET PILL BUTTONS */}
          <div className="hidden sm:flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-[#FAF7F2] shadow-sm font-bold'
                    : 'bg-white text-[#2D4A3E] hover:text-emerald-800 border border-[#E5DDD0] hover:border-emerald-300'
                }`}
              >
                {cat === 'ALL' ? 'All Party Offerings' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Rendering */}
        {filteredItems.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-3xl border border-[#E5DDD0] text-[#516E60] max-w-md mx-auto space-y-2 shadow-sm">
            <UtensilsCrossed className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-semibold text-[#0F291E]">No party items match your search</p>
            <p className="text-xs text-[#516E60]">Try selecting another category or clear your search query.</p>
          </div>
        ) : (
          <>
            {/* MOBILE COMPACT LIST VIEW (Shown on mobile when compact mode is active) */}
            <div className={`sm:hidden space-y-3 ${mobileViewMode === 'compact' ? 'block' : 'hidden'}`}>
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemDetail(item)}
                  className="p-3.5 rounded-2xl bg-white border border-[#E5DDD0] hover:border-emerald-400 flex items-center gap-3.5 cursor-pointer shadow-sm active:scale-[0.99] transition-all"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#E5DDD0]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-sm font-bold text-[#0F291E] truncate">{item.name}</h4>
                      <span className="text-xs font-extrabold text-emerald-800 font-code shrink-0">
                        ₦{item.price.toLocaleString('en-NG')}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#516E60] line-clamp-1 mt-0.5">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] uppercase font-bold text-[#516E60] px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DDD0]">
                        {item.category}
                      </span>
                      {item.dietaryOrTag && (
                        <span className="text-[9px] font-bold text-emerald-800 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                          {item.dietaryOrTag}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* GRID VIEW (Desktop always; Mobile when grid mode is active) */}
            <div className={`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${
              mobileViewMode === 'compact' ? 'hidden sm:grid' : 'grid'
            }`}>
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemDetail(item)}
                  className="flex flex-col rounded-3xl bg-white border border-[#E5DDD0] overflow-hidden hover:border-emerald-400 transition-all duration-200 shadow-sm group cursor-pointer"
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedItemDetail(item)}
                >
                  {/* Item Thumbnail */}
                  <div className="relative h-48 bg-[#FAF7F2] overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-700">
                        <UtensilsCrossed className="w-12 h-12" />
                      </div>
                    )}

                    {/* Dietary / Feature Tag */}
                    {item.dietaryOrTag && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white/95 backdrop-blur-md text-emerald-800 border border-emerald-200 shadow-sm">
                        {item.dietaryOrTag}
                      </span>
                    )}

                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[9px] font-code uppercase font-bold bg-white/95 text-[#2D4A3E] border border-[#E5DDD0] shadow-sm">
                      {item.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-[#0F291E] text-base group-hover:text-emerald-800 transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#516E60] mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E5DDD0] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-code text-[#516E60] font-semibold">
                          Price at Venue
                        </div>
                        <div className="text-lg font-black font-code text-emerald-800">
                          ₦{item.price.toLocaleString('en-NG')}
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold text-[#516E60] group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                        Details ▾
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal Item Detail View */}
        {selectedItemDetail && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedItemDetail(null)}
          >
            <div
              className="relative max-w-md w-full rounded-3xl bg-white border border-[#E5DDD0] overflow-hidden shadow-2xl p-6 text-[#0F291E] space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#FAF7F2] hover:bg-[#EAE4D8] text-[#2D4A3E] hover:text-[#0F291E] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <img
                src={selectedItemDetail.imageUrl}
                alt={selectedItemDetail.name}
                className="w-full h-52 object-cover rounded-2xl border border-[#E5DDD0]"
              />

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-code uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {selectedItemDetail.category}
                  </span>
                  {selectedItemDetail.dietaryOrTag && (
                    <span className="text-[10px] font-bold text-teal-800">
                      • {selectedItemDetail.dietaryOrTag}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-[#0F291E]">{selectedItemDetail.name}</h3>
                <p className="text-xs text-[#516E60] mt-2 leading-relaxed">
                  {selectedItemDetail.description}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DDD0] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#516E60] uppercase font-code">Venue Counter Price</div>
                  <div className="text-xl font-black text-emerald-800 font-code">
                    ₦{selectedItemDetail.price.toLocaleString('en-NG')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-amber-700 font-bold uppercase font-code">Payment Method</div>
                  <div className="text-xs text-[#2D4A3E] font-medium">POS / Cash at Stall</div>
                </div>
              </div>

              <div className="text-[11px] text-[#375245] bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Reminder: Food & drinks are purchased on-site and cannot be added to ticket checkout.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
