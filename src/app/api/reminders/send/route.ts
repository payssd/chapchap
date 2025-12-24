import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, sendSMS } from "@/lib/notifications";
import {
  reminderBeforeDueEmailTemplate,
  reminderOverdueEmailTemplate,
  reminderBeforeDueSMSTemplate,
  reminderOverdueSMSTemplate,
} from "@/lib/reminder-templates";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { invoiceId, reminderType } = await request.json();

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    // Fetch invoice with client and user data
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*, clients(*)")
      .eq("id", invoiceId)
      .eq("user_id", user.id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Fetch user profile for business name
    const { data: userProfile } = await supabase
      .from("users")
      .select("business_name")
      .eq("id", user.id)
      .single();

    const businessName = userProfile?.business_name || "Your Business";
    const client = invoice.clients;

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Calculate days until/after due date
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const paymentLink = invoice.paystack_payment_link || `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}`;

    let result = { success: false, error: "" };
    let message = "";

    const type = reminderType || "EMAIL";

    if (type === "EMAIL" && client.email) {
      const template = diffDays >= 0
        ? reminderBeforeDueEmailTemplate(
            invoice,
            client,
            { name: businessName },
            Math.abs(diffDays),
            paymentLink
          )
        : reminderOverdueEmailTemplate(
            invoice,
            client,
            { name: businessName },
            Math.abs(diffDays),
            paymentLink
          );

      result = await sendEmail(client.email, template.subject, template.html);
      message = template.html;
    } else if (type === "SMS" && client.phone_number) {
      const smsMessage = diffDays >= 0
        ? reminderBeforeDueSMSTemplate(
            invoice,
            { name: businessName },
            Math.abs(diffDays),
            paymentLink
          )
        : reminderOverdueSMSTemplate(
            invoice,
            { name: businessName },
            Math.abs(diffDays),
            paymentLink
          );

      result = await sendSMS(client.phone_number, smsMessage);
      message = smsMessage;
    } else {
      return NextResponse.json(
        { error: `No ${type.toLowerCase()} address available for client` },
        { status: 400 }
      );
    }

    // Create reminder record
    await supabase.from("reminders").insert({
      invoice_id: invoiceId,
      reminder_type: type,
      scheduled_at: new Date().toISOString(),
      sent_at: result.success ? new Date().toISOString() : null,
      status: result.success ? "SENT" : "FAILED",
      message: message.substring(0, 500),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send reminder" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send reminder error:", error);
    return NextResponse.json(
      { error: "Failed to send reminder" },
      { status: 500 }
    );
  }
}
