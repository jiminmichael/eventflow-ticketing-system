import React, { useState, useEffect } from "react";
import { CreditCard, ShieldCheck, Loader2, Minus, Plus } from "lucide-react";
import { TicketTier } from "../types.js";
interface Guest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
interface Props {
  tiers: TicketTier[];
  selectedTier: TicketTier | null;
  onSelectTier: (tier: TicketTier) => void;
  onInitializePayment: (data: {
    ticketTierId: string;
    quantity: number;
    purchaser: Guest;
    attendees: Guest[];
  }) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
}
const blank = (): Guest => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
});
export const RegistrationForm: React.FC<Props> = ({
  tiers,
  selectedTier,
  onSelectTier,
  onInitializePayment,
  isLoading,
  errorMessage,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [purchaser, setPurchaser] = useState<Guest>(blank);
  const [guests, setGuests] = useState<Guest[]>([blank()]);
  const [same, setSame] = useState(true);
  const count = quantity * (selectedTier?.guestsPerTicket || 1);
  const followUp =
    selectedTier?.code === "VVIP" || selectedTier?.code === "CABANA";
  const limit = selectedTier
    ? Math.min(
        selectedTier.maxPerRegistration,
        selectedTier.inventoryUnlimited
          ? selectedTier.maxPerRegistration
          : Math.max(
              0,
              selectedTier.availableQuantity - selectedTier.soldQuantity,
            ),
      )
    : 0;
  useEffect(() => {
    setQuantity(1);
  }, [selectedTier?.id]);
  useEffect(() => {
    setGuests((prev) =>
      Array.from({ length: count }, (_, i) => prev[i] || blank()),
    );
  }, [count]);
  const fields = (
    value: Guest,
    update: (field: keyof Guest, value: string) => void,
    prefix: string,
  ) =>
    Object.entries({
      firstName: "First name",
      lastName: "Last name",
      email: "Email address",
      phone: "Phone number",
    }).map(([key, label]) => (
      <label key={key} htmlFor={`${prefix}-${key}`}>
        {label}
        <input
          id={`${prefix}-${key}`}
          name={`${prefix}-${key}`}
          type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
          autoComplete={
            prefix === "purchaser"
              ? {
                  firstName: "given-name",
                  lastName: "family-name",
                  email: "email",
                  phone: "tel",
                }[key]
              : "off"
          }
          required
          minLength={key === "phone" ? 8 : 1}
          value={value[key as keyof Guest]}
          onChange={(e) => update(key as keyof Guest, e.target.value)}
        />
      </label>
    ));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier || !limit) return;
    const clean = (g: Guest) =>
      Object.fromEntries(
        Object.entries(g).map(([k, v]) => [k, v.trim()]),
      ) as unknown as Guest;
    await onInitializePayment({
      ticketTierId: selectedTier.id,
      quantity,
      purchaser: clean(purchaser),
      attendees: guests.map((g, i) => clean(i === 0 && same ? purchaser : g)),
    });
  };
  return (
    <section id="register" className="section-shell registration-section">
      <div className="section-heading">
        <p className="eyebrow">YOUR PLACE AT THE HIDEOUT</p>
        <h2>
          Make it <em>a date.</em>
        </h2>
        <p>Register your guests, then pay securely with Paystack.</p>
      </div>
      <form onSubmit={submit} className="registration-form">
        <fieldset disabled={isLoading}>
          <legend>1. Your tickets</legend>
          <div className="form-grid">
            <label htmlFor="registration-tier">
              Ticket or package
              <select
                id="registration-tier"
                value={selectedTier?.id || ""}
                onChange={(e) => {
                  const tier = tiers.find((t) => t.id === e.target.value);
                  if (tier) onSelectTier(tier);
                }}
                required
              >
                <option value="" disabled>
                  Choose your ticket
                </option>
                {tiers
                  .filter((t) => t.isActive)
                  .map((t) => (
                    <option
                      key={t.id}
                      value={t.id}
                      disabled={
                        !t.inventoryUnlimited &&
                        t.soldQuantity >= t.availableQuantity
                      }
                    >
                      {t.name} — ₦{t.price.toLocaleString("en-NG")}
                    </option>
                  ))}
              </select>
            </label>
            <div>
              <label htmlFor="booking-quantity">
                {selectedTier?.code === "ACCESS" || selectedTier?.code === "PVC"
                  ? "Number of tickets"
                  : "Number of packages"}
              </label>
              <div className="quantity-control">
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => q - 1)}
                >
                  <Minus size={16} />
                </button>
                <output id="booking-quantity" aria-live="polite">
                  {quantity}
                </output>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Increase quantity"
                  disabled={quantity >= limit}
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
          <p className="form-note">
            {followUp
              ? "Your team will contact you after payment to confirm package and guest arrangements."
              : `${count} guest${count === 1 ? "" : "s"} · Each guest receives an individual UUID and QR pass after payment.`}
          </p>
          {selectedTier?.code === "PVC" && (
            <p className="form-note">
              Bring your PVC. Contact the organizers if you need to confirm
              eligibility.
            </p>
          )}
        </fieldset>
        <fieldset disabled={isLoading}>
          <legend>2. Booking contact</legend>
          <div className="form-grid">
            {fields(
              purchaser,
              (key, value) => setPurchaser((p) => ({ ...p, [key]: value })),
              "purchaser",
            )}
          </div>
        </fieldset>
        <fieldset disabled={isLoading}>
          <legend>3. {followUp ? "Package contacts" : "Guest details"}</legend>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={same}
              onChange={(e) => setSame(e.target.checked)}
            />
            {followUp
              ? "Use my details for the first package"
              : "I am the first guest"}
          </label>
          {guests.map((g, i) => (
            <div className="guest-fields" key={i}>
              <h3>
                {followUp ? "Package contact" : "Guest"} {i + 1}
              </h3>
              {i === 0 && same ? (
                <p className="form-note">
                  Using the booking contact’s details above.
                </p>
              ) : (
                <div className="form-grid">
                  {fields(
                    g,
                    (key, value) =>
                      setGuests((prev) =>
                        prev.map((v, n) =>
                          n === i ? { ...v, [key]: value } : v,
                        ),
                      ),
                    `guest-${i}`,
                  )}
                </div>
              )}
            </div>
          ))}
        </fieldset>
        <div className="registration-total glass-panel">
          <div>
            <p className="eyebrow">TOTAL IN NGN</p>
            <strong>
              ₦{((selectedTier?.price || 0) * quantity).toLocaleString("en-NG")}
            </strong>
            <p className="form-note">
              Ticket booking only. Food and drinks are purchased at the venue.
            </p>
          </div>
          <button
            className="btn-primary"
            type="submit"
            disabled={isLoading || !limit}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <CreditCard size={18} />
            )}{" "}
            {isLoading ? "Preparing checkout…" : "Continue to payment"}
          </button>
        </div>
        {errorMessage && (
          <p className="form-error" role="alert">
            {errorMessage}
          </p>
        )}
        <p className="booking-note">
          <ShieldCheck size={17} /> Payment is verified before your booking is
          confirmed.
        </p>
      </form>
    </section>
  );
};
