import React, { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
interface NavbarProps {
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  onNavigateSection: (id: string) => void;
  onOpenLookup?: () => void;
  onOpenExportGuestlist: () => void;
}
export const Navbar: React.FC<NavbarProps> = ({
  onOpenAdmin,
  isAdminLoggedIn,
  onNavigateSection,
  onOpenLookup,
  onOpenExportGuestlist,
}) => {
  const [open, setOpen] = useState(false);
  const navigate = (id: string) => {
    setOpen(false);
    onNavigateSection(id);
  };
  return (
    <header className="hideout-nav">
      <a href="#hero" className="brand brand-logo" aria-label="Vybecheck with Bama — home">
        <img src="/images/vybecheck-logo.png" alt="Vybecheck with Bama" width="1563" height="1563" decoding="async" />
      </a>
      <nav
        className={open ? "site-nav is-open" : "site-nav"}
        id="site-navigation"
        aria-label="Main navigation"
      >
        <button onClick={() => navigate("hero")}>The Hideout</button>
        <button onClick={() => navigate("schedule")}>The experience</button>
        <button onClick={() => navigate("tickets")}>Passes & tables</button>
        <button onClick={() => navigate("menu")}>Food & drinks</button>
        <button onClick={() => navigate("faqs")}>Good to know</button>
        <button onClick={onOpenLookup}>Find my pass</button>
        {isAdminLoggedIn && (
          <>
            <button onClick={onOpenAdmin}>Organizer</button>
            <button onClick={onOpenExportGuestlist}>Export guests</button>
          </>
        )}
      </nav>
      <button
        className="btn-primary nav-cta"
        onClick={() => navigate("tickets")}
      >
        Book your spot <ArrowUpRight size={16} />
      </button>
      <button
        className="mobile-toggle"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="site-navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
};
