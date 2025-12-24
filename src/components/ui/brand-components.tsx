"use client";

import * as React from "react";
import { Zap, CheckCircle, AlertCircle, Send, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// ChapChap Logo Component
export function ChapChapLogo({ 
  className, 
  showText = true,
  size = "default" 
}: { 
  className?: string;
  showText?: boolean;
  size?: "sm" | "default" | "lg";
}) {
  const sizes = {
    sm: { icon: "h-4 w-4", padding: "p-1", text: "text-lg" },
    default: { icon: "h-5 w-5", padding: "p-1.5", text: "text-xl" },
    lg: { icon: "h-6 w-6", padding: "p-2", text: "text-2xl" },
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "bg-gradient-to-br from-[#FF6B35] to-[#FDB750] rounded-lg shadow-md",
        sizes[size].padding
      )}>
        <Zap className={cn("text-white", sizes[size].icon)} />
      </div>
      {showText && (
        <span className={cn("font-display font-bold text-[#1A2332]", sizes[size].text)}>
          ChapChap
        </span>
      )}
    </div>
  );
}

// Status Badge Component
export function StatusBadge({ 
  status, 
  className 
}: { 
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
  className?: string;
}) {
  const config = {
    DRAFT: {
      className: "badge-draft",
      icon: Clock,
      label: "Draft",
    },
    SENT: {
      className: "badge-sent",
      icon: Send,
      label: "Sent",
    },
    PAID: {
      className: "badge-paid",
      icon: CheckCircle,
      label: "Paid",
    },
    OVERDUE: {
      className: "badge-overdue",
      icon: AlertCircle,
      label: "Overdue",
    },
    CANCELLED: {
      className: "bg-gray-100 text-gray-700 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
      icon: AlertCircle,
      label: "Cancelled",
    },
  };

  const { className: badgeClass, icon: Icon, label } = config[status];

  return (
    <span className={cn(badgeClass, className)}>
      <Icon className="w-4 h-4" />
      {label}
    </span>
  );
}

// Spinner Component
export function Spinner({ 
  size = "default",
  className 
}: { 
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "w-5 h-5 border-2",
    default: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div 
      className={cn(
        "border-gray-200 border-t-[#FF6B35] rounded-full animate-spin-fast",
        sizes[size],
        className
      )} 
    />
  );
}

// Loading Button Component
export function LoadingButton({
  children,
  loading = false,
  disabled,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
}) {
  return (
    <button
      className={cn(
        "btn-primary px-6 py-3 rounded-lg font-semibold inline-flex items-center justify-center gap-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" className="border-white/30 border-t-white" />}
      {children}
    </button>
  );
}

// Gradient Card Component
export function GradientCard({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 p-6",
        hover && "card-chapchap",
        className
      )}
    >
      {children}
    </div>
  );
}

// Stats Card Component
export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  className,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendValue?: string;
  className?: string;
}) {
  return (
    <GradientCard className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#44403C] font-medium">{title}</h3>
        <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FDB750] rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-display font-bold text-[#1A2332] font-mono">
        {value}
      </p>
      {trend && trendValue && (
        <p className={cn(
          "text-sm mt-2",
          trend === "up" ? "text-[#2EB872]" : "text-red-500"
        )}>
          {trend === "up" ? "↑" : "↓"} {trendValue}
        </p>
      )}
    </GradientCard>
  );
}

// Feature Icon Component
export function FeatureIcon({
  icon: Icon,
  className,
}: {
  icon: React.ElementType;
  className?: string;
}) {
  return (
    <div className={cn(
      "w-14 h-14 bg-gradient-to-br from-[#FF6B35] to-[#FDB750] rounded-2xl",
      "flex items-center justify-center shadow-lg",
      "group-hover:shadow-orange group-hover:scale-110 group-hover:rotate-3",
      "transition-all duration-300",
      className
    )}>
      <Icon className="h-7 w-7 text-white" />
    </div>
  );
}

// Amount Display Component (with JetBrains Mono)
export function AmountDisplay({
  amount,
  currency = "KES",
  size = "default",
  className,
}: {
  amount: number;
  currency?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const formatted = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);

  const sizes = {
    sm: "text-lg",
    default: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <span className={cn("font-mono font-bold text-[#1A2332]", sizes[size], className)}>
      {formatted}
    </span>
  );
}

// Invoice Number Display
export function InvoiceNumber({
  number,
  className,
}: {
  number: string;
  className?: string;
}) {
  return (
    <span className={cn("font-mono font-medium text-[#1A2332]", className)}>
      {number}
    </span>
  );
}

// Section Heading Component
export function SectionHeading({
  title,
  highlight,
  description,
  className,
}: {
  title: string;
  highlight?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("text-center mb-16", className)}>
      <h2 className="text-3xl sm:text-4xl lg:text-display-sm font-display font-bold mb-6 text-[#1A2332]">
        {title}{" "}
        {highlight && <span className="text-[#FF6B35]">{highlight}</span>}
      </h2>
      {description && (
        <p className="text-xl text-[#44403C] max-w-3xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}

// Animated Counter Component
export function AnimatedCounter({
  value,
  duration = 1000,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const increment = value / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        current = value;
        clearInterval(timer);
      }
      setCount(Math.floor(current));
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span className={cn("font-display font-bold", className)}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}
