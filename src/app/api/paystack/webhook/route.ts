import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookSignature } from "@/lib/paystack";
import type { Database } from "@/lib/supabase/database.types";

// Use service role for webhook (no user context)
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(
      payload,
      signature,
      process.env.PAYSTACK_SECRET_KEY!
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(payload);

    // Handle successful payment
    if (event.event === "charge.success") {
      const { reference, amount, paid_at, metadata } = event.data;
      const invoiceId = metadata?.invoice_id;

      if (!invoiceId) {
        console.error("No invoice ID in payment metadata");
        return NextResponse.json({ received: true });
      }

      // Update invoice status
      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({
          status: "PAID",
          paid_at: paid_at,
        })
        .eq("id", invoiceId)
        .eq("paystack_reference", reference);

      if (invoiceError) {
        console.error("Error updating invoice:", invoiceError);
      }

      // Create payment record
      const { error: paymentError } = await supabase.from("payments").insert({
        invoice_id: invoiceId,
        amount: amount / 100, // Convert from smallest unit
        paystack_reference: reference,
        paid_at: paid_at,
      });

      if (paymentError) {
        console.error("Error creating payment record:", paymentError);
      }

      console.log(`Payment successful for invoice ${invoiceId}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
