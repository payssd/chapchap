import { format } from "date-fns";

export function generateInvoiceNumber(lastInvoiceNumber: string | null): string {
  const today = format(new Date(), "yyyyMMdd");
  const prefix = `INV-${today}-`;

  if (!lastInvoiceNumber) {
    return `${prefix}001`;
  }

  // Extract the date and sequence from the last invoice number
  const match = lastInvoiceNumber.match(/INV-(\d{8})-(\d{3})/);
  
  if (!match) {
    return `${prefix}001`;
  }

  const lastDate = match[1];
  const lastSequence = parseInt(match[2], 10);

  // If same day, increment sequence; otherwise start at 001
  if (lastDate === today) {
    const newSequence = (lastSequence + 1).toString().padStart(3, "0");
    return `${prefix}${newSequence}`;
  }

  return `${prefix}001`;
}
