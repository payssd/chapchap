import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/paystack";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

// Use service role for verification
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 }
      );
    }

    // Verify with Paystack
    const paystackResponse = await verifyPayment(reference);

    if (!paystackResponse.status) {
      return NextResponse.json(
        { success: false, error: paystackResponse.message },
        { status: 400 }
      );
    }

    const { status, amount, paid_at, metadata } = paystackResponse.data;

    if (status !== "success") {
      return NextResponse.json(
        { success: false, error: "Payment was not successful" },
        { status: 400 }
      );
    }

    const invoiceId = metadata?.invoice_id;

    if (invoiceId) {
      // Update invoice status
      await supabase
        .from("invoices")
        .update({
          status: "PAID",
          paid_at: paid_at,
        })
        .eq("id", invoiceId);

      // Check if payment record already exists
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id")
        .eq("paystack_reference", reference)
        .single();

      if (!existingPayment) {
        // Create payment record
        await supabase.from("payments").insert({
          invoice_id: invoiceId,
          amount: amount / 100,
          paystack_reference: reference,
          paid_at: paid_at,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        status,
        amount: amount / 100,
        paid_at,
        invoiceId,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
