"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  CreditCard,
  Calendar,
  TrendingUp,
  Check,
  AlertCircle,
  Crown,
  Zap,
  Building2,
  FileText,
  Users,
  Bell,
  Download,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { SubscriptionPlan, UserSubscription, UsageTracking } from "@/lib/supabase/database.types";

interface BillingPageClientProps {
  subscription: (UserSubscription & { subscription_plans: SubscriptionPlan }) | null;
  plans: SubscriptionPlan[];
  usage: UsageTracking | null;
  userEmail: string;
}

const planIcons: Record<string, React.ReactNode> = {
  starter: <Zap className="h-5 w-5" />,
  professional: <Crown className="h-5 w-5" />,
  enterprise: <Building2 className="h-5 w-5" />,
};

export function BillingPageClient({
  subscription,
  plans,
  usage,
  userEmail,
}: BillingPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCanceling, setIsCanceling] = useState(false);

  const success = searchParams.get("success");
  const error = searchParams.get("error");

  const currentPlan = subscription?.subscription_plans;
  const isTrialing = subscription?.status === "trial";
  const isActive = subscription?.status === "active" || isTrialing;

  const invoicesUsed = usage?.invoices_created || 0;
  const invoiceLimit = currentPlan?.invoice_limit || null;
  const usagePercentage = invoiceLimit ? Math.min(100, (invoicesUsed / invoiceLimit) * 100) : 0;

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end)
    : null;
  const trialEnd = subscription?.trial_ends_at
    ? new Date(subscription.trial_ends_at)
    : null;

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
      });
      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
    }
    setIsCanceling(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and view usage
        </p>
      </div>

      {/* Success/Error Messages */}
      {success === "subscription_activated" && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Check className="h-5 w-5 text-green-600" />
          <p className="text-green-800">
            Your subscription has been activated successfully!
          </p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">
            {error === "payment_failed"
              ? "Payment failed. Please try again."
              : "An error occurred. Please try again."}
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentPlan && planIcons[currentPlan.slug]}
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentPlan ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                    <p className="text-muted-foreground">
                      ${currentPlan.price_usd}/month
                    </p>
                  </div>
                  <Badge
                    variant={isTrialing ? "secondary" : "default"}
                    className={isTrialing ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}
                  >
                    {isTrialing ? "Trial" : "Active"}
                  </Badge>
                </div>

                {isTrialing && trialEnd && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Trial ends on {format(trialEnd, "MMMM d, yyyy")}
                    </p>
                  </div>
                )}

                {!isTrialing && periodEnd && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      {subscription?.cancel_at_period_end
                        ? `Access until ${format(periodEnd, "MMMM d, yyyy")}`
                        : `Renews on ${format(periodEnd, "MMMM d, yyyy")}`}
                    </p>
                  </div>
                )}

                <Separator />

                <div className="flex gap-2">
                  {currentPlan.slug !== "professional" && (
                    <Link href="/subscribe?plan=professional" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FDB750]">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Upgrade to Professional
                      </Button>
                    </Link>
                  )}
                  {currentPlan.slug === "professional" && (
                    <Link href="/enterprise" className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Building2 className="h-4 w-4 mr-2" />
                        Contact for Enterprise
                      </Button>
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No active subscription</p>
                <Link href="/pricing">
                  <Button>View Plans</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Usage This Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Invoices */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Invoices Created</span>
                <span className="font-medium">
                  {invoicesUsed} {invoiceLimit ? `/ ${invoiceLimit}` : "(Unlimited)"}
                </span>
              </div>
              {invoiceLimit && (
                <Progress value={usagePercentage} className="h-2" />
              )}
            </div>

            {/* Reminders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  Reminders Sent
                </span>
                <span className="font-medium">{usage?.reminders_sent || 0}</span>
              </div>
            </div>

            {/* Clients */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Clients Added
                </span>
                <span className="font-medium">{usage?.clients_added || 0}</span>
              </div>
            </div>

            {invoiceLimit && usagePercentage >= 70 && (
              <div className={`p-3 rounded-lg ${usagePercentage >= 90 ? "bg-red-50" : "bg-yellow-50"}`}>
                <p className={`text-sm ${usagePercentage >= 90 ? "text-red-800" : "text-yellow-800"}`}>
                  {usagePercentage >= 90
                    ? "You're almost at your limit! Upgrade for unlimited invoices."
                    : "You're approaching your invoice limit."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Compare Plans</CardTitle>
          <CardDescription>Choose the plan that fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = currentPlan?.id === plan.id;
              const isPopular = plan.slug === "professional";

              return (
                <div
                  key={plan.id}
                  className={`relative p-4 border rounded-lg ${
                    isCurrent
                      ? "border-primary bg-primary/5"
                      : isPopular
                      ? "border-[#FF6B35]"
                      : ""
                  }`}
                >
                  {isPopular && !isCurrent && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF6B35] to-[#FDB750]">
                      Popular
                    </Badge>
                  )}
                  {isCurrent && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                      Current
                    </Badge>
                  )}

                  <div className="text-center mb-4 pt-2">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                      {planIcons[plan.slug]}
                    </div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-2xl font-bold mt-1">
                      {plan.slug === "enterprise" ? "Custom" : `$${plan.price_usd}`}
                      {plan.slug !== "enterprise" && (
                        <span className="text-sm font-normal text-muted-foreground">/mo</span>
                      )}
                    </p>
                  </div>

                  <ul className="space-y-2 text-sm mb-4">
                    {(plan.features as string[]).slice(0, 5).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {!isCurrent && (
                    <Link
                      href={
                        plan.slug === "enterprise"
                          ? "/enterprise"
                          : `/subscribe?plan=${plan.slug}`
                      }
                    >
                      <Button
                        variant={isPopular ? "default" : "outline"}
                        className={`w-full ${isPopular ? "bg-gradient-to-r from-[#FF6B35] to-[#FDB750]" : ""}`}
                        size="sm"
                      >
                        {plan.slug === "enterprise" ? "Contact Sales" : "Upgrade"}
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method & Danger Zone */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription?.paystack_subscription_code ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Card on file</p>
                    <p className="text-sm text-muted-foreground">
                      Managed by Paystack
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <a
                    href="https://dashboard.paystack.com/#/settings/preferences"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage on Paystack
                  </a>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No payment method on file</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        {isActive && !isTrialing && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Cancel your subscription. You'll retain access until the end of your
                billing period.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel? You'll lose access to:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Unlimited invoices</li>
                        <li>Advanced analytics</li>
                        <li>WhatsApp notifications</li>
                        <li>All Professional features</li>
                      </ul>
                      <p className="mt-3">
                        Your subscription will remain active until{" "}
                        {periodEnd ? format(periodEnd, "MMMM d, yyyy") : "the end of your billing period"}.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelSubscription}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isCanceling}
                    >
                      {isCanceling ? "Canceling..." : "Yes, Cancel"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
