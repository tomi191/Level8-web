import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { readFileSync } from "fs";
import { join } from "path";
import type { InvoiceLineItem } from "@/types/crm";

// Read font base64 at runtime to avoid Turbopack/SWC worker crash
// on the 400KB+ TS module. Cached after first read.
let _interFontCache: string | null = null;

function getInterFontBase64(): string {
  if (_interFontCache) return _interFontCache;
  const fontPath = join(process.cwd(), "src/lib/pdf/fonts/inter-regular.b64.txt");
  try {
    _interFontCache = readFileSync(fontPath, "utf-8").trim();
  } catch {
    // Fallback: return empty string - PDF will render without custom font
    console.warn("[invoice-pdf] Could not read Inter font file at", fontPath);
    _interFontCache = "";
  }
  return _interFontCache;
}

// ============================================================
// Types
// ============================================================

export interface InvoicePdfData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  periodStart: string | null;
  periodEnd: string | null;
  status: string;

  // Seller
  sellerName: string;
  sellerEik: string;
  sellerAddress: string;
  sellerCity: string;

  // Buyer
  buyerName: string;
  buyerEik: string | null;
  buyerAddress: string | null;
  buyerCity: string | null;

  // Amounts
  amount: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;

  // Items
  items: InvoiceLineItem[];

  // Optional
  description: string | null;
  notes: string | null;
  paymentMethod: string | null;
}

// ============================================================
// Constants
// ============================================================

const SELLER = {
  name: "\u041B\u0415\u0412\u0415\u041B 8 \u0415\u041E\u041E\u0414",
  eik: "208697165",
  address: "\u0436.\u043A. \u0412\u044A\u0437\u0440\u0430\u0436\u0434\u0430\u043D\u0435, \u0431\u043B. 28, \u0432\u0445. 1, \u0435\u0442. 5, \u0430\u043F. 10",
  city: "\u0433\u0440. \u0412\u0430\u0440\u043D\u0430",
};

const BANK_DETAILS = {
  bankName: "\u0423\u043D\u0438\u043A\u0440\u0435\u0434\u0438\u0442 \u0411\u0443\u043B\u0431\u0430\u043D\u043A",
  iban: "BG00UNCR00000000000000", // placeholder — update with real IBAN
  bic: "UNCRBGSF",
  holder: "\u041B\u0415\u0412\u0415\u041B 8 \u0415\u041E\u041E\u0414",
};

const CURRENCY_LABELS: Record<string, string> = {
  BGN: "\u043B\u0432.",
  EUR: "\u20AC",
  USD: "$",
};

const PAYMENT_LABELS: Record<string, string> = {
  bank_transfer: "\u0411\u0430\u043D\u043A\u043E\u0432 \u043F\u0440\u0435\u0432\u043E\u0434",
  card: "\u041A\u0430\u0440\u0442\u0430",
  cash: "\u0412 \u0431\u0440\u043E\u0439",
};

// ============================================================
// PDF Generation
// ============================================================

