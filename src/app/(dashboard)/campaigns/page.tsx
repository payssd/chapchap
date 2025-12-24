import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CampaignsClient } from "@/components/campaigns/CampaignsClient";

export default async function CampaignsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch campaigns
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch invoices for targeting
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, clients(name, email, phone_number)")
    .eq("user_id", user.id)
    .in("status", ["SENT", "OVERDUE"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <p className="text-muted-foreground">
          Send bulk reminder campaigns to your clients
        </p>
      </div>

      <CampaignsClient campaigns={campaigns || []} invoices={invoices || []} />
    </div>
  );
}
