import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all invoices for analytics
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, clients(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch all payments
  const { data: payments } = await supabase
    .from("payments")
    .select("*, invoices!inner(user_id)")
    .eq("invoices.user_id", user.id);

  // Fetch all reminders
  const { data: reminders } = await supabase
    .from("reminders")
    .select("*, invoices!inner(user_id, status)")
    .eq("invoices.user_id", user.id);

  // Fetch all clients
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id);

  // Fetch expenses if table exists
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your business performance and insights
        </p>
      </div>

      <AnalyticsDashboard
        invoices={invoices || []}
        payments={payments || []}
        reminders={reminders || []}
        clients={clients || []}
        expenses={expenses || []}
      />
    </div>
  );
}
