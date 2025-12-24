import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email sending via Resend
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
      body: JSON.stringify({
        from: emailFrom,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Email send error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

// SMS sending via Africa's Talking
async function sendSMS(to: string, message: string): Promise<boolean> {
  const atUsername = Deno.env.get("AT_USERNAME");
  const atApiKey = Deno.env.get("AT_API_KEY");

  if (!atUsername || !atApiKey) {
    console.error("Africa's Talking credentials not configured");
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
      body: new URLSearchParams({
        username: atUsername,
        to,
        message,
      }),
    });

    const data = await response.json();
    
    if (!response.ok || data.SMSMessageData?.Recipients?.[0]?.status !== "Success") {
      console.error("SMS send error:", data);
      return false;
    }

    return true;
  } catch (error) {
    console.error("SMS send error:", error);
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

// Generate reminder message
function generateReminderMessage(
  invoice: any,
  client: any,
  business: string,
  daysFromDue: number,
  type: "EMAIL" | "SMS"
): { subject?: string; content: string } {
  const amount = formatCurrency(invoice.amount, invoice.currency);
  const paymentLink = invoice.paystack_payment_link || "";

  if (type === "SMS") {
    if (daysFromDue > 0) {
      return {
        content: `${business}: Reminder - Invoice ${invoice.invoice_number} (${amount}) due in ${daysFromDue} day${daysFromDue > 1 ? "s" : ""}. Pay: ${paymentLink}`,
      };
    } else if (daysFromDue === 0) {
      return {
        content: `${business}: Invoice ${invoice.invoice_number} (${amount}) is due today. Pay now: ${paymentLink}`,
      };
    } else {
      return {
        content: `${business}: OVERDUE - Invoice ${invoice.invoice_number} (${amount}) is ${Math.abs(daysFromDue)} day${Math.abs(daysFromDue) > 1 ? "s" : ""} past due. Pay now: ${paymentLink}`,
      };
    }
  }

  // Email
  const isOverdue = daysFromDue < 0;
  const subject = isOverdue
    ? `OVERDUE: Invoice ${invoice.invoice_number} - ${Math.abs(daysFromDue)} days past due`
    : daysFromDue === 0
    ? `Due Today: Invoice ${invoice.invoice_number}`
    : `Reminder: Invoice ${invoice.invoice_number} due in ${daysFromDue} days`;

  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${isOverdue ? "#dc2626" : "#0070f3"}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .amount { font-size: 24px; font-weight: bold; color: ${isOverdue ? "#dc2626" : "#0070f3"}; }
        .btn { display: inline-block; background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${isOverdue ? "⚠️ Payment Overdue" : "Payment Reminder"}</h1>
        </div>
        <div class="content">
          <p>Dear ${client.name},</p>
          <p>${
            isOverdue
              ? `Your invoice is now <strong>${Math.abs(daysFromDue)} day${Math.abs(daysFromDue) > 1 ? "s" : ""} overdue</strong>.`
              : daysFromDue === 0
              ? "Your invoice is <strong>due today</strong>."
              : `This is a friendly reminder that your invoice is due in <strong>${daysFromDue} day${daysFromDue > 1 ? "s" : ""}</strong>.`
          }</p>
          <p><strong>Invoice:</strong> ${invoice.invoice_number}</p>
          <p><strong>Amount:</strong> <span class="amount">${amount}</span></p>
          <p><a href="${paymentLink}" class="btn">Pay Now</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, content };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const now = new Date();
    console.log(`Checking reminders at ${now.toISOString()}`);

    // Fetch pending reminders that are due
    const { data: reminders, error: fetchError } = await supabase
      .from("reminders")
      .select(`
        *,
        invoices (
          *,
          clients (*),
          users (business_name)
        )
      `)
      .eq("status", "PENDING")
      .lte("scheduled_at", now.toISOString())
      .limit(50);

    if (fetchError) {
      console.error("Error fetching reminders:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${reminders?.length || 0} pending reminders`);

    let sent = 0;
    let failed = 0;

    for (const reminder of reminders || []) {
      const invoice = reminder.invoices;
      const client = invoice?.clients;
      const businessName = invoice?.users?.business_name || "ChapChap";

      // Skip if invoice is already paid
      if (invoice?.status === "PAID") {
        await supabase
          .from("reminders")
          .update({ status: "SENT", sent_at: now.toISOString() })
          .eq("id", reminder.id);
        continue;
      }

      // Calculate days from due date
      const dueDate = new Date(invoice.due_date);
      const diffTime = dueDate.getTime() - now.getTime();
      const daysFromDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let success = false;
      let message = "";

      if (reminder.reminder_type === "EMAIL" && client?.email) {
        const { subject, content } = generateReminderMessage(
          invoice,
          client,
          businessName,
          daysFromDue,
          "EMAIL"
        );
        success = await sendEmail(client.email, subject!, content);
        message = content;
      } else if (reminder.reminder_type === "SMS" && client?.phone_number) {
        const { content } = generateReminderMessage(
          invoice,
          client,
          businessName,
          daysFromDue,
          "SMS"
        );
        success = await sendSMS(client.phone_number, content);
        message = content;
      } else {
        console.log(`Skipping reminder ${reminder.id}: No ${reminder.reminder_type.toLowerCase()} address`);
        continue;
      }

      // Update reminder status
      await supabase
        .from("reminders")
        .update({
          status: success ? "SENT" : "FAILED",
          sent_at: success ? now.toISOString() : null,
          message: message.substring(0, 500),
        })
        .eq("id", reminder.id);

      if (success) {
        sent++;
        console.log(`Sent ${reminder.reminder_type} reminder for invoice ${invoice.invoice_number}`);
      } else {
        failed++;
        console.log(`Failed to send ${reminder.reminder_type} reminder for invoice ${invoice.invoice_number}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: reminders?.length || 0,
        sent,
        failed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Check reminders error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process reminders" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
