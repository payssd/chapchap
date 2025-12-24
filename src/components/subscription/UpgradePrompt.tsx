"use client";

import { useState } from "react";
import Link from "next/link";
import { Crown, Check, X, Zap, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/lib/contexts/SubscriptionContext";
import { FEATURE_REQUIREMENTS } from "@/hooks/usePlanLimits";

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
  reason?: "limit_reached" | "feature_locked" | "trial_ending" | "general";
}

const PROFESSIONAL_FEATURES = [
  "Unlimited invoices",
  "WhatsApp notifications",
  "Recurring invoices",
  "Payment plans",
  "Multi-currency support",
  "Invoice templates",
  "Bulk operations",
  "Expense tracking",
  "PDF generation",
  "Advanced analytics",
  "Priority support",
];

export function UpgradePrompt({
  open,
  onOpenChange,
  feature,
  reason = "general",
}: UpgradePromptProps) {
  const { planSlug, invoicesUsed, invoiceLimit, trialDaysRemaining, isTrialing } = useSubscription();

  const featureInfo = feature ? FEATURE_REQUIREMENTS[feature] : null;
  const targetPlan = featureInfo?.minPlan || "professional";

  const getTitle = () => {
    switch (reason) {
      case "limit_reached":
        return "You've reached your invoice limit";
      case "feature_locked":
        return `Unlock ${featureInfo?.label || "this feature"}`;
      case "trial_ending":
        return "Your trial is ending soon";
      default:
        return "Upgrade to Professional";
    }
  };

  const getDescription = () => {
    switch (reason) {
      case "limit_reached":
        return `You've created ${invoicesUsed} of ${invoiceLimit} invoices this month. Upgrade to Professional for unlimited invoices.`;
      case "feature_locked":
        return featureInfo?.description || "This feature is available on higher plans.";
      case "trial_ending":
        return `Your trial ends in ${trialDaysRemaining} days. Upgrade now to keep all your features.`;
      default:
        return "Get access to all professional features and grow your business faster.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-[#FF6B35] to-[#FDB750] rounded-lg">
              {reason === "limit_reached" ? (
                <Zap className="h-5 w-5 text-white" />
              ) : reason === "feature_locked" ? (
                <Lock className="h-5 w-5 text-white" />
              ) : (
                <Crown className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <DialogTitle>{getTitle()}</DialogTitle>
              <DialogDescription className="mt-1">
                {getDescription()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {/* Current vs Upgrade comparison */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm font-medium text-muted-foreground mb-2">Current Plan</p>
              <p className="font-semibold capitalize">{planSlug || "None"}</p>
              {invoiceLimit && (
                <p className="text-sm text-muted-foreground mt-1">
                  {invoicesUsed}/{invoiceLimit} invoices
                </p>
              )}
            </div>
            <div className="p-4 border-2 border-[#FF6B35] rounded-lg bg-orange-50">
              <p className="text-sm font-medium text-[#FF6B35] mb-2">Recommended</p>
              <p className="font-semibold">Professional</p>
              <p className="text-sm text-muted-foreground mt-1">
                Unlimited invoices
              </p>
            </div>
          </div>

          {/* Features list */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-3">What you'll get:</p>
            <div className="grid grid-cols-2 gap-2">
              {PROFESSIONAL_FEATURES.slice(0, 8).map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">$20</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Cancel anytime. No long-term commitment.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Maybe Later
            </Button>
            <Link href="/subscribe?plan=professional" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FDB750] hover:opacity-90">
                Upgrade Now
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
