"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Mail,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils/format";
import {
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  format,
  differenceInDays,
  parseISO,
  isWithinInterval,
} from "date-fns";
import type { Invoice, Payment, Reminder, Client, Expense } from "@/lib/supabase/database.types";

interface AnalyticsDashboardProps {
  invoices: (Invoice & { clients: { name: string } | null })[];
  payments: Payment[];
  reminders: (Reminder & { invoices: { user_id: string; status: string } })[];
  clients: Client[];
  expenses: Expense[];
}

const COLORS = ["#FF6B35", "#FDB750", "#4ECDC4", "#2EB872", "#1A2332", "#64748B"];

type DateRange = "7" | "30" | "90" | "365" | "all";

export function AnalyticsDashboard({
  invoices,
  payments,
  reminders,
  clients,
  expenses,
}: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange>("30");

  const dateFilter = useMemo(() => {
    if (dateRange === "all") return null;
    return subDays(new Date(), parseInt(dateRange));
  }, [dateRange]);

  const filteredInvoices = useMemo(() => {
    if (!dateFilter) return invoices;
    return invoices.filter((inv) => new Date(inv.created_at) >= dateFilter);
  }, [invoices, dateFilter]);

  const filteredPayments = useMemo(() => {
    if (!dateFilter) return payments;
    return payments.filter((p) => new Date(p.paid_at) >= dateFilter);
  }, [payments, dateFilter]);

  const filteredExpenses = useMemo(() => {
    if (!dateFilter) return expenses;
    return expenses.filter((e) => new Date(e.date) >= dateFilter);
  }, [expenses, dateFilter]);

  // Calculate key metrics
  const totalRevenue = filteredInvoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalOutstanding = filteredInvoices
    .filter((inv) => inv.status === "SENT" || inv.status === "OVERDUE")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalOverdue = filteredInvoices
    .filter((inv) => inv.status === "OVERDUE")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const paidInvoices = filteredInvoices.filter((inv) => inv.status === "PAID");
  const avgDaysToPayment = paidInvoices.length > 0
    ? paidInvoices.reduce((sum, inv) => {
        if (inv.paid_at) {
          return sum + differenceInDays(new Date(inv.paid_at), new Date(inv.created_at));
        }
        return sum;
      }, 0) / paidInvoices.length
    : 0;

  const paymentSuccessRate = filteredInvoices.length > 0
    ? (paidInvoices.length / filteredInvoices.length) * 100
    : 0;

  const overdueRate = filteredInvoices.length > 0
    ? (filteredInvoices.filter((inv) => inv.status === "OVERDUE").length / filteredInvoices.length) * 100
    : 0;

  // Monthly revenue data for line chart
  const monthlyRevenueData = useMemo(() => {
    const months: { [key: string]: number } = {};
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(now, i);
      const key = format(date, "MMM yyyy");
      months[key] = 0;
    }

    invoices
      .filter((inv) => inv.status === "PAID" && inv.paid_at)
      .forEach((inv) => {
        const key = format(new Date(inv.paid_at!), "MMM yyyy");
        if (months[key] !== undefined) {
          months[key] += inv.amount;
        }
      });

    return Object.entries(months).map(([month, revenue]) => ({
      month,
      revenue,
    }));
  }, [invoices]);

  // Revenue by client (top 10)
  const revenueByClient = useMemo(() => {
    const clientRevenue: { [key: string]: number } = {};

    filteredInvoices
      .filter((inv) => inv.status === "PAID")
      .forEach((inv) => {
        const clientName = inv.clients?.name || "Unknown";
        clientRevenue[clientName] = (clientRevenue[clientName] || 0) + inv.amount;
      });

    return Object.entries(clientRevenue)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredInvoices]);

  // Invoice status distribution
  const statusDistribution = useMemo(() => {
    const distribution: { [key: string]: number } = {
      PAID: 0,
      SENT: 0,
      DRAFT: 0,
      OVERDUE: 0,
      CANCELLED: 0,
    };

    filteredInvoices.forEach((inv) => {
      distribution[inv.status]++;
    });

    return Object.entries(distribution)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({ status, count }));
  }, [filteredInvoices]);

  // Reminder effectiveness
  const reminderStats = useMemo(() => {
    const sentReminders = reminders.filter((r) => r.status === "SENT");
    const emailReminders = sentReminders.filter((r) => r.reminder_type === "EMAIL");
    const smsReminders = sentReminders.filter((r) => r.reminder_type === "SMS");

    const emailPaidAfter = emailReminders.filter(
      (r) => r.invoices?.status === "PAID"
    ).length;
    const smsPaidAfter = smsReminders.filter(
      (r) => r.invoices?.status === "PAID"
    ).length;

    return {
      totalSent: sentReminders.length,
      emailSent: emailReminders.length,
      smsSent: smsReminders.length,
      emailEffectiveness: emailReminders.length > 0 ? (emailPaidAfter / emailReminders.length) * 100 : 0,
      smsEffectiveness: smsReminders.length > 0 ? (smsPaidAfter / smsReminders.length) * 100 : 0,
    };
  }, [reminders]);

  // Top clients by value
  const topClients = useMemo(() => {
    const clientStats: { [key: string]: { revenue: number; invoices: number; overdue: number } } = {};

    invoices.forEach((inv) => {
      const clientName = inv.clients?.name || "Unknown";
      if (!clientStats[clientName]) {
        clientStats[clientName] = { revenue: 0, invoices: 0, overdue: 0 };
      }
      clientStats[clientName].invoices++;
      if (inv.status === "PAID") {
        clientStats[clientName].revenue += inv.amount;
      }
      if (inv.status === "OVERDUE") {
        clientStats[clientName].overdue++;
      }
    });

    return Object.entries(clientStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [invoices]);

  // New clients this month
  const newClientsThisMonth = clients.filter((client) => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return isWithinInterval(new Date(client.created_at), { start, end });
  }).length;

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex justify-end">
        <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {paidInvoices.length} paid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totalOutstanding)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(totalOverdue)} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Days to Payment
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgDaysToPayment.toFixed(1)} days
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {paymentSuccessRate.toFixed(0)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Profit
            </CardTitle>
            {netProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue - Expenses
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          {/* Revenue Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#FF6B35"
                        strokeWidth={2}
                        dot={{ fill: "#FF6B35", strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="status"
                        label={({ status, count }) => `${status}: ${count}`}
                      >
                        {statusDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by Client */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Client (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByClient} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="revenue" fill="#FF6B35" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          {/* Client Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Clients
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clients.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  New This Month
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{newClientsThisMonth}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Late Payment Rate
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overdueRate.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Top Clients Table */}
          <Card>
            <CardHeader>
              <CardTitle>Most Valuable Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topClients.map((client, index) => (
                  <div
                    key={client.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.invoices} invoices
                          {client.overdue > 0 && (
                            <span className="text-red-500 ml-2">
                              ({client.overdue} overdue)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(client.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
                {topClients.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No client data available yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6">
          {/* Reminder Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Sent
                </CardTitle>
                <Mail className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reminderStats.totalSent}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Email Reminders
                </CardTitle>
                <Mail className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reminderStats.emailSent}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {reminderStats.emailEffectiveness.toFixed(0)}% led to payment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  SMS Reminders
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reminderStats.smsSent}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {reminderStats.smsEffectiveness.toFixed(0)}% led to payment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Overall Effectiveness
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reminderStats.totalSent > 0
                    ? (
                        ((reminderStats.emailEffectiveness * reminderStats.emailSent +
                          reminderStats.smsEffectiveness * reminderStats.smsSent) /
                          (reminderStats.emailSent + reminderStats.smsSent || 1))
                      ).toFixed(0)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Reminders leading to payment
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Reminder Effectiveness Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Reminder Channel Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        channel: "Email",
                        sent: reminderStats.emailSent,
                        effectiveness: reminderStats.emailEffectiveness,
                      },
                      {
                        channel: "SMS",
                        sent: reminderStats.smsSent,
                        effectiveness: reminderStats.smsEffectiveness,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="channel" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="sent" name="Reminders Sent" fill="#FF6B35" radius={[4, 4, 0, 0]} />
                    <Bar
                      dataKey="effectiveness"
                      name="Effectiveness %"
                      fill="#2EB872"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
