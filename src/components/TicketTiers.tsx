import React from "react";
import { ArrowUpRight, Check, Ticket, Phone } from "lucide-react";
import { TicketTier } from "../types.js";

const tierBenefits: Record<string, string[]> = {
  CABANA: [
    "Admits 6 max",
    "1 bottle of Martel/Casamigo",
    "Unlimited cocktail",
    "2 pots of shisha",
  ],
  VVIP: [
    "Admits 4 guests",
    "1 bottle of whisky",
    "Complimentary cocktails",
    "1 pot of shisha",
  ],
  VIP: ["1 shisha", "Complimentary cocktails"],
};

const tierImages: Record<string, string> = {
  PVC: "/images/pvc.png",
  ACCESS: "/images/access.png",
  COUPLE: "/images/couple.png",
  VIP: "/images/vip.png",
  VVIP: "/images/sunset.png",
  CABANA: "/images/cabana.png",
};

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
        Choose your <em>kind of hideout.</em>
      </h2>
      <p>
        From a day by the pool to your own cabana. Find your place at The
        Hideout.
      </p>
    </div>
    <div className="pass-grid">
      {tiers
        .filter((t) => t.isActive || t.bookingOnly)
        .map((tier, i) => {
          const tierCode = tier.code.trim().toUpperCase();
          const isSunsetDeck =
            tier.id === "hideout-vvip" ||
            tier.name.trim().toLowerCase() === "sunset deck";
          const benefits = isSunsetDeck
            ? tierBenefits.VVIP
            : tierBenefits[tierCode];
          const image = isSunsetDeck
            ? tierImages.VVIP
            : tierImages[tierCode] ?? "/images/background-image.png";
          const isPackage =
            isSunsetDeck ||
            ["COUPLE", "VIP", "VVIP", "CABANA"].includes(tierCode);
          return (
            <article
              className={`pass-card glass-panel ${tierCode === "ACCESS" ? "featured-pass" : ""} has-pass-banner`}
              key={tier.id}
            >
              <div className="pass-banner-container">
                <img
                  className="pass-banner"
                  src={image}
                  alt={`${tier.name} ticket banner`}
                />
              </div>
              <div className="pass-top">
                <Ticket size={22} strokeWidth={1.3} />
                <span className="eyebrow">
                  {String(i + 1).padStart(2, "0")} / THE HIDEOUT
                </span>
              </div>
              <h3>{tier.code === "CABANA" ? "Cabana Table" : tier.name}</h3>
              <p className="pass-price">
                ₦{tier.price.toLocaleString("en-NG")}
              </p>
              <p className="pass-unit">
                {isPackage ? "per package" : "per person"}
              </p>
              <p className="pass-description">{tier.description}</p>
              {benefits && (
                <ul
                  className="pass-inclusions"
                  aria-label={`${tier.name} benefits`}
                >
                  {benefits.map((benefit) => (
                    <li key={benefit}>
                      <Check size={15} aria-hidden="true" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              )}
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
                  disabled={
                    !tier.inventoryUnlimited &&
                    tier.soldQuantity >= tier.availableQuantity
                  }
                  onClick={() => onSelectTier(tier)}
                >
                  {!tier.inventoryUnlimited &&
                  tier.soldQuantity >= tier.availableQuantity
                    ? "Sold out"
                    : selectedTierId === tier.id
                      ? "Continue to checkout"
                      : "Select pass"}
                  <ArrowUpRight size={17} />
                </button>
              )}
            </article>
          );
        })}
    </div>
    <p className="booking-note">
      <Phone size={17} aria-hidden="true" />
      Bookings & sponsorship: <a href="tel:+2349030064744">+234 903 006 4744</a>
      <span>or</span>
      <a href="tel:+2348131173415">+234 813 117 3415</a>
    </p>
  </section>
);
