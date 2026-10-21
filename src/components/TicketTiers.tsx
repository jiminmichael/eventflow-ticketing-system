import React from "react";
import { ArrowUpRight, Ticket, Phone } from "lucide-react";
import { TicketTier } from "../types.js";
interface Props {
  tiers: TicketTier[];
  selectedTierId: string;
  onSelectTier: (tier: TicketTier) => void;
}
export const TicketTiers: React.FC<Props> = ({
  tiers,
  selectedTierId,
  onSelectTier,
}) => (
  <section id="tickets" className="section-shell ticket-section">
    <div className="section-heading">
      <p className="eyebrow">AN INVITATION TO UNWIND</p>
      <h2>
        Choose your <em>kind of escape.</em>
      </h2>
      <p>
        From a day by the pool to your own cabana. Find your place at The
        Hideout.
      </p>
    </div>
    <div className="pass-grid">
      {tiers
        .filter((t) => t.isActive || t.bookingOnly)
        .map((tier, i) => (
          <article
            className={`pass-card glass-panel ${tier.code === "ACCESS" ? "featured-pass" : ""}`}
            key={tier.id}
          >
            <div className="pass-top">
              <Ticket size={22} strokeWidth={1.3} />
              <span className="eyebrow">
                {String(i + 1).padStart(2, "0")} / THE HIDEOUT
              </span>
            </div>
            <h3>{tier.name}</h3>
            <p className="pass-price">₦{tier.price.toLocaleString("en-NG")}</p>
            <p className="pass-unit">
              {["COUPLE", "VIP", "VVIP", "CABANA"].includes(tier.code)
                ? "per package"
                : "per person"}
            </p>
            <p className="pass-description">{tier.description}</p>
            {tier.bookingOnly && !tier.isActive ? (
              <a
                href="tel:+2349030064744"
                className={
                  tier.code === "ACCESS" ? "btn-primary" : "btn-secondary"
                }
              >
                Enquire & book <ArrowUpRight size={17} />
              </a>
            ) : (
              <button
                className="btn-primary"
                disabled={(!tier.inventoryUnlimited && tier.soldQuantity >= tier.availableQuantity)}
                onClick={() => onSelectTier(tier)}
              >
                {(!tier.inventoryUnlimited && tier.soldQuantity >= tier.availableQuantity)
                  ? "Sold out"
                  : selectedTierId === tier.id
                    ? "Continue to checkout"
                    : "Select pass"}
                <ArrowUpRight size={17} />
              </button>
            )}
          </article>
        ))}
    </div>
    <p className="booking-note">
      <Phone size={17} aria-hidden="true" />
      Bookings & sponsorship: <a href="tel:+2349030064744">+234 903 006 4744</a>
      <span>or</span>
      <a href="tel:+2348131173415">+234 813 117 3415</a>
    </p>
  </section>
);
