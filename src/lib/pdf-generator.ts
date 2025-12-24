import { jsPDF } from "jspdf";
import { format } from "date-fns";
import type { Invoice, Client, User } from "@/lib/supabase/database.types";

export type InvoiceTemplate = "modern" | "classic" | "minimal";

interface InvoiceData {
  invoice: Invoice;
  client: Client;
  user: User;
  businessLogoUrl?: string;
}

const COLORS = {
  primary: "#FF6B35",
  primaryDark: "#EA580C",
  navy: "#1A2332",
  gray: "#64748B",
  lightGray: "#F5F5F4",
  white: "#FFFFFF",
  green: "#2EB872",
  black: "#1C1917",
};

function formatCurrencyForPDF(amount: number, currency: string = "KES"): string {
  const symbols: Record<string, string> = {
    KES: "KES",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  const symbol = symbols[currency] || currency;
  return `${symbol} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function generateInvoicePDF(
  data: InvoiceData,
  template: InvoiceTemplate = "modern"
): Promise<Blob> {
  const { invoice, client, user } = data;

  switch (template) {
    case "classic":
      return generateClassicTemplate(data);
    case "minimal":
      return generateMinimalTemplate(data);
    case "modern":
    default:
      return generateModernTemplate(data);
  }
}

async function generateModernTemplate(data: InvoiceData): Promise<Blob> {
  const { invoice, client, user } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header with gradient effect (simulated with rectangle)
  doc.setFillColor(255, 107, 53);
  doc.rect(0, 0, pageWidth, 45, "F");

  // Business Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(user.business_name || "ChapChap Invoice", 20, 25);

  // Invoice label
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("INVOICE", pageWidth - 20, 20, { align: "right" });
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.invoice_number, pageWidth - 20, 30, { align: "right" });

  // Status badge
  const statusColors: Record<string, [number, number, number]> = {
    PAID: [46, 184, 114],
    SENT: [59, 130, 246],
    DRAFT: [148, 163, 184],
    OVERDUE: [239, 68, 68],
    CANCELLED: [253, 183, 80],
  };
  const statusColor = statusColors[invoice.status] || [148, 163, 184];
  doc.setFillColor(...statusColor);
  doc.roundedRect(pageWidth - 50, 35, 30, 8, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(invoice.status, pageWidth - 35, 40.5, { align: "center" });

  // Reset text color
  doc.setTextColor(28, 25, 23);

  // Bill To section
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("BILL TO", 20, 60);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(28, 25, 23);
  doc.text(client.name, 20, 70);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  let yPos = 77;
  if (client.business_name) {
    doc.text(client.business_name, 20, yPos);
    yPos += 6;
  }
  if (client.email) {
    doc.text(client.email, 20, yPos);
    yPos += 6;
  }
  if (client.phone_number) {
    doc.text(client.phone_number, 20, yPos);
  }

  // Invoice Details section
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("INVOICE DETAILS", pageWidth - 70, 60);

  doc.setFont("helvetica", "normal");
  doc.text("Issue Date:", pageWidth - 70, 70);
  doc.text("Due Date:", pageWidth - 70, 78);

  doc.setTextColor(28, 25, 23);
  doc.text(format(new Date(invoice.created_at), "MMM dd, yyyy"), pageWidth - 20, 70, { align: "right" });
  doc.text(format(new Date(invoice.due_date), "MMM dd, yyyy"), pageWidth - 20, 78, { align: "right" });

  // Description section
  doc.setFillColor(245, 245, 244);
  doc.rect(20, 105, pageWidth - 40, 10, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(28, 25, 23);
  doc.text("Description", 25, 112);
  doc.text("Amount", pageWidth - 25, 112, { align: "right" });

  // Line item
  doc.setFont("helvetica", "normal");
  doc.setTextColor(68, 64, 60);
  const description = invoice.description || "Invoice for services rendered";
  const splitDescription = doc.splitTextToSize(description, 120);
  doc.text(splitDescription, 25, 125);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(28, 25, 23);
  doc.text(formatCurrencyForPDF(invoice.amount, invoice.currency), pageWidth - 25, 125, { align: "right" });

  // Divider line
  doc.setDrawColor(231, 229, 228);
  doc.line(20, 140, pageWidth - 20, 140);

  // Total section
  doc.setFillColor(255, 247, 237);
  doc.rect(pageWidth - 90, 145, 70, 25, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Total Due", pageWidth - 85, 155);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 107, 53);
  doc.text(formatCurrencyForPDF(invoice.amount, invoice.currency), pageWidth - 25, 165, { align: "right" });

  // Payment Instructions
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(28, 25, 23);
  doc.text("Payment Instructions", 20, 185);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  if (invoice.paystack_payment_link) {
    doc.text("Pay online using the link below:", 20, 193);
    doc.setTextColor(255, 107, 53);
    doc.text(invoice.paystack_payment_link, 20, 200);
  } else {
    doc.text("Please contact us for payment details.", 20, 193);
  }

  // Footer
  doc.setFillColor(26, 35, 50);
  doc.rect(0, doc.internal.pageSize.getHeight() - 25, pageWidth, 25, "F");

  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("Thank you for your business!", pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text("Powered by ChapChap", pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: "center" });

  return doc.output("blob");
}

async function generateClassicTemplate(data: InvoiceData): Promise<Blob> {
  const { invoice, client, user } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 35, 50);
  doc.text("INVOICE", 20, 30);

  // Business info on right
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(user.business_name || "Your Business", pageWidth - 20, 25, { align: "right" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(user.email, pageWidth - 20, 32, { align: "right" });
  if (user.phone_number) {
    doc.text(user.phone_number, pageWidth - 20, 39, { align: "right" });
  }

  // Divider
  doc.setDrawColor(231, 229, 228);
  doc.setLineWidth(0.5);
  doc.line(20, 50, pageWidth - 20, 50);

  // Invoice details
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Invoice Number:", 20, 65);
  doc.text("Issue Date:", 20, 73);
  doc.text("Due Date:", 20, 81);
  doc.text("Status:", 20, 89);

  doc.setTextColor(28, 25, 23);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.invoice_number, 70, 65);
  doc.setFont("helvetica", "normal");
  doc.text(format(new Date(invoice.created_at), "MMMM dd, yyyy"), 70, 73);
  doc.text(format(new Date(invoice.due_date), "MMMM dd, yyyy"), 70, 81);
  doc.text(invoice.status, 70, 89);

  // Bill To
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("Bill To:", pageWidth - 80, 65);
  doc.setTextColor(28, 25, 23);
  doc.text(client.name, pageWidth - 80, 73);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  let billY = 81;
  if (client.business_name) {
    doc.text(client.business_name, pageWidth - 80, billY);
    billY += 8;
  }
  if (client.email) {
    doc.text(client.email, pageWidth - 80, billY);
    billY += 8;
  }
  if (client.phone_number) {
    doc.text(client.phone_number, pageWidth - 80, billY);
  }

  // Table header
  doc.setFillColor(245, 245, 244);
  doc.rect(20, 110, pageWidth - 40, 12, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(28, 25, 23);
  doc.text("Description", 25, 118);
  doc.text("Amount", pageWidth - 25, 118, { align: "right" });

  // Table content
  doc.setFont("helvetica", "normal");
  doc.setTextColor(68, 64, 60);
  const description = invoice.description || "Services rendered";
  const splitDesc = doc.splitTextToSize(description, 120);
  doc.text(splitDesc, 25, 132);
  doc.text(formatCurrencyForPDF(invoice.amount, invoice.currency), pageWidth - 25, 132, { align: "right" });

  // Total
  doc.setDrawColor(231, 229, 228);
  doc.line(pageWidth - 90, 150, pageWidth - 20, 150);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(28, 25, 23);
  doc.text("Total:", pageWidth - 90, 162);
  doc.setFontSize(14);
  doc.text(formatCurrencyForPDF(invoice.amount, invoice.currency), pageWidth - 25, 162, { align: "right" });

  // Payment link
  if (invoice.paystack_payment_link) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Payment Link:", 20, 185);
    doc.setTextColor(255, 107, 53);
    doc.text(invoice.paystack_payment_link, 20, 193);
  }

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Thank you for your business!", pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: "center" });

  return doc.output("blob");
}

async function generateMinimalTemplate(data: InvoiceData): Promise<Blob> {
  const { invoice, client, user } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Simple header
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(user.business_name || "Invoice", 20, 20);

  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(28, 25, 23);
  doc.text(invoice.invoice_number, 20, 35);

  // Status
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(invoice.status, 20, 45);

  // Dates on right
  doc.setFontSize(10);
  doc.text("Issued: " + format(new Date(invoice.created_at), "MMM dd, yyyy"), pageWidth - 20, 25, { align: "right" });
  doc.text("Due: " + format(new Date(invoice.due_date), "MMM dd, yyyy"), pageWidth - 20, 33, { align: "right" });

  // Client info
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Billed to", 20, 70);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(28, 25, 23);
  doc.text(client.name, 20, 80);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  let y = 88;
  if (client.email) {
    doc.text(client.email, 20, y);
    y += 7;
  }
  if (client.phone_number) {
    doc.text(client.phone_number, 20, y);
  }

  // Description
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Description", 20, 120);
  doc.setTextColor(28, 25, 23);
  const description = invoice.description || "Services";
  doc.text(description, 20, 130);

  // Amount - large and prominent
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Amount Due", 20, 160);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 107, 53);
  doc.text(formatCurrencyForPDF(invoice.amount, invoice.currency), 20, 175);

  // Payment link
  if (invoice.paystack_payment_link) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Pay online:", 20, 200);
    doc.setTextColor(255, 107, 53);
    doc.text(invoice.paystack_payment_link, 20, 208);
  }

  return doc.output("blob");
}

export async function uploadPDFToStorage(
  supabase: any,
  blob: Blob,
  invoiceId: string,
  userId: string
): Promise<string | null> {
  const fileName = `invoices/${userId}/${invoiceId}.pdf`;

  const { data, error } = await supabase.storage
    .from("documents")
    .upload(fileName, blob, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    console.error("Error uploading PDF:", error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("documents")
    .getPublicUrl(fileName);

  return urlData?.publicUrl || null;
}
