import QRCode from "qrcode";
import type { Attendee, EventDetails, Order } from "../types.js";
export interface TicketBundle {
  event: EventDetails;
  order: Order;
  attendees: Attendee[];
}

// Render text directly to canvas: no external images, DOM screenshots or HTML injection.
export async function renderTicket(
  bundle: TicketBundle,
  guest: Attendee,
): Promise<HTMLCanvasElement> {
  if (
    bundle.order.paymentStatus !== "verified" ||
    guest.paymentStatus !== "verified"
  )
    throw new Error("Payment must be verified before downloading tickets.");
  const { event, order } = bundle;
  const packageBooking = ["VVIP", "CABANA"].some((code) =>
    guest.ticketTierName.toUpperCase().includes(code),
  );
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not create the ticket image.");
  const rows: [string, string][] = [
    ["EVENT", event.title],
    ["DATE & TIME", `${event.date} · ${event.startTime} — ${event.endTime}`],
    [
      "VENUE",
      [event.venue, event.address, event.city, event.country]
        .filter(Boolean)
        .join(" · "),
    ],
    ["GUEST NAME", `${guest.firstName} ${guest.lastName}`],
    ["EMAIL", guest.email],
    ["PHONE", guest.phone],
    ["TICKET / PACKAGE", guest.ticketTierName],
    ["ATTENDEE UUID", guest.uuid],
    ["TICKET CODE", guest.ticketCode],
    ["ORDER REFERENCE", order.orderReference],
    ["PAYMENT REFERENCE", order.paymentReference],
    ["PAYMENT", "Verified"],
    [
      "BOOKING TOTAL",
      `NGN ${order.totalAmount.toLocaleString("en-NG")} · ${order.ticketQuantity} ticket/package(s)`,
    ],
    ["BOOKING CONTACT", `${order.customerFirstName} ${order.customerLastName}`],
    [
      "BOOKED",
      new Date(order.createdAt).toLocaleString("en-GB", {
        timeZone: "Africa/Lagos",
      }) + " WAT",
    ],
  ];
  if (guest.institution) rows.push(["ORGANIZATION", guest.institution]);
  if (guest.additionalNotes) rows.push(["GUEST NOTES", guest.additionalNotes]);
  if (order.verifiedAt)
    rows.push([
      "PAYMENT CONFIRMED",
      new Date(order.verifiedAt).toLocaleString("en-GB", {
        timeZone: "Africa/Lagos",
      }) + " WAT",
    ]);
  rows.push([
    "IMPORTANT",
    packageBooking
      ? "Paid package booking. Our team will contact you to confirm guest arrangements. This document identifies the booking contact."
      : "Keep this pass safe and present the QR code or UUID at the entrance. Each guest has an individual pass.",
  ]);
  const wrap = (text: string) => {
    ctx.font = "28px Arial, sans-serif";
    const lines: string[] = [];
    let line = "";
    for (const character of text.replace(/\r/g, "")) {
      if (
        character === "\n" ||
        ctx.measureText(line + character).width > 1040
      ) {
        lines.push(line);
        line = character === "\n" ? "" : character;
      } else line += character;
    }
    if (line) lines.push(line);
    return lines;
  };
  const prepared = rows.map(([label, value]) => ({
    label,
    lines: wrap(value),
  }));
  canvas.height =
    250 +
    prepared.reduce((sum, row) => sum + 55 + row.lines.length * 36, 0) +
    400;
  ctx.fillStyle = "#faf6ed";
  ctx.fillRect(0, 0, 1200, canvas.height);
  ctx.fillStyle = "#a9471c";
  ctx.fillRect(0, 0, 1200, 16);
  ctx.fillStyle = "#253c3b";
  ctx.font = "58px Georgia, serif";
  ctx.fillText("The Hideout", 80, 110);
  ctx.font = "24px Arial, sans-serif";
  ctx.fillText(
    packageBooking ? "PAID PACKAGE CONFIRMATION" : "VERIFIED GUEST TICKET",
    80,
    160,
  );
  let y = 230;
  for (const row of prepared) {
    ctx.fillStyle = "#a9471c";
    ctx.font = "bold 19px Arial, sans-serif";
    ctx.fillText(row.label, 80, y);
    y += 38;
    ctx.fillStyle = "#253c3b";
    ctx.font = "28px Arial, sans-serif";
    for (const line of row.lines) {
      ctx.fillText(line, 80, y);
      y += 36;
    }
    y += 17;
  }
  const qr = document.createElement("canvas");
  await QRCode.toCanvas(qr, guest.uuid, {
    width: 280,
    margin: 4,
    errorCorrectionLevel: "M",
  });
  ctx.drawImage(qr, 80, y + 10, 280, 280);
  ctx.font = "24px Arial, sans-serif";
  ctx.fillStyle = "#253c3b";
  ctx.fillText("Scan to identify this guest / booking", 400, y + 110);
  ctx.font = "20px Arial, sans-serif";
  ctx.fillText(
    "Admission is checked against the organizer’s records.",
    400,
    y + 155,
  );
  return canvas;
}
export async function saveTicketPng(bundle: TicketBundle, guest: Attendee) {
  const canvas = await renderTicket(bundle, guest);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not create PNG."))),
      "image/png",
    ),
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Hideout-${guest.ticketCode.replace(/[^a-zA-Z0-9_-]/g, "")}.png`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
export async function saveTicketsPdf(bundle: TicketBundle, guests: Attendee[]) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  for (let index = 0; index < guests.length; index++) {
    const canvas = await renderTicket(bundle, guests[index]);
    if (index) pdf.addPage();
    const scale = Math.min(190 / canvas.width, 277 / canvas.height);
    const width = canvas.width * scale,
      height = canvas.height * scale;
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      (210 - width) / 2,
      10,
      width,
      height,
      undefined,
      "FAST",
    );
  }
  pdf.setProperties({ title: "The Hideout — verified tickets" });
  pdf.save(
    guests.length === 1
      ? `Hideout-${guests[0].uuid}.pdf`
      : "Hideout-all-tickets.pdf",
  );
}
