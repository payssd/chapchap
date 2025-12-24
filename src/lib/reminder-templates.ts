import { formatCurrency, formatDate } from "@/lib/utils/format";

interface InvoiceData {
  invoice_number: string;
  amount: number;
  currency: string;
  due_date: string;
  description?: string | null;
}

interface ClientData {
  name: string;
  email?: string | null;
  business_name?: string | null;
}

interface BusinessData {
  name: string;
}

// Email Templates
export function invoiceCreatedEmailTemplate(
  invoice: InvoiceData,
  client: ClientData,
  business: BusinessData,
  paymentLink: string
): { subject: string; html: string } {
  return {
    subject: `Invoice ${invoice.invoice_number} from ${business.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0070f3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .invoice-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .amount { font-size: 24px; font-weight: bold; color: #0070f3; }
          .btn { display: inline-block; background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Invoice from ${business.name}</h1>
          </div>
          <div class="content">
            <p>Dear ${client.name},</p>
            <p>You have received a new invoice. Please find the details below:</p>
            
            <div class="invoice-details">
              <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
              <p><strong>Amount Due:</strong> <span class="amount">${formatCurrency(invoice.amount, invoice.currency)}</span></p>
              <p><strong>Due Date:</strong> ${formatDate(invoice.due_date)}</p>
              ${invoice.description ? `<p><strong>Description:</strong> ${invoice.description}</p>` : ""}
            </div>
            
            <p>Please click the button below to make your payment:</p>
            <a href="${paymentLink}" class="btn">Pay Now</a>
            
            <p style="margin-top: 20px;">If you have any questions, please don't hesitate to contact us.</p>
          </div>
          <div class="footer">
            <p>This invoice was sent by ${business.name}</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function reminderBeforeDueEmailTemplate(
  invoice: InvoiceData,
  client: ClientData,
  business: BusinessData,
  daysUntilDue: number,
  paymentLink: string
): { subject: string; html: string } {
  return {
    subject: `Reminder: Invoice ${invoice.invoice_number} due in ${daysUntilDue} day${daysUntilDue > 1 ? "s" : ""}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .invoice-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .amount { font-size: 24px; font-weight: bold; color: #f59e0b; }
          .btn { display: inline-block; background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Reminder</h1>
          </div>
          <div class="content">
            <p>Dear ${client.name},</p>
            <p>This is a friendly reminder that your invoice is due in <strong>${daysUntilDue} day${daysUntilDue > 1 ? "s" : ""}</strong>.</p>
            
            <div class="invoice-details">
              <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
              <p><strong>Amount Due:</strong> <span class="amount">${formatCurrency(invoice.amount, invoice.currency)}</span></p>
              <p><strong>Due Date:</strong> ${formatDate(invoice.due_date)}</p>
            </div>
            
            <p>Please make your payment before the due date to avoid any late fees.</p>
            <a href="${paymentLink}" class="btn">Pay Now</a>
          </div>
          <div class="footer">
            <p>This reminder was sent by ${business.name}</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function reminderOverdueEmailTemplate(
  invoice: InvoiceData,
  client: ClientData,
  business: BusinessData,
  daysOverdue: number,
  paymentLink: string
): { subject: string; html: string } {
  return {
    subject: `OVERDUE: Invoice ${invoice.invoice_number} - ${daysOverdue} day${daysOverdue > 1 ? "s" : ""} past due`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .invoice-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc2626; }
          .amount { font-size: 24px; font-weight: bold; color: #dc2626; }
          .btn { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Payment Overdue</h1>
          </div>
          <div class="content">
            <p>Dear ${client.name},</p>
            <p>Your invoice is now <strong>${daysOverdue} day${daysOverdue > 1 ? "s" : ""} overdue</strong>. Please make your payment as soon as possible.</p>
            
            <div class="invoice-details">
              <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
              <p><strong>Amount Due:</strong> <span class="amount">${formatCurrency(invoice.amount, invoice.currency)}</span></p>
              <p><strong>Due Date:</strong> ${formatDate(invoice.due_date)}</p>
            </div>
            
            <p>Please settle this invoice immediately to avoid further action.</p>
            <a href="${paymentLink}" class="btn">Pay Now</a>
            
            <p style="margin-top: 20px;">If you have already made this payment, please disregard this message.</p>
          </div>
          <div class="footer">
            <p>This reminder was sent by ${business.name}</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

// SMS Templates
export function invoiceCreatedSMSTemplate(
  invoice: InvoiceData,
  business: BusinessData,
  paymentLink: string
): string {
  return `${business.name}: Invoice ${invoice.invoice_number} for ${formatCurrency(invoice.amount, invoice.currency)} due ${formatDate(invoice.due_date)}. Pay here: ${paymentLink}`;
}

export function reminderBeforeDueSMSTemplate(
  invoice: InvoiceData,
  business: BusinessData,
  daysUntilDue: number,
  paymentLink: string
): string {
  return `${business.name}: Reminder - Invoice ${invoice.invoice_number} (${formatCurrency(invoice.amount, invoice.currency)}) due in ${daysUntilDue} day${daysUntilDue > 1 ? "s" : ""}. Pay: ${paymentLink}`;
}

export function reminderOverdueSMSTemplate(
  invoice: InvoiceData,
  business: BusinessData,
  daysOverdue: number,
  paymentLink: string
): string {
  return `${business.name}: OVERDUE - Invoice ${invoice.invoice_number} (${formatCurrency(invoice.amount, invoice.currency)}) is ${daysOverdue} day${daysOverdue > 1 ? "s" : ""} past due. Pay now: ${paymentLink}`;
}
