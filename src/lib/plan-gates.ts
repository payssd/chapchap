import type { PlanSlug } from "@/lib/supabase/database.types";

// Feature access configuration
export const FEATURE_ACCESS: Record<string, PlanSlug[]> = {
  // Starter features (available to all)
  invoice_creation: ["starter", "professional", "enterprise"],
  automated_reminders: ["starter", "professional", "enterprise"],
  email_notifications: ["starter", "professional", "enterprise"],
  sms_notifications: ["starter", "professional", "enterprise"],
  paystack_integration: ["starter", "professional", "enterprise"],
  mpesa_integration: ["starter", "professional", "enterprise"],
  client_management: ["starter", "professional", "enterprise"],
  basic_analytics: ["starter", "professional", "enterprise"],

  // Professional features
  unlimited_invoices: ["professional", "enterprise"],
  whatsapp_notifications: ["professional", "enterprise"],
  advanced_analytics: ["professional", "enterprise"],
  recurring_invoices: ["professional", "enterprise"],
  payment_plans: ["professional", "enterprise"],
  multi_currency: ["professional", "enterprise"],
  invoice_templates: ["professional", "enterprise"],
  bulk_operations: ["professional", "enterprise"],
  expense_tracking: ["professional", "enterprise"],
  pdf_generation: ["professional", "enterprise"],
  priority_support: ["professional", "enterprise"],

  // Enterprise features
  team_access: ["enterprise"],
  role_permissions: ["enterprise"],
  client_portal: ["enterprise"],
  white_label: ["enterprise"],
  custom_domain: ["enterprise"],
  api_access: ["enterprise"],
  dedicated_support: ["enterprise"],
  custom_integrations: ["enterprise"],
  sla_guarantee: ["enterprise"],
};

/**
 * Check if a user's plan has access to a specific feature
 */
export function checkFeatureAccess(feature: string, userPlan: PlanSlug | null): boolean {
  if (!userPlan) return false;
  const allowedPlans = FEATURE_ACCESS[feature];
  if (!allowedPlans) return false;
  return allowedPlans.includes(userPlan);
}

/**
 * Get the minimum plan required for a feature
 */
export function getMinimumPlan(feature: string): PlanSlug | null {
  const allowedPlans = FEATURE_ACCESS[feature];
  if (!allowedPlans || allowedPlans.length === 0) return null;
  
  // Return the lowest tier plan that has access
  if (allowedPlans.includes("starter")) return "starter";
  if (allowedPlans.includes("professional")) return "professional";
  if (allowedPlans.includes("enterprise")) return "enterprise";
  
  return null;
}

/**
 * Get all features available for a plan
 */
export function getPlanFeatures(plan: PlanSlug): string[] {
  return Object.entries(FEATURE_ACCESS)
    .filter(([_, plans]) => plans.includes(plan))
    .map(([feature]) => feature);
}

/**
 * Get features that would be unlocked by upgrading to a new plan
 */
export function getUpgradeFeatures(currentPlan: PlanSlug | null, targetPlan: PlanSlug): string[] {
  const currentFeatures = currentPlan ? getPlanFeatures(currentPlan) : [];
  const targetFeatures = getPlanFeatures(targetPlan);
  
  return targetFeatures.filter(feature => !currentFeatures.includes(feature));
}

/**
 * Check if user can create an invoice based on their plan limits
 */
export function canCreateInvoice(
  userPlan: PlanSlug | null,
  invoicesCreated: number,
  invoiceLimit: number | null
): { allowed: boolean; reason?: string } {
  if (!userPlan) {
    return { allowed: false, reason: "No active subscription" };
  }

  // Unlimited invoices for professional and enterprise
  if (invoiceLimit === null) {
    return { allowed: true };
  }

  if (invoicesCreated >= invoiceLimit) {
    return {
      allowed: false,
      reason: `You've reached your limit of ${invoiceLimit} invoices this month. Upgrade to Professional for unlimited invoices.`,
    };
  }

  return { allowed: true };
}

/**
 * Get usage warning level
 */
export function getUsageWarningLevel(
  invoicesCreated: number,
  invoiceLimit: number | null
): "none" | "approaching" | "critical" | "exceeded" {
  if (invoiceLimit === null) return "none";
  
  const percentage = (invoicesCreated / invoiceLimit) * 100;
  
  if (percentage >= 100) return "exceeded";
  if (percentage >= 90) return "critical";
  if (percentage >= 70) return "approaching";
  
  return "none";
}

/**
 * Get usage color based on percentage
 */
export function getUsageColor(percentage: number): string {
  if (percentage >= 90) return "text-red-500";
  if (percentage >= 70) return "text-yellow-500";
  return "text-green-500";
}

/**
 * Get usage background color based on percentage
 */
export function getUsageBgColor(percentage: number): string {
  if (percentage >= 90) return "bg-red-500";
  if (percentage >= 70) return "bg-yellow-500";
  return "bg-green-500";
}
