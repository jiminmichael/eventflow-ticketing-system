import React, { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  ShieldCheck,
  Loader2,
  Minus,
  Plus,
  Upload,
  CheckCircle2,
  AlertCircle,
  Instagram,
  Sparkles,
} from "lucide-react";
import { TicketTier, ReferralSurvey, ReferralSource } from "../types.js";

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
    referralSurvey: ReferralSurvey;
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

// 14 Required sources in exact order requested
export const REFERRAL_SOURCES: ReferralSource[] = [
  "Instagram",
  "TikTok",
  "Snapchat",
  "WhatsApp",
  "Facebook",
  "YouTube",
  "Friends & Family",
  "Influencers",
  "Event Promoters",
  "Ticket Vendors",
  "Posters",
  "Partner Brands",
  "Google Search",
  "Other",
];

// Sources that trigger an optional referral-name field
const SOURCES_WITH_OPTIONAL_NAME = [
  "Friends & Family",
  "Influencers",
  "Event Promoters",
  "Ticket Vendors",
  "Partner Brands",
];

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

  // PVC upload state
  const [pvcFile, setPvcFile] = useState<File | null>(null);
  const [pvcPreview, setPvcPreview] = useState<string | null>(null);
  const [pvcUploading, setPvcUploading] = useState(false);
  const [pvcUploadError, setPvcUploadError] = useState<string | null>(null);
  const [pvcUploadRef, setPvcUploadRef] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Referral survey state (preserved in localStorage so retries & payment failures keep responses)
  const [selectedSource, setSelectedSource] = useState<string>(() => {
    try {
      return localStorage.getItem("hideout_referral_source") || "";
    } catch {
      return "";
    }
  });
  const [referralName, setReferralName] = useState<string>(() => {
    try {
      return localStorage.getItem("hideout_referral_name") || "";
    } catch {
      return "";
    }
  });
  const [otherDetails, setOtherDetails] = useState<string>(() => {
    try {
      return localStorage.getItem("hideout_referral_other") || "";
    } catch {
      return "";
    }
  });
  const [previouslyAttended, setPreviouslyAttended] = useState<"yes" | "no" | "not_sure" | "">(() => {
    try {
      return (localStorage.getItem("hideout_referral_prior") as any) || "";
    } catch {
      return "";
    }
  });
  const [surveyError, setSurveyError] = useState<string | null>(null);

  // Persist survey responses across page reloads & failed payment attempts
  useEffect(() => {
    try {
      if (selectedSource) localStorage.setItem("hideout_referral_source", selectedSource);
      else localStorage.removeItem("hideout_referral_source");
    } catch {}
  }, [selectedSource]);

  useEffect(() => {
    try {
      if (referralName) localStorage.setItem("hideout_referral_name", referralName);
      else localStorage.removeItem("hideout_referral_name");
    } catch {}
  }, [referralName]);

  useEffect(() => {
    try {
      if (otherDetails) localStorage.setItem("hideout_referral_other", otherDetails);
      else localStorage.removeItem("hideout_referral_other");
    } catch {}
  }, [otherDetails]);

  useEffect(() => {
    try {
      if (previouslyAttended) localStorage.setItem("hideout_referral_prior", previouslyAttended);
      else localStorage.removeItem("hideout_referral_prior");
    } catch {}
  }, [previouslyAttended]);

  const isPvc = selectedTier?.code === "PVC";
  const count = quantity * (selectedTier?.guestsPerTicket || 1);
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

  const handlePvcFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setPvcUploadError("Please upload a JPEG, PNG or WebP image of your PVC.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setPvcUploadError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setPvcUploadError(null);
    setPvcUploadRef(null);
    setPvcFile(file);

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

    // 1. Block PVC payment if image not uploaded
    if (isPvc && !pvcUploadRef) {
      setPvcUploadError(
        "You must upload your Permanent Voters Card image before proceeding to payment.",
      );
      return;
    }

    // 2. Validate Referral Questionnaire
    if (!selectedSource) {
      setSurveyError("Please select how you heard about The Hideout before proceeding.");
      const el = document.getElementById("questionnaire-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (selectedSource === "Other" && !otherDetails.trim()) {
      setSurveyError("Please specify how you heard about us in the field provided.");
      const el = document.getElementById("referral-other-details");
      if (el) el.focus();
      return;
    }

    setSurveyError(null);

    const clean = (g: Guest) =>
      Object.fromEntries(
        Object.entries(g).map(([k, v]) => [k, v.trim()]),
      ) as unknown as Guest;

    const surveyData: ReferralSurvey = {
      source: selectedSource,
      referralName: SOURCES_WITH_OPTIONAL_NAME.includes(selectedSource) && referralName.trim()
        ? referralName.trim()
        : undefined,
      otherDetails: selectedSource === "Other" ? otherDetails.trim() : undefined,
      previouslyAttended: previouslyAttended || undefined,
    };

    await onInitializePayment({
      ticketTierId: selectedTier.id,
      quantity,
      purchaser: {
        ...clean(purchaser),
        instagram: instagram.trim() || undefined,
      },
      attendees: Array.from({ length: count }, () => clean(purchaser)),
      referralSurvey: surveyData,
    });
  };

  const pvcGateBlocked = isPvc && !pvcUploadRef;
  const showOptionalNameField = SOURCES_WITH_OPTIONAL_NAME.includes(selectedSource);
  const showOtherField = selectedSource === "Other";

  return (
    <section id="register" className="section-shell registration-section">
      <div className="section-heading">
        <p className="eyebrow">YOUR PLACE AT THE HIDEOUT</p>
        <h2>
          Make it <em>a date.</em>
        </h2>
        <p>Enter your booking contact, answer a quick question, then pay securely with Paystack. Each included guest receives an individual entry pass.</p>
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
            {count} guest{count === 1 ? "" : "s"} · Each included guest receives an individual QR pass using the booking contact details.
          </p>
        </fieldset>

        {/* ── PVC IMAGE UPLOAD GATE ─────────────────────────────────── */}
        {isPvc && (
          <fieldset disabled={isLoading}>
            <legend>2. PVC Verification</legend>

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
                    if (val.startsWith("@")) val = val.slice(1);
                    setInstagram(val);
                  }}
                  style={{ paddingLeft: "36px" }}
                />
              </div>
            </label>
          </div>
        </fieldset>

        {/* ── HOW DID YOU HEAR ABOUT US? (QUESTIONNAIRE) ───────────── */}
        <fieldset id="questionnaire-section" disabled={isLoading} className="referral-fieldset">
          <legend className="flex items-center gap-2">
            <span>{isPvc ? "4. How did you hear about us?" : "3. How did you hear about us?"}</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#FF6B35]/20 text-[#FF8C42] border border-[#FF6B35]/40">
              Required
            </span>
          </legend>

          <p className="form-note" style={{ marginBottom: "16px" }}>
            Help us learn where you found The Hideout. Select one option below:
          </p>

          {/* 14 Single-Choice Options Styled in Sunset Orange & Black */}
          <div className="referral-grid" role="radiogroup" aria-label="Referral Source">
            {REFERRAL_SOURCES.map((source) => {
              const isSelected = selectedSource === source;
              return (
                <label
                  key={source}
                  className={`referral-card ${isSelected ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="referralSource"
                    value={source}
                    checked={isSelected}
                    onChange={() => {
                      setSelectedSource(source);
                      setSurveyError(null);
                    }}
                    required
                    className="sr-only"
                  />
                  <span className="radio-circle" aria-hidden="true">
                    {isSelected && <span className="radio-dot" />}
                  </span>
                  <span className="source-label">{source}</span>
                </label>
              );
            })}
          </div>

          {/* Conditional field for Friends & Family, Influencer, Event Promoter, Ticket Vendor, Partner Brand */}
          {showOptionalNameField && (
            <div className="referral-conditional-box animate-in fade-in duration-200">
              <label htmlFor="referral-name-input">
                <span>Who referred you? </span>
                <span style={{ opacity: 0.6, fontWeight: 400 }}>(Optional — Name or Handle)</span>
                <input
                  id="referral-name-input"
                  type="text"
                  placeholder={`e.g. ${
                    selectedSource === "Influencers"
                      ? "@influencer_handle"
                      : selectedSource === "Friends & Family"
                      ? "Friend's name"
                      : selectedSource === "Event Promoters"
                      ? "Promoter name or team"
                      : "Vendor or Brand name"
                  }`}
                  value={referralName}
                  onChange={(e) => setReferralName(e.target.value)}
                  maxLength={100}
                />
              </label>
            </div>
          )}

          {/* Conditional REQUIRED text field for "Other" */}
          {showOtherField && (
            <div className="referral-conditional-box animate-in fade-in duration-200">
              <label htmlFor="referral-other-details">
                <span>Please tell us how you heard about us: </span>
                <span className="text-[#FF8C42] font-bold">*</span>
                <input
                  id="referral-other-details"
                  type="text"
                  required
                  placeholder="e.g. Billboard, radio, friend at the club, etc."
                  value={otherDetails}
                  onChange={(e) => {
                    setOtherDetails(e.target.value);
                    if (e.target.value.trim()) setSurveyError(null);
                  }}
                  maxLength={150}
                />
              </label>
            </div>
          )}

          {/* Optional Question: Have you previously attended a VybeCheck event? */}
          <div className="prior-attendance-box">
            <p className="prior-title">
              Have you previously attended a VybeCheck event?{" "}
              <span style={{ opacity: 0.6, fontWeight: 400 }}>(Optional)</span>
            </p>
            <div className="prior-options">
              {[
                { id: "yes", label: "Yes, I'm a returning guest" },
                { id: "no", label: "No, this is my first time" },
                { id: "not_sure", label: "Not sure" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`prior-choice ${previouslyAttended === opt.id ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="previouslyAttended"
                    value={opt.id}
                    checked={previouslyAttended === opt.id}
                    onChange={() => setPreviouslyAttended(opt.id as any)}
                    className="sr-only"
                  />
                  <span className="radio-circle-small" aria-hidden="true">
                    {previouslyAttended === opt.id && <span className="radio-dot-small" />}
                  </span>
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {surveyError && (
            <p className="form-error" role="alert" style={{ marginTop: "12px" }}>
              {surveyError}
            </p>
          )}
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
