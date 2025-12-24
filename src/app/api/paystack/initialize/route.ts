import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPaymentLink } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    // Fetch invoice with client data
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*, clients(email)")
      .eq("id", invoiceId)
      .eq("user_id", user.id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (!invoice.clients?.email) {
      return NextResponse.json(
        { error: "Client email is required for payment" },
        { status: 400 }
      );
    }

    // Create Paystack payment link
    const paystackResponse = await createPaymentLink(
      invoice.amount,
      invoice.clients.email,
      invoiceId,
      invoice.currency
    );

    if (!paystackResponse.status) {
      return NextResponse.json(
        { error: paystackResponse.message },
        { status: 400 }
      );
    }

    // Update invoice with payment link and reference
    await supabase
      .from("invoices")
      .update({
        paystack_payment_link: paystackResponse.data.authorization_url,
        paystack_reference: paystackResponse.data.reference,
        status: "SENT",
      })
      .eq("id", invoiceId);

    return NextResponse.json({
      success: true,
      paymentLink: paystackResponse.data.authorization_url,
      reference: paystackResponse.data.reference,
    });
  } catch (error) {
    console.error("Paystack initialization error:", error);
    return NextResponse.json(
      { error: "Failed to create payment link" },
      { status: 500 }
    );
  }
}