export function generateInvoicePdf(data: InvoicePdfData): Buffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Register Inter font for Cyrillic support (loaded at runtime from .b64.txt)
  const interBase64 = getInterFontBase64();
  if (interBase64) {
    doc.addFileToVFS("Inter-Regular.ttf", interBase64);
    doc.addFont("Inter-Regular.ttf", "Inter", "normal");
    doc.setFont("Inter");
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const curr = CURRENCY_LABELS[data.currency] ?? data.currency;

  // --- Header ---
  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  doc.text("\u0424\u0410\u041A\u0422\u0423\u0420\u0410", margin, y);

  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`\u2116 ${data.invoiceNumber}`, pageWidth - margin, y, { align: "right" });

  y += 12;

  // --- Dates row ---
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);

  const dateLines = [
    `\u0414\u0430\u0442\u0430: ${data.issueDate}`,
    `\u041F\u0430\u0434\u0435\u0436: ${data.dueDate}`,
  ];
  if (data.periodStart && data.periodEnd) {
    dateLines.push(`\u041F\u0435\u0440\u0438\u043E\u0434: ${data.periodStart} \u2013 ${data.periodEnd}`);
  }
  doc.text(dateLines.join("   |   "), margin, y);
  y += 8;

  // --- Divider ---
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // --- Seller / Buyer columns ---
  const colWidth = contentWidth / 2 - 5;

  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text("\u0414\u041E\u0421\u0422\u0410\u0412\u0427\u0418\u041A", margin, y);
  doc.text("\u041F\u041E\u041B\u0423\u0427\u0410\u0422\u0415\u041B", margin + colWidth + 10, y);
  y += 5;

  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(SELLER.name, margin, y);
  doc.text(data.buyerName, margin + colWidth + 10, y);
  y += 5;

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`\u0415\u0418\u041A: ${SELLER.eik}`, margin, y);
  if (data.buyerEik) {
    doc.text(`\u0415\u0418\u041A: ${data.buyerEik}`, margin + colWidth + 10, y);
  }
  y += 4.5;

  doc.text(SELLER.address, margin, y);
  if (data.buyerAddress) {
    doc.text(data.buyerAddress, margin + colWidth + 10, y);
  }
  y += 4.5;

  doc.text(SELLER.city, margin, y);
  if (data.buyerCity) {
    doc.text(data.buyerCity, margin + colWidth + 10, y);
  }
  y += 10;

  // --- Line items table ---
  const tableHead = [["\u2116", "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435", "\u041A\u043E\u043B.", "\u0415\u0434. \u0446\u0435\u043D\u0430", "\u0421\u0443\u043C\u0430"]];
  const tableBody = data.items.map((item, i) => [
    String(i + 1),
    item.description,
    String(item.qty),
    `${item.unit_price.toFixed(2)} ${curr}`,
    `${item.total.toFixed(2)} ${curr}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: tableHead,
    body: tableBody,
    theme: "grid",
    margin: { left: margin, right: margin },
    styles: {
      font: "Inter",
      fontSize: 9,
      cellPadding: 3,
      textColor: [40, 40, 40],
      lineColor: [200, 200, 200],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [60, 60, 60],
      fontSize: 8,
      fontStyle: "normal",
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 15, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // --- Totals ---
  const totalsX = pageWidth - margin - 70;

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("\u0421\u0443\u043C\u0430 \u0431\u0435\u0437 \u0414\u0414\u0421:", totalsX, y);
  doc.text(`${data.amount.toFixed(2)} ${curr}`, pageWidth - margin, y, { align: "right" });
  y += 5;

  doc.text("\u0414\u0414\u0421 20%:", totalsX, y);
  doc.text(`${data.vatAmount.toFixed(2)} ${curr}`, pageWidth - margin, y, { align: "right" });
  y += 5;

  doc.setDrawColor(200, 200, 200);
  doc.line(totalsX, y, pageWidth - margin, y);
  y += 5;

  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text("\u041E\u0411\u0429\u041E:", totalsX, y);
  doc.text(`${data.totalAmount.toFixed(2)} ${curr}`, pageWidth - margin, y, { align: "right" });
  y += 10;

  // --- Payment method ---
  if (data.paymentMethod) {
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const label = PAYMENT_LABELS[data.paymentMethod] ?? data.paymentMethod;
    doc.text(`\u041C\u0435\u0442\u043E\u0434 \u043D\u0430 \u043F\u043B\u0430\u0449\u0430\u043D\u0435: ${label}`, margin, y);
    y += 6;
  }

  // --- Notes ---
  if (data.notes) {
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const noteLines = doc.splitTextToSize(`\u0411\u0435\u043B\u0435\u0436\u043A\u0438: ${data.notes}`, contentWidth);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 4 + 4;
  }

  // --- Bank Details ---
  if (data.paymentMethod === "bank_transfer" || !data.paymentMethod) {
    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text("\u0411\u0430\u043D\u043A\u043E\u0432\u0430 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F", margin, y);
    y += 5;

    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text(`\u0411\u0430\u043D\u043A\u0430: ${BANK_DETAILS.bankName}`, margin, y);
    y += 4.5;
    doc.text(`IBAN: ${BANK_DETAILS.iban}`, margin, y);
    y += 4.5;
    doc.text(`BIC: ${BANK_DETAILS.bic}`, margin, y);
    y += 4.5;
    doc.text(`\u0422\u0438\u0442\u0443\u043B\u044F\u0440: ${BANK_DETAILS.holder}`, margin, y);
    y += 4.5;
    doc.text(`\u041E\u0441\u043D\u043E\u0432\u0430\u043D\u0438\u0435: \u0424\u0430\u043A\u0442\u0443\u0440\u0430 ${data.invoiceNumber}`, margin, y);
    y += 6;
  }

  // --- Footer ---
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text(
    `${SELLER.name} | \u0415\u0418\u041A ${SELLER.eik} | ${SELLER.address}, ${SELLER.city} | level8.bg`,
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  // Return as Buffer
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
