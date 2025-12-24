import { createClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata = {
  title: "Admin Dashboard - ChapChap",
  description: "Admin dashboard for monitoring ChapChap metrics",
};

export default async function AdminPage() {
  const supabase = await createClient();

  // Fetch metrics
  const [
    { count: totalUsers },
    { count: totalInvoices },
    { data: subscriptions },
    { data: recentUsers },
    { data: enterpriseLeads },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("invoices").select("*", { count: "exact", head: true }),
    supabase.from("user_subscriptions").select("*, subscription_plans(*)"),
    supabase.from("users").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("enterprise_inquiries").select("*").order("created_at", { ascending: false }).limit(10),
  ]);

  // Calculate subscription metrics
  const activeSubscriptions = subscriptions?.filter(s => s.status === "active") || [];
  const trialSubscriptions = subscriptions?.filter(s => s.status === "trial") || [];
  
  // Calculate MRR
  const mrr = activeSubscriptions.reduce((sum, sub) => {
    const plan = sub.subscription_plans as any;
    return sum + (plan?.price_usd || 0);
  }, 0);

  // Plan distribution
  const planDistribution = {
    starter: subscriptions?.filter(s => (s.subscription_plans as any)?.slug === "starter").length || 0,
    professional: subscriptions?.filter(s => (s.subscription_plans as any)?.slug === "professional").length || 0,
    enterprise: subscriptions?.filter(s => (s.subscription_plans as any)?.slug === "enterprise").length || 0,
  };

  return (
    <AdminDashboard
      metrics={{
        totalUsers: totalUsers || 0,
        totalInvoices: totalInvoices || 0,
        activeSubscriptions: activeSubscriptions.length,
        trialUsers: trialSubscriptions.length,
        mrr,
        planDistribution,
      }}
      recentUsers={recentUsers || []}
      enterpriseLeads={enterpriseLeads || []}
    />
  );
}
