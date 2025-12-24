"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  FileText as Logo,
  BarChart3,
  Mail,
  RefreshCw,
  Receipt,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/lib/contexts/SubscriptionContext";
import { UsageIndicator } from "@/components/subscription/UsageIndicator";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  feature?: string;
  badge?: "pro" | "enterprise";
};

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    name: "Recurring",
    href: "/invoices/recurring",
    icon: RefreshCw,
    feature: "recurring_invoices",
    badge: "pro",
  },
  {
    name: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    name: "Campaigns",
    href: "/campaigns",
    icon: Mail,
    feature: "bulk_operations",
    badge: "pro",
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: Receipt,
    feature: "expense_tracking",
    badge: "pro",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    feature: "advanced_analytics",
    badge: "pro",
  },
  {
    name: "Billing",
    href: "/billing",
    icon: CreditCard,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { hasFeature, invoiceLimit } = useSubscription();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="p-1.5 bg-primary rounded-lg">
          <Logo className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold">ChapChap</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const isLocked = item.feature && !hasFeature(item.feature);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.name}</span>
              {item.badge && isLocked && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded",
                    item.badge === "enterprise"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-orange-100 text-orange-700"
                  )}
                >
                  {item.badge === "enterprise" ? "ENT" : "PRO"}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Usage Indicator */}
      {invoiceLimit !== null && (
        <div className="px-4 py-3 border-t">
          <UsageIndicator compact />
        </div>
      )}

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground text-center">
          © 2024 ChapChap
        </p>
      </div>
    </div>
  );
}
