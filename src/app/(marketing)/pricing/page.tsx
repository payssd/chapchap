import { createClient } from "@/lib/supabase/server";
import { PricingPageClient } from "@/components/pricing/PricingPageClient";

export const metadata = {
  title: "Pricing - ChapChap",
  description: "Simple, transparent pricing for businesses of all sizes. Start with a 14-day free trial.",
};

export default async function PricingPage() {
  const supabase = await createClient();

  // Fetch pricing plans from database
  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("price_usd", { ascending: true });

  return <PricingPageClient plans={plans || []} />;
}
