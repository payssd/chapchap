"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { SubscriptionPlan, UserSubscription, UsageTracking, PlanSlug } from "@/lib/supabase/database.types";

interface SubscriptionData {
  plan: SubscriptionPlan | null;
  subscription: UserSubscription | null;
  usage: UsageTracking | null;
  isLoading: boolean;
  error: string | null;
}

interface SubscriptionContextType extends SubscriptionData {
  // Computed values
  planSlug: PlanSlug | null;
  status: string;
  isTrialing: boolean;
  isActive: boolean;
  isProfessional: boolean;
  isEnterprise: boolean;
  daysRemaining: number;
  trialDaysRemaining: number;
  invoicesUsed: number;
  invoiceLimit: number | null;
  usagePercentage: number;
  
  // Functions
  canCreateInvoice: () => boolean;
  canSendReminder: () => boolean;
  hasFeature: (feature: string) => boolean;
  needsUpgrade: () => boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Feature access map by plan
const PLAN_FEATURES: Record<PlanSlug, string[]> = {
  starter: [
    "invoice_creation",
    "automated_reminders",
    "email_notifications",
    "sms_notifications",
    "paystack_integration",
    "mpesa_integration",
    "client_management",
    "basic_analytics",
  ],
  professional: [
    "invoice_creation",
    "automated_reminders",
    "email_notifications",
    "sms_notifications",
    "paystack_integration",
    "mpesa_integration",
    "client_management",
    "basic_analytics",
    "unlimited_invoices",
    "whatsapp_notifications",
    "advanced_analytics",
    "recurring_invoices",
    "payment_plans",
    "multi_currency",
    "invoice_templates",
    "bulk_operations",
    "expense_tracking",
    "pdf_generation",
    "priority_support",
  ],
  enterprise: [
    "invoice_creation",
    "automated_reminders",
    "email_notifications",
    "sms_notifications",
    "paystack_integration",
    "mpesa_integration",
    "client_management",
    "basic_analytics",
    "unlimited_invoices",
    "whatsapp_notifications",
    "advanced_analytics",
    "recurring_invoices",
    "payment_plans",
    "multi_currency",
    "invoice_templates",
    "bulk_operations",
    "expense_tracking",
    "pdf_generation",
    "priority_support",
    "team_access",
    "role_permissions",
    "client_portal",
    "white_label",
    "custom_domain",
    "api_access",
    "dedicated_support",
    "custom_integrations",
    "sla_guarantee",
  ],
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SubscriptionData>({
    plan: null,
    subscription: null,
    usage: null,
    isLoading: true,
    error: null,
  });

  const fetchSubscription = useCallback(async () => {
    try {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setData({
          plan: null,
          subscription: null,
          usage: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Fetch user's subscription with plan details
      const { data: subscription, error: subError } = await supabase
        .from("user_subscriptions")
        .select("*, subscription_plans(*)")
        .eq("user_id", user.id)
        .in("status", ["active", "trial"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (subError && subError.code !== "PGRST116") {
        throw subError;
      }

      // Fetch usage tracking
      let usage: UsageTracking | null = null;
      if (subscription) {
        const { data: usageData } = await supabase
          .from("usage_tracking")
          .select("*")
          .eq("user_id", user.id)
          .eq("period_start", subscription.current_period_start.split("T")[0])
          .single();
        
        usage = usageData;
      }

      const plan = subscription?.subscription_plans as SubscriptionPlan | null;

      setData({
        plan,
        subscription: subscription ? {
          ...subscription,
          subscription_plans: undefined,
        } as UserSubscription : null,
        usage,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: "Failed to load subscription data",
      }));
    }
  }, []);

  useEffect(() => {
    fetchSubscription();

    // Refresh every 5 minutes
    const interval = setInterval(fetchSubscription, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSubscription]);

  // Computed values
  const planSlug = (data.plan?.slug as PlanSlug) || null;
  const status = data.subscription?.status || "none";
  const isTrialing = status === "trial";
  const isActive = status === "active" || status === "trial";
  const isProfessional = planSlug === "professional" || planSlug === "enterprise";
  const isEnterprise = planSlug === "enterprise";

  const now = new Date();
  const periodEnd = data.subscription?.current_period_end 
    ? new Date(data.subscription.current_period_end) 
    : now;
  const trialEnd = data.subscription?.trial_ends_at 
    ? new Date(data.subscription.trial_ends_at) 
    : now;

  const daysRemaining = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const trialDaysRemaining = isTrialing 
    ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const invoicesUsed = data.usage?.invoices_created || 0;
  const invoiceLimit = data.plan?.invoice_limit || null;
  const usagePercentage = invoiceLimit ? Math.min(100, (invoicesUsed / invoiceLimit) * 100) : 0;

  // Functions
  const canCreateInvoice = useCallback(() => {
    if (!isActive) return false;
    if (invoiceLimit === null) return true; // Unlimited
    return invoicesUsed < invoiceLimit;
  }, [isActive, invoiceLimit, invoicesUsed]);

  const canSendReminder = useCallback(() => {
    return isActive;
  }, [isActive]);

  const hasFeature = useCallback((feature: string) => {
    if (!planSlug) return false;
    return PLAN_FEATURES[planSlug]?.includes(feature) || false;
  }, [planSlug]);

  const needsUpgrade = useCallback(() => {
    if (!isActive) return true;
    if (invoiceLimit !== null && invoicesUsed >= invoiceLimit * 0.8) return true;
    return false;
  }, [isActive, invoiceLimit, invoicesUsed]);

  const value: SubscriptionContextType = {
    ...data,
    planSlug,
    status,
    isTrialing,
    isActive,
    isProfessional,
    isEnterprise,
    daysRemaining,
    trialDaysRemaining,
    invoicesUsed,
    invoiceLimit,
    usagePercentage,
    canCreateInvoice,
    canSendReminder,
    hasFeature,
    needsUpgrade,
    refreshSubscription: fetchSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
