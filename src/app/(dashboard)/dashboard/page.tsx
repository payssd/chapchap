import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentInvoicesTable } from "@/components/dashboard/RecentInvoicesTable";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { getMonthName } from "@/lib/utils/format";

async function getDashboardStats(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  // Total outstanding (unpaid invoices)
  const { data: outstandingData } = await supabase
    .from("invoices")
    .select("amount")
    .eq("user_id", userId)
    .in("status", ["DRAFT", "SENT", "OVERDUE"]);

  const totalOutstanding = outstandingData?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

  // Overdue amount
  const { data: overdueData } = await supabase
    .from("invoices")
    .select("amount")
    .eq("user_id", userId)
    .in("status", ["SENT", "OVERDUE"])
    .lt("due_date", today);

  const overdueAmount = overdueData?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

  // Paid this month
  const { data: paidData } = await supabase
    .from("invoices")
    .select("amount")
    .eq("user_id", userId)
    .eq("status", "PAID")
    .gte("paid_at", startOfMonth);

  const paidThisMonth = paidData?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

  // Total clients
  const { count: totalClients } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  return {
    totalOutstanding,
    overdueAmount,
    paidThisMonth,
    totalClients: totalClients || 0,
  };
}

async function getRecentInvoices(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from("invoices")
    .select("*, clients(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  return data || [];
}

async function getMonthlyRevenue(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  // Get payments for last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data: payments } = await supabase
    .from("payments")
    .select("amount, paid_at, invoice_id, invoices!inner(user_id)")
    .eq("invoices.user_id", userId)
    .gte("paid_at", sixMonthsAgo.toISOString());

  // Group by month
  const monthlyData: Record<string, number> = {};
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyData[key] = 0;
  }

  // Sum payments by month
  payments?.forEach((payment) => {
    const date = new Date(payment.paid_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyData[key] !== undefined) {
      monthlyData[key] += Number(payment.amount);
    }
  });

  // Convert to array for chart
  return Object.entries(monthlyData).map(([key, revenue]) => ({
    month: getMonthName(new Date(key + "-01")),
    revenue,
  }));
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [stats, recentInvoices, monthlyRevenue] = await Promise.all([
    getDashboardStats(supabase, user.id),
    getRecentInvoices(supabase, user.id),
    getMonthlyRevenue(supabase, user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your invoices and payments
        </p>
      </div>

      <StatsCards
        totalOutstanding={stats.totalOutstanding}
        overdueAmount={stats.overdueAmount}
        paidThisMonth={stats.paidThisMonth}
        totalClients={stats.totalClients}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={monthlyRevenue} />

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentInvoicesTable invoices={recentInvoices} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
