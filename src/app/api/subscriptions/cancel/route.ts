import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's subscription
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["active", "trial"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    // Update subscription to cancel at period end
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription.id);

    if (updateError) {
      console.error("Error canceling subscription:", updateError);
      return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
    }

    // If there's a Paystack subscription, cancel it there too
    if (subscription.paystack_subscription_code) {
      // Note: In production, you would call Paystack API to cancel
      // For now, we just mark it in our database
      console.log("Would cancel Paystack subscription:", subscription.paystack_subscription_code);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
