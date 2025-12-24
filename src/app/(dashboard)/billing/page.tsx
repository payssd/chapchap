import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BillingPageClient } from "@/components/billing/BillingPageClient";

export const metadata = {
  title: "Billing - ChapChap",
  description: "Manage your subscription and billing",
};

export default async function BillingPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch user's subscription with plan details
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("*, subscription_plans(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Fetch all available plans
  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("price_usd", { ascending: true });

  // Fetch usage tracking
  let usage = null;
  if (subscription) {
    const { data: usageData } = await supabase
      .from("usage_tracking")
      .select("*")
      .eq("user_id", user.id)
      .eq("period_start", subscription.current_period_start.split("T")[0])
      .single();
    usage = usageData;
  }

  return (
    <BillingPageClient
      subscription={subscription}
      plans={plans || []}
      usage={usage}
      userEmail={user.email || ""}
    />
  );
}
