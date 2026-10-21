import React, { useEffect, useState } from "react";
import {
  Download,
  FileImage,
  FileText,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import type { Attendee } from "../types.js";
import {
  type TicketBundle,
  renderTicket,
  saveTicketPng,
  saveTicketsPdf,
} from "../utils/ticketFiles.js";
export function TicketDownloads({ reference }: { reference: string }) {
  const [bundle, setBundle] = useState<TicketBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [selected, setSelected] = useState("");
  const [preview, setPreview] = useState("");
  const [previewError, setPreviewError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(reference)}/tickets`,
        { cache: "no-store" },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Unable to load tickets.");
      setBundle(data);
      setSelected(data.attendees[0]?.uuid || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load tickets.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [reference]);
  const guest = bundle?.attendees.find((a) => a.uuid === selected);
  useEffect(() => {
    let cancelled = false;
    setPreview("");
    setPreviewError("");
    if (bundle && guest)
      renderTicket(bundle, guest)
        .then((canvas) => {
          if (!cancelled) setPreview(canvas.toDataURL("image/png"));
        })
        .catch(() => {
          if (!cancelled)
            setPreviewError(
              "Preview unavailable. Please try downloading your ticket.",
            );
        });
    return () => {
      cancelled = true;
    };
  }, [bundle, guest]);
  const download = async (format: "png" | "pdf" | "all") => {
    if (!bundle || !guest) return;
    setBusy(format);
    setError("");
    try {
      if (format === "png") await saveTicketPng(bundle, guest);
      else
        await saveTicketsPdf(
          bundle,
          format === "all" ? bundle.attendees : [guest],
        );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Download failed. Please retry.",
      );
    } finally {
      setBusy("");
    }
  };
  return (
    <main className="ticket-download-page">
      <a href="/" className="text-link">
        <ArrowLeft size={16} /> Back to the event
      </a>
      <header>
        <p className="eyebrow">THE HIDEOUT · POOL EDITION</p>
        <h1>
          Your tickets, <em>ready to go.</em>
        </h1>
        <p>
          Save your passes as images or PDFs. Keep this private link to download
          them again.
        </p>
      </header>
      {loading ? (
        <p role="status">
          <Loader2 size={20} className="animate-spin" /> Loading your verified
          booking…
        </p>
      ) : !bundle ? (
        <section className="glass-panel download-status">
          <h2>Tickets aren’t ready yet</h2>
          <p role="alert">{error}</p>
          <button className="btn-primary" onClick={load}>
            <RefreshCw size={18} /> Retry
          </button>
          <a
            className="btn-secondary"
            href={`/order-confirmation?reference=${encodeURIComponent(reference)}`}
          >
            Check payment status
          </a>
          <p>No need to pay again if your payment is still processing.</p>
        </section>
      ) : (
        <>
          <p className="payment-confirmed">
            <CheckCircle2 size={20} /> Payment verified ·{" "}
            {bundle.attendees.length} guest / booking record
            {bundle.attendees.length === 1 ? "" : "s"}
          </p>
          <div className="download-layout">
            <section className="glass-panel download-controls">
              <label htmlFor="download-guest">
                Choose a guest or booking contact
              </label>
              <select
                id="download-guest"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                {bundle.attendees.map((a) => (
                  <option key={a.uuid} value={a.uuid}>
                    {a.firstName} {a.lastName} — {a.ticketTierName}
                  </option>
                ))}
              </select>
              {guest && (
                <>
                  <h2>
                    {guest.firstName} {guest.lastName}
                  </h2>
                  <dl>
                    <dt>Ticket</dt>
                    <dd>{guest.ticketTierName}</dd>
                    <dt>UUID</dt>
                    <dd>{guest.uuid}</dd>
                    <dt>Email</dt>
                    <dd>{guest.email}</dd>
                    <dt>Phone</dt>
                    <dd>{guest.phone}</dd>
                    <dt>Order reference</dt>
                    <dd>{bundle.order.orderReference}</dd>
                  </dl>
                  {["VVIP", "CABANA"].some((code) =>
                    guest.ticketTierName.toUpperCase().includes(code),
                  ) && (
                    <p className="checkout-notice">
                      This confirms your paid package booking. Our team will
                      contact you about guest arrangements.
                    </p>
                  )}
                  <button
                    className="btn-primary"
                    disabled={Boolean(busy)}
                    onClick={() => download("png")}
                  >
                    <FileImage size={18} />
                    {busy === "png"
                      ? "Preparing image…"
                      : "Download image (PNG)"}
                  </button>
                  <button
                    className="btn-secondary"
                    disabled={Boolean(busy)}
                    onClick={() => download("pdf")}
                  >
                    <FileText size={18} />
                    {busy === "pdf"
                      ? "Preparing PDF…"
                      : "Download ticket (PDF)"}
                  </button>
                  {bundle.attendees.length > 1 && (
                    <button
                      className="btn-secondary"
                      disabled={Boolean(busy)}
                      onClick={() => download("all")}
                    >
                      <Download size={18} />
                      {busy === "all"
                        ? "Preparing tickets…"
                        : "Download all tickets (PDF)"}
                    </button>
                  )}
                  {error && (
                    <p className="form-error" role="alert">
                      {error}
                    </p>
                  )}
                </>
              )}
            </section>
            <section className="ticket-preview" aria-label="Ticket preview">
              {preview ? (
                <img
                  src={preview}
                  alt={
                    guest
                      ? `Verified ticket for ${guest.firstName} ${guest.lastName}, UUID ${guest.uuid}`
                      : "Ticket preview"
                  }
                />
              ) : (
                <p role="status">
                  {previewError || "Preparing your ticket preview…"}
                </p>
              )}
            </section>
          </div>
        </>
      )}
    </main>
  );
}
