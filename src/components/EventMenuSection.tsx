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
    <section id="menu" className="py-20 bg-[var(--brand-obsidian)] text-[var(--ui-text)] border-b border-[var(--ui-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--ui-raised)] text-[var(--ui-success)] text-xs font-bold mb-3 border border-[var(--brand-emerald)]">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[var(--ui-success)]" />
            <span>AVAILABLE AT THE PARTY • VIEW ONLY</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--ui-text)]">
            Party Food, Grills & Drinks Menu
          </h2>

          <p className="mt-3 text-[var(--ui-muted)] text-sm sm:text-base leading-relaxed">
            Check out what will be cooking and pouring at the party! Smoky firewood asun, juicy suya skewers, craft cocktails, champagne, and ice-cold beers.
          </p>
        </div>

        {/* View-Only Informational Alert Banner */}
        <div className="max-w-4xl mx-auto mb-10 p-5 rounded-3xl bg-[var(--ui-raised)]/90 border border-[var(--brand-emerald)] text-[var(--ui-success)] text-xs sm:text-sm flex items-start gap-3.5 shadow-sm">
          <Info className="w-5 h-5 text-[var(--ui-success)] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-extrabold text-[var(--ui-text)] flex flex-wrap items-center gap-2 text-sm">
              <span>View-Only Menu • Ordered & Paid At Venue Stalls</span>
              <span className="px-2 py-0.5 rounded bg-[var(--ui-raised)] text-[var(--ui-success)] text-[10px] font-code uppercase font-bold border border-[var(--brand-emerald)]">
                On-Site Food & Drinks
              </span>
            </div>
            <p className="text-[var(--ui-muted)] text-xs leading-relaxed">
              All menu offerings below are for viewing only so guests know what food and drinks are available.
              <strong className="text-[var(--ui-text)]"> Items cannot be purchased online or added to your entry ticket order.</strong> All food, grills, and drinks are purchased directly at the stalls during the fiesta.
            </p>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          {/* Search Box */}
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-[var(--ui-success)] absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search suya, asun, jollof, cocktails, chapman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--brand-surface)] border border-[var(--ui-border)] rounded-2xl text-xs sm:text-sm text-[var(--ui-text)] focus:outline-none focus:border-[var(--brand-emerald)] placeholder:text-[var(--ui-muted)] transition-colors shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-[var(--ui-muted)] hover:text-[var(--ui-text)] text-xs cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* MOBILE DROPDOWN: Category Filter on Smaller Screens */}
          <div className="block sm:hidden">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="mobile-menu-category" className="text-xs font-bold text-[var(--ui-success)] uppercase tracking-wider">
                Filter Category:
              </label>
              {/* Mobile View Toggle: Grid vs Compact */}
              <div className="flex items-center bg-[var(--brand-surface)] border border-[var(--ui-border)] rounded-lg p-0.5 text-xs shadow-sm">
                <button
                  type="button"
                  onClick={() => setMobileViewMode('compact')}
                  className={`px-2 py-1 rounded flex items-center gap-1 cursor-pointer ${
                    mobileViewMode === 'compact' ? 'bg-[var(--brand-emerald)] text-[var(--ui-text)] font-bold' : 'text-[var(--ui-muted)]'
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
                    mobileViewMode === 'grid' ? 'bg-[var(--brand-emerald)] text-[var(--ui-text)] font-bold' : 'text-[var(--ui-muted)]'
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
                className="w-full appearance-none py-3 px-4 rounded-xl bg-[var(--brand-surface)] border border-[var(--brand-emerald)] text-sm font-bold text-[var(--ui-text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-emerald)] shadow-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'ALL' ? 'All Party Offerings (Food, Drinks, Merch)' : cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[var(--ui-success)] absolute right-4 top-3.5 pointer-events-none" />
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
                    ? 'bg-gradient-to-r from-[var(--brand-violet)] via-[var(--brand-violet)] to-[var(--brand-blue)] text-[var(--ui-text)] shadow-sm font-bold'
                    : 'bg-[var(--brand-surface)] text-[var(--ui-text)] hover:text-[var(--ui-success)] border border-[var(--ui-border)] hover:border-[var(--brand-emerald)]'
                }`}
              >
                {cat === 'ALL' ? 'All Party Offerings' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Rendering */}
        {filteredItems.length === 0 ? (
          <div className="text-center p-12 bg-[var(--brand-surface)] rounded-3xl border border-[var(--ui-border)] text-[var(--ui-muted)] max-w-md mx-auto space-y-2 shadow-sm">
            <UtensilsCrossed className="w-8 h-8 text-[var(--ui-success)] mx-auto" />
            <p className="font-semibold text-[var(--ui-text)]">No party items match your search</p>
            <p className="text-xs text-[var(--ui-muted)]">Try selecting another category or clear your search query.</p>
          </div>
        ) : (
          <>
            {/* MOBILE COMPACT LIST VIEW (Shown on mobile when compact mode is active) */}
            <div className={`sm:hidden space-y-3 ${mobileViewMode === 'compact' ? 'block' : 'hidden'}`}>
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemDetail(item)}
                  className="p-3.5 rounded-2xl bg-[var(--brand-surface)] border border-[var(--ui-border)] hover:border-[var(--brand-emerald)] flex items-center gap-3.5 cursor-pointer shadow-sm active:scale-[0.99] transition-all"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[var(--ui-border)]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-sm font-bold text-[var(--ui-text)] truncate">{item.name}</h4>
                      <span className="text-xs font-extrabold text-[var(--ui-success)] font-code shrink-0">
                        ₦{item.price.toLocaleString('en-NG')}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--ui-muted)] line-clamp-1 mt-0.5">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] uppercase font-bold text-[var(--ui-muted)] px-1.5 py-0.5 rounded bg-[var(--brand-obsidian)] border border-[var(--ui-border)]">
                        {item.category}
                      </span>
                      {item.dietaryOrTag && (
                        <span className="text-[9px] font-bold text-[var(--ui-success)] px-1.5 py-0.5 rounded bg-[var(--ui-raised)] border border-[var(--brand-emerald)]">
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
                  className="flex flex-col rounded-3xl bg-[var(--brand-surface)] border border-[var(--ui-border)] overflow-hidden hover:border-[var(--brand-emerald)] transition-all duration-200 shadow-sm group cursor-pointer"
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedItemDetail(item)}
                >
                  {/* Item Thumbnail */}
                  <div className="relative h-48 bg-[var(--brand-obsidian)] overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--ui-raised)] text-[var(--ui-success)]">
                        <UtensilsCrossed className="w-12 h-12" />
                      </div>
                    )}

                    {/* Dietary / Feature Tag */}
                    {item.dietaryOrTag && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white/95 backdrop-blur-md text-[var(--ui-success)] border border-[var(--brand-emerald)] shadow-sm">
                        {item.dietaryOrTag}
                      </span>
                    )}

                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[9px] font-code uppercase font-bold bg-white/95 text-[var(--ui-text)] border border-[var(--ui-border)] shadow-sm">
                      {item.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-[var(--ui-text)] text-base group-hover:text-[var(--ui-success)] transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[var(--ui-muted)] mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[var(--ui-border)] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-code text-[var(--ui-muted)] font-semibold">
                          Price at Venue
                        </div>
                        <div className="text-lg font-black font-code text-[var(--ui-success)]">
                          ₦{item.price.toLocaleString('en-NG')}
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold text-[var(--ui-muted)] group-hover:text-[var(--ui-success)] transition-colors flex items-center gap-1">
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
              className="relative max-w-md w-full rounded-3xl bg-[var(--brand-surface)] border border-[var(--ui-border)] overflow-hidden shadow-2xl p-6 text-[var(--ui-text)] space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-[var(--brand-obsidian)] hover:bg-[var(--ui-raised)] text-[var(--ui-text)] hover:text-[var(--ui-text)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <img
                src={selectedItemDetail.imageUrl}
                alt={selectedItemDetail.name}
                className="w-full h-52 object-cover rounded-2xl border border-[var(--ui-border)]"
              />

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-code uppercase font-bold px-2 py-0.5 rounded bg-[var(--ui-raised)] text-[var(--ui-success)] border border-[var(--brand-emerald)]">
                    {selectedItemDetail.category}
                  </span>
                  {selectedItemDetail.dietaryOrTag && (
                    <span className="text-[10px] font-bold text-[var(--brand-blue)]">
                      • {selectedItemDetail.dietaryOrTag}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-[var(--ui-text)]">{selectedItemDetail.name}</h3>
                <p className="text-xs text-[var(--ui-muted)] mt-2 leading-relaxed">
                  {selectedItemDetail.description}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--brand-obsidian)] border border-[var(--ui-border)] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[var(--ui-muted)] uppercase font-code">Venue Counter Price</div>
                  <div className="text-xl font-black text-[var(--ui-success)] font-code">
                    ₦{selectedItemDetail.price.toLocaleString('en-NG')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[var(--brand-champagne)] font-bold uppercase font-code">Payment Method</div>
                  <div className="text-xs text-[var(--ui-text)] font-medium">POS / Cash at Stall</div>
                </div>
              </div>

              <div className="text-[11px] text-[var(--ui-muted)] bg-[var(--ui-raised)] border border-[var(--brand-emerald)] p-3 rounded-xl flex items-start gap-2">
                <Info className="w-4 h-4 text-[var(--ui-success)] shrink-0 mt-0.5" />
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
