import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.redirect(new URL("/billing?error=missing_reference", request.url));
    }

    // Verify transaction with Paystack
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const result = await response.json();

    if (!result.status || result.data.status !== "success") {
      console.error("Payment verification failed:", result.message);
      return NextResponse.redirect(new URL("/billing?error=payment_failed", request.url));
    }

    const { metadata, customer } = result.data;
    const userId = metadata?.user_id;
    const planSlug = metadata?.plan_slug;
    const subscriptionCode = result.data.subscription?.subscription_code;

    if (!userId || !planSlug) {
      console.error("Missing metadata in payment");
      return NextResponse.redirect(new URL("/billing?error=invalid_payment", request.url));
    }

    const supabase = await createClient();

    // Get the plan ID
    const { data: plan } = await supabase
      .from("subscription_plans")
      .select("id")
      .eq("slug", planSlug)
      .single();

    if (!plan) {
      console.error("Plan not found:", planSlug);
      return NextResponse.redirect(new URL("/billing?error=plan_not_found", request.url));
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Update user subscription
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .upsert({
        user_id: userId,
        plan_id: plan.id,
        status: "active",
        trial_ends_at: null,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
        paystack_subscription_code: subscriptionCode || null,
        updated_at: now.toISOString(),
      }, {
        onConflict: "user_id",
      });

    if (updateError) {
      console.error("Error updating subscription:", updateError);
      return NextResponse.redirect(new URL("/billing?error=update_failed", request.url));
    }

    // Reset usage tracking for new period
    await supabase
      .from("usage_tracking")
      .upsert({
        user_id: userId,
        period_start: now.toISOString().split("T")[0],
        period_end: periodEnd.toISOString().split("T")[0],
        invoices_created: 0,
        reminders_sent: 0,
        clients_added: 0,
      }, {
        onConflict: "user_id,period_start,period_end",
      });

    // Redirect to billing page with success
    return NextResponse.redirect(new URL("/billing?success=subscription_activated", request.url));
  } catch (error) {
    console.error("Error verifying subscription:", error);
    return NextResponse.redirect(new URL("/billing?error=verification_failed", request.url));
  }
}
