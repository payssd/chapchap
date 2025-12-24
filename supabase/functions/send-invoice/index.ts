import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create Paystack payment link
async function createPaystackLink(
  amount: number,
  email: string,
  invoiceId: string,
  currency: string = "KES"
): Promise<{ success: boolean; url?: string; reference?: string; error?: string }> {
  const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
  const appUrl = Deno.env.get("APP_URL") || "https://chapchap.co.ke";

  if (!paystackKey) {
    return { success: false, error: "Paystack not configured" };
  }

  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Convert to smallest unit
        currency,
        metadata: { invoice_id: invoiceId },
        callback_url: `${appUrl}/payment/callback`,
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return { success: false, error: data.message };
    }

    return {
      success: true,
      url: data.data.authorization_url,
      reference: data.data.reference,
    };
  } catch (error) {
    console.error("Paystack error:", error);
    return { success: false, error: "Failed to create payment link" };
  }
}

// Send email via Resend
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const emailFrom = Deno.env.get("EMAIL_FROM") || "invoices@chapchap.co.ke";

  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: emailFrom, to, subject, html }),
    });

    return response.ok;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
}

// Send SMS via Africa's Talking
async function sendSMS(to: string, message: string): Promise<boolean> {
  const atUsername = Deno.env.get("AT_USERNAME");
  const atApiKey = Deno.env.get("AT_API_KEY");

  if (!atUsername || !atApiKey) {
    console.error("Africa's Talking not configured");
    return false;
  }

  try {
    const response = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        apiKey: atApiKey,
      },
      body: new URLSearchParams({ username: atUsername, to, message }),
    });

    const data = await response.json();
    return response.ok && data.SMSMessageData?.Recipients?.[0]?.status === "Success";
  } catch (error) {
    console.error("SMS error:", error);
    return false;
  }
}

// Format currency
function formatCurrency(amount: number, currency: string = "KES"): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format date
function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

// Generate invoice email
function generateInvoiceEmail(
  invoice: any,
  client: any,
  businessName: string,
  paymentLink: string
): { subject: string; html: string } {
  const amount = formatCurrency(invoice.amount, invoice.currency);

  return {
    subject: `Invoice ${invoice.invoice_number} from ${businessName}`,
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
          .amount { font-size: 28px; font-weight: bold; color: #0070f3; }
          .btn { display: inline-block; background: #0070f3; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Invoice from ${businessName}</h1>
          </div>
          <div class="content">
            <p>Dear ${client.name},</p>
            <p>You have received a new invoice. Please find the details below:</p>
            
            <div class="invoice-details">
              <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
              <p><strong>Amount Due:</strong> <span class="amount">${amount}</span></p>
              <p><strong>Due Date:</strong> ${formatDate(invoice.due_date)}</p>
              ${invoice.description ? `<p><strong>Description:</strong> ${invoice.description}</p>` : ""}
            </div>
            
            <p>Click the button below to make your payment securely:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${paymentLink}" class="btn">Pay Now - ${amount}</a>
            </p>
            
            <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
            
            <p>Thank you for your business!</p>
          </div>
          <div class="footer">
            <p>This invoice was sent by ${businessName} via ChapChap</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

// Generate invoice SMS
function generateInvoiceSMS(
  invoice: any,
  businessName: string,
  paymentLink: string
): string {
  const amount = formatCurrency(invoice.amount, invoice.currency);
  return `${businessName}: Invoice ${invoice.invoice_number} for ${amount} due ${formatDate(invoice.due_date)}. Pay securely: ${paymentLink}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { invoiceId, sendEmail: shouldSendEmail = true, sendSMS: shouldSendSMS = false } = await req.json();

    if (!invoiceId) {
      return new Response(
        JSON.stringify({ error: "Invoice ID required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch invoice with client and user data
    const { data: invoice, error: fetchError } = await supabase
      .from("invoices")
      .select("*, clients(*), users(business_name)")
      .eq("id", invoiceId)
      .single();

    if (fetchError || !invoice) {
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const client = invoice.clients;
    const businessName = invoice.users?.business_name || "ChapChap";

    if (!client?.email) {
      return new Response(
        JSON.stringify({ error: "Client email required for payment link" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Paystack payment link if not exists
    let paymentLink = invoice.paystack_payment_link;
    let reference = invoice.paystack_reference;

    if (!paymentLink) {
      const paystackResult = await createPaystackLink(
        invoice.amount,
        client.email,
        invoiceId,
        invoice.currency
      );

      if (!paystackResult.success) {
        return new Response(
          JSON.stringify({ error: paystackResult.error }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      paymentLink = paystackResult.url!;
      reference = paystackResult.reference!;

      // Update invoice with payment link
      await supabase
        .from("invoices")
        .update({
          paystack_payment_link: paymentLink,
          paystack_reference: reference,
        })
        .eq("id", invoiceId);
    }

    const results = { email: false, sms: false };

    // Send email
    if (shouldSendEmail && client.email) {
      const { subject, html } = generateInvoiceEmail(invoice, client, businessName, paymentLink);
      results.email = await sendEmail(client.email, subject, html);
    }

    // Send SMS
    if (shouldSendSMS && client.phone_number) {
      const smsMessage = generateInvoiceSMS(invoice, businessName, paymentLink);
      results.sms = await sendSMS(client.phone_number, smsMessage);
    }

    // Update invoice status to SENT
    await supabase
      .from("invoices")
      .update({ status: "SENT" })
      .eq("id", invoiceId)
      .eq("status", "DRAFT");

    // Schedule automatic reminders based on user settings
    const { data: settings } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", invoice.user_id)
      .single();

    if (settings?.auto_reminders_enabled) {
      const dueDate = new Date(invoice.due_date);
      const remindersToCreate = [];

      // Reminders before due date
      const daysBefore = (settings.reminder_days_before as number[]) || [3];
      for (const days of daysBefore) {
        const scheduledAt = new Date(dueDate);
        scheduledAt.setDate(scheduledAt.getDate() - days);
        scheduledAt.setHours(9, 0, 0, 0); // 9 AM

        if (scheduledAt > new Date()) {
          if (settings.email_notifications && client.email) {
            remindersToCreate.push({
              invoice_id: invoiceId,
              reminder_type: "EMAIL",
              scheduled_at: scheduledAt.toISOString(),
              status: "PENDING",
            });
          }
          if (settings.sms_notifications && client.phone_number) {
            remindersToCreate.push({
              invoice_id: invoiceId,
              reminder_type: "SMS",
              scheduled_at: scheduledAt.toISOString(),
              status: "PENDING",
            });
          }
        }
      }

      // Reminders after due date
      const daysAfter = (settings.reminder_days_after as number[]) || [3, 7, 14];
      for (const days of daysAfter) {
        const scheduledAt = new Date(dueDate);
        scheduledAt.setDate(scheduledAt.getDate() + days);
        scheduledAt.setHours(9, 0, 0, 0);

        if (settings.email_notifications && client.email) {
          remindersToCreate.push({
            invoice_id: invoiceId,
            reminder_type: "EMAIL",
            scheduled_at: scheduledAt.toISOString(),
            status: "PENDING",
          });
        }
        if (settings.sms_notifications && client.phone_number) {
          remindersToCreate.push({
            invoice_id: invoiceId,
            reminder_type: "SMS",
            scheduled_at: scheduledAt.toISOString(),
            status: "PENDING",
          });
        }
      }

      if (remindersToCreate.length > 0) {
        await supabase.from("reminders").insert(remindersToCreate);
        console.log(`Created ${remindersToCreate.length} scheduled reminders`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentLink,
        reference,
        notifications: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Send invoice error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send invoice" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
