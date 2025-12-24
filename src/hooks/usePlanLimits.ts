"use client";

import { useSubscription } from "@/lib/contexts/SubscriptionContext";

// Feature definitions with plan requirements
export const FEATURE_REQUIREMENTS: Record<string, { minPlan: string; label: string; description: string }> = {
  unlimited_invoices: {
    minPlan: "professional",
    label: "Unlimited Invoices",
    description: "Create unlimited invoices each month",
  },
  whatsapp_notifications: {
    minPlan: "professional",
    label: "WhatsApp Notifications",
    description: "Send invoice reminders via WhatsApp",
  },
  recurring_invoices: {
    minPlan: "professional",
    label: "Recurring Invoices",
    description: "Set up automatic recurring invoices",
  },
  payment_plans: {
    minPlan: "professional",
    label: "Payment Plans",
    description: "Split invoices into installments",
  },
  multi_currency: {
    minPlan: "professional",
    label: "Multi-Currency",
    description: "Invoice in multiple currencies",
  },
  invoice_templates: {
    minPlan: "professional",
    label: "Invoice Templates",
    description: "Choose from multiple invoice designs",
  },
  bulk_operations: {
    minPlan: "professional",
    label: "Bulk Operations",
    description: "Perform actions on multiple invoices at once",
  },
  expense_tracking: {
    minPlan: "professional",
    label: "Expense Tracking",
    description: "Track and categorize business expenses",
  },
  pdf_generation: {
    minPlan: "professional",
    label: "PDF Generation",
    description: "Download invoices as PDF files",
  },
  advanced_analytics: {
    minPlan: "professional",
    label: "Advanced Analytics",
    description: "Detailed revenue and payment insights",
  },
  team_access: {
    minPlan: "enterprise",
    label: "Team Access",
    description: "Invite team members to your account",
  },
  role_permissions: {
    minPlan: "enterprise",
    label: "Role Permissions",
    description: "Set different access levels for team members",
  },
  client_portal: {
    minPlan: "enterprise",
    label: "Client Portal",
    description: "Give clients access to view their invoices",
  },
  white_label: {
    minPlan: "enterprise",
    label: "White-Label Branding",
    description: "Remove ChapChap branding from invoices",
  },
  custom_domain: {
    minPlan: "enterprise",
    label: "Custom Domain",
    description: "Use your own domain for client portal",
  },
  api_access: {
    minPlan: "enterprise",
    label: "API Access",
    description: "Integrate with your own systems via API",
  },
};

export function usePlanLimits() {
  const subscription = useSubscription();

  const checkFeatureAccess = (feature: string): boolean => {
    return subscription.hasFeature(feature);
  };

  const getFeatureInfo = (feature: string) => {
    return FEATURE_REQUIREMENTS[feature] || null;
  };

  const getUpgradePlan = (feature: string): string | null => {
    const requirement = FEATURE_REQUIREMENTS[feature];
    if (!requirement) return null;
    
    if (requirement.minPlan === "professional" && !subscription.isProfessional) {
      return "professional";
    }
    if (requirement.minPlan === "enterprise" && !subscription.isEnterprise) {
      return "enterprise";
    }
    return null;
  };

  const getUsageStatus = () => {
    const { invoicesUsed, invoiceLimit, usagePercentage } = subscription;
    
    let status: "normal" | "warning" | "critical" = "normal";
    if (usagePercentage >= 90) {
      status = "critical";
    } else if (usagePercentage >= 70) {
      status = "warning";
    }

    return {
      invoicesUsed,
      invoiceLimit,
      usagePercentage,
      status,
      remaining: invoiceLimit ? invoiceLimit - invoicesUsed : null,
      isUnlimited: invoiceLimit === null,
    };
  };

  return {
    ...subscription,
    checkFeatureAccess,
    getFeatureInfo,
    getUpgradePlan,
    getUsageStatus,
  };
}
