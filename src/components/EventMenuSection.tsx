import React, { useState } from 'react';
import { MenuItem } from '../types.js';
import {
  UtensilsCrossed,
  Info,
  CheckCircle2,
  XCircle,
  Search,
  MapPin,
  X,
  Sparkles,
  Flame,
  Wine,
} from 'lucide-react';

interface EventMenuSectionProps {
  menuItems: MenuItem[];
}

export const EventMenuSection: React.FC<EventMenuSectionProps> = ({ menuItems }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemDetail, setSelectedItemDetail] = useState<MenuItem | null>(null);

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
    <section id="menu" className="py-20 bg-[#0B0614] text-[#FAF5FF] border-b border-[#3B2363]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E1038] text-[#DDD6FE] text-xs font-bold mb-3 border border-[#7C3AED]/50">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>AVAILABLE AT THE PARTY • VIEW ONLY</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Party Food, Grills & Drinks Menu
          </h2>

          <p className="mt-3 text-zinc-300 text-sm sm:text-base leading-relaxed">
            Check out what will be cooking and pouring at the party! Smoky firewood asun, juicy suya skewers, craft cocktails, champagne, and ice-cold beers.
          </p>
        </div>

        {/* View-Only Informational Alert Banner (Strict Requirement) */}
        <div className="max-w-4xl mx-auto mb-10 p-5 rounded-3xl bg-[#1E1038] border border-[#7C3AED]/60 text-[#DDD6FE] text-xs sm:text-sm flex items-start gap-3.5 shadow-xl">
          <Info className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-extrabold text-white flex items-center gap-2 text-sm">
              <span>View-Only Menu • No Online Checkout for Food/Drinks</span>
              <span className="px-2 py-0.5 rounded bg-[#EA580C]/25 text-[#FDBA74] text-[10px] font-code uppercase font-bold border border-[#EA580C]/40">
                Pay on site
              </span>
            </div>
            <p className="text-zinc-300 text-xs leading-relaxed">
              All menu offerings below are for viewing only so guests know what food and drinks are available.
              <strong className="text-white"> Items cannot be purchased online, added to a cart, or included in your party ticket payment.</strong>
              All dishes, grills, and drinks are ordered and paid for directly at the food stalls and bars during the party via cash, POS card, or transfer.
            </p>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="max-w-4xl mx-auto mb-10 space-y-4">
          {/* Search Box */}
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-[#A78BFA] absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search suya, asun, jollof, cocktails, chapman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#140A26] border border-[#3B2363] rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#7C3AED] placeholder:text-zinc-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-zinc-400 hover:text-white text-xs cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#EA580C] text-white shadow-md shadow-[#EA580C]/25 font-bold'
                    : 'bg-[#140A26] text-zinc-300 hover:text-white border border-[#3B2363] hover:border-[#7C3AED]'
                }`}
              >
                {cat === 'ALL' ? 'All Party Offerings' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center p-12 bg-[#140A26] rounded-3xl border border-[#3B2363] text-zinc-400 max-w-md mx-auto space-y-2">
            <UtensilsCrossed className="w-8 h-8 text-[#A78BFA] mx-auto" />
            <p className="font-semibold text-white">No party items match your search</p>
            <p className="text-xs text-zinc-400">Try selecting another category or clear your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItemDetail(item)}
                className="flex flex-col rounded-3xl bg-[#140A26] border border-[#3B2363] overflow-hidden hover:border-[#7C3AED] transition-all duration-200 shadow-md group cursor-pointer"
                tabIndex={0}
                role="button"
                onKeyDown={(e) => e.key === 'Enter' && setSelectedItemDetail(item)}
              >
                {/* Item Thumbnail */}
                <div className="relative h-48 bg-[#0B0614] overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#140A26] text-[#A78BFA]">
                      <UtensilsCrossed className="w-12 h-12" />
                    </div>
                  )}

                  {/* Dietary / Feature Tag */}
                  {item.dietaryOrTag && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-[#0B0614]/85 backdrop-blur-md text-[#FDBA74] border border-[#EA580C]/40">
                      {item.dietaryOrTag}
                    </span>
                  )}

                  {/* Availability Badge */}
                  <span
                    className={`absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 ${
                      item.isAvailable
                        ? 'bg-[#1E1038]/90 text-[#A78BFA] border border-[#7C3AED]/40'
                        : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {item.isAvailable ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-[#EA580C]" />
                        At Venue
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-rose-400" />
                        Sold Out
                      </>
                    )}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-code uppercase tracking-wider text-[#A78BFA] font-bold">
                      {item.category}
                    </div>
                    <h3 className="text-base font-extrabold text-white group-hover:text-[#DDD6FE] transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#3B2363]/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#A78BFA] block uppercase font-code font-bold">
                        Venue Price
                      </span>
                      <span className="text-base font-black text-white font-code">
                        ₦{item.price.toLocaleString('en-NG')}
                      </span>
                    </div>

                    <span className="text-[10px] text-[#DDD6FE] font-medium px-2.5 py-1 rounded-lg bg-[#1E1038] border border-[#7C3AED]/40 group-hover:border-[#7C3AED]">
                      View Info
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL: VIEW ITEM DETAILS & VENDOR BOOTH LOCATION (STRICTLY VIEW ONLY) */}
        {selectedItemDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-[#140A26] border border-[#7C3AED]/60 rounded-3xl p-6 text-white space-y-4 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#3B2363] pb-3">
                <span className="text-xs font-code font-bold text-[#EA580C] uppercase">
                  {selectedItemDetail.category} • Party Offering
                </span>
                <button
                  onClick={() => setSelectedItemDetail(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedItemDetail.imageUrl && (
                <div className="h-44 rounded-2xl overflow-hidden border border-[#3B2363]">
                  <img
                    src={selectedItemDetail.imageUrl}
                    alt={selectedItemDetail.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-extrabold text-white">{selectedItemDetail.name}</h3>
                  <span className="text-lg font-black text-[#EA580C] font-code">
                    ₦{selectedItemDetail.price.toLocaleString('en-NG')}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {selectedItemDetail.description}
                </p>
              </div>

              {selectedItemDetail.ingredients && (
                <div className="p-3 rounded-xl bg-[#0B0614] border border-[#3B2363] text-xs space-y-1">
                  <span className="font-bold text-[#A78BFA] block">Key Ingredients & Flavors:</span>
                  <p className="text-zinc-300">{selectedItemDetail.ingredients}</p>
                </div>
              )}

              {selectedItemDetail.boothLocation && (
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <MapPin className="w-4 h-4 text-[#EA580C]" />
                  <span>
                    Service Location: <strong>{selectedItemDetail.boothLocation}</strong>
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-[#3B2363]">
                <div className="p-3 rounded-xl bg-[#1E1038] border border-[#7C3AED]/50 text-xs text-[#DDD6FE] flex items-center gap-2 font-medium">
                  <Info className="w-4 h-4 text-[#EA580C] shrink-0" />
                  <span>Available on-site at the party. Pay directly at the vendor stall or bar.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
