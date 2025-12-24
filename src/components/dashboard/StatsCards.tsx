import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertTriangle, CheckCircle, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

interface StatsCardsProps {
  totalOutstanding: number;
  overdueAmount: number;
  paidThisMonth: number;
  totalClients: number;
}

export function StatsCards({
  totalOutstanding,
  overdueAmount,
  paidThisMonth,
  totalClients,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Outstanding",
      value: formatCurrency(totalOutstanding),
      icon: DollarSign,
      description: "Unpaid invoices",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Overdue Amount",
      value: formatCurrency(overdueAmount),
      icon: AlertTriangle,
      description: "Past due date",
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    {
      title: "Paid This Month",
      value: formatCurrency(paidThisMonth),
      icon: CheckCircle,
      description: "Collected payments",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Total Clients",
      value: totalClients.toString(),
      icon: Users,
      description: "Active clients",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
