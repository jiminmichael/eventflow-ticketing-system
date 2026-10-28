import React, { useState, useEffect, useRef } from "react";
import { CreditCard, ShieldCheck, Loader2, Minus, Plus, Upload, CheckCircle2, AlertCircle, Instagram } from "lucide-react";
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
    purchaser: Guest & { instagram?: string };
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

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

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
  const [instagram, setInstagram] = useState("");
  const [guests, setGuests] = useState<Guest[]>([blank()]);
  const [same, setSame] = useState(true);

  // PVC upload state
  const [pvcFile, setPvcFile] = useState<File | null>(null);
  const [pvcPreview, setPvcPreview] = useState<string | null>(null);
  const [pvcUploading, setPvcUploading] = useState(false);
  const [pvcUploadError, setPvcUploadError] = useState<string | null>(null);
  const [pvcUploadRef, setPvcUploadRef] = useState<string | null>(null); // server-side ref after upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPvc = selectedTier?.code === "PVC";
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

  // Reset PVC state when tier changes
  useEffect(() => {
    setQuantity(1);
    if (!isPvc) {
      setPvcFile(null);
      setPvcPreview(null);
      setPvcUploadError(null);
      setPvcUploadRef(null);
    }
  }, [selectedTier?.id]);

  useEffect(() => {
    setGuests((prev) =>
      Array.from({ length: count }, (_, i) => prev[i] || blank()),
    );
  }, [count]);

  const handlePvcFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setPvcUploadError("Please upload a JPEG, PNG or WebP image of your PVC.");
      return;
    }
    // Validate size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setPvcUploadError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setPvcUploadError(null);
    setPvcUploadRef(null);
    setPvcFile(file);

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setPvcPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePvcUpload = async () => {
    if (!pvcFile || !pvcPreview) return;
    setPvcUploading(true);
    setPvcUploadError(null);
    try {
      const res = await fetch("/api/pvc-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl: pvcPreview,
          fileName: pvcFile.name,
          fileType: pvcFile.type,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ref) {
        throw new Error(data.message || "Upload failed. Please try again.");
      }
      setPvcUploadRef(data.ref);
    } catch (err: any) {
      setPvcUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setPvcUploading(false);
    }
  };

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

    // Block PVC payment if image not uploaded
    if (isPvc && !pvcUploadRef) {
      setPvcUploadError(
        "You must upload your Permanent Voters Card image before proceeding to payment.",
      );
      return;
    }

    const clean = (g: Guest) =>
      Object.fromEntries(
        Object.entries(g).map(([k, v]) => [k, v.trim()]),
      ) as unknown as Guest;

    await onInitializePayment({
      ticketTierId: selectedTier.id,
      quantity,
      purchaser: {
        ...clean(purchaser),
        instagram: instagram.trim() || undefined,
      },
      attendees: guests.map((g, i) => clean(i === 0 && same ? purchaser : g)),
    });
  };

  const pvcGateBlocked = isPvc && !pvcUploadRef;

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
        </fieldset>

        {/* ── PVC IMAGE UPLOAD GATE ─────────────────────────────────── */}
        {isPvc && (
          <fieldset disabled={isLoading}>
            <legend>2. PVC Verification</legend>

            {/* Info banner */}
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "12px",
                padding: "14px 16px",
                marginBottom: "16px",
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="form-note" style={{ margin: 0, fontWeight: 600 }}>
                  PVC ticket requires ID verification
                </p>
                <p className="form-note" style={{ margin: "4px 0 0" }}>
                  Upload a clear photo of your Permanent Voters Card (front face). Your image will be
                  reviewed manually by the event team before entry is granted. This is a free
                  in-house review — no third-party service is used.
                </p>
              </div>
            </div>

            {/* File picker */}
            {!pvcUploadRef && (
              <>
                <label htmlFor="pvc-image" style={{ cursor: "pointer" }}>
                  PVC image (JPEG / PNG / WebP, max {MAX_FILE_SIZE_MB}MB)
                  <input
                    ref={fileInputRef}
                    id="pvc-image"
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    onChange={handlePvcFileChange}
                    style={{ display: "block", marginTop: "8px" }}
                  />
                </label>

                {/* Preview */}
                {pvcPreview && (
                  <div style={{ marginTop: "12px" }}>
                    <img
                      src={pvcPreview}
                      alt="PVC preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "220px",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.15)",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                )}

                {pvcUploadError && (
                  <p className="form-error" role="alert" style={{ marginTop: "8px" }}>
                    {pvcUploadError}
                  </p>
                )}

                {pvcPreview && !pvcUploadRef && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ marginTop: "14px" }}
                    disabled={pvcUploading}
                    onClick={handlePvcUpload}
                  >
                    {pvcUploading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Upload size={16} />
                    )}
                    {pvcUploading ? "Uploading…" : "Submit PVC Image"}
                  </button>
                )}
              </>
            )}

            {/* Success state */}
            {pvcUploadRef && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  color: "inherit",
                }}
              >
                <CheckCircle2 size={20} style={{ color: "#10b981", flexShrink: 0 }} />
                <div>
                  <p className="form-note" style={{ margin: 0, fontWeight: 600 }}>
                    PVC image submitted successfully
                  </p>
                  <p className="form-note" style={{ margin: "2px 0 0", opacity: 0.7 }}>
                    Ref: {pvcUploadRef} · The organizer team will review before entry.
                  </p>
                </div>
                <button
                  type="button"
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    opacity: 0.6,
                    fontSize: "12px",
                    color: "inherit",
                    textDecoration: "underline",
                  }}
                  onClick={() => {
                    setPvcUploadRef(null);
                    setPvcFile(null);
                    setPvcPreview(null);
                  }}
                >
                  Change
                </button>
              </div>
            )}
          </fieldset>
        )}

        {/* ── BOOKING CONTACT ───────────────────────────────────────── */}
        <fieldset disabled={isLoading}>
          <legend>{isPvc ? "3. Booking contact" : "2. Booking contact"}</legend>
          <div className="form-grid">
            {fields(
              purchaser,
              (key, value) => setPurchaser((p) => ({ ...p, [key]: value })),
              "purchaser",
            )}

            {/* Instagram field */}
            <label htmlFor="purchaser-instagram">
              Instagram handle{" "}
              <span style={{ opacity: 0.55, fontWeight: 400 }}>(optional)</span>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    opacity: 0.5,
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Instagram size={15} />
                </span>
                <input
                  id="purchaser-instagram"
                  name="purchaser-instagram"
                  type="text"
                  autoComplete="off"
                  placeholder="@yourhandle"
                  value={instagram}
                  onChange={(e) => {
                    let val = e.target.value;
                    // Strip leading @ for storage consistency
                    if (val.startsWith("@")) val = val.slice(1);
                    setInstagram(val);
                  }}
                  style={{ paddingLeft: "36px" }}
                />
              </div>
            </label>
          </div>
        </fieldset>

        {/* ── GUEST DETAILS ─────────────────────────────────────────── */}
        <fieldset disabled={isLoading}>
          <legend>{isPvc ? "4." : "3."} {followUp ? "Package contacts" : "Guest details"}</legend>
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
                  Using the booking contact's details above.
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
            disabled={isLoading || !limit || (isPvc && !pvcUploadRef)}
            title={pvcGateBlocked ? "Upload your PVC image first" : undefined}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <CreditCard size={18} />
            )}{" "}
            {isLoading
              ? "Preparing checkout…"
              : pvcGateBlocked
              ? "Upload PVC to continue"
              : "Continue to payment"}
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
