"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSubscription } from "@/lib/contexts/SubscriptionContext";
import { getUsageColor, getUsageBgColor } from "@/lib/plan-gates";
import { UpgradePrompt } from "./UpgradePrompt";

interface UsageIndicatorProps {
  compact?: boolean;
  showUpgradeButton?: boolean;
}

export function UsageIndicator({ compact = false, showUpgradeButton = true }: UsageIndicatorProps) {
  const { invoicesUsed, invoiceLimit, usagePercentage, isLoading, planSlug } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-muted rounded w-24"></div>
      </div>
    );
  }

  // Unlimited plan
  if (invoiceLimit === null) {
    if (compact) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="text-green-600 font-medium">Unlimited</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>You have unlimited invoices on your {planSlug} plan</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div className="flex items-center gap-2 text-sm">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-green-600 font-medium">Unlimited invoices</span>
      </div>
    );
  }

  const colorClass = getUsageColor(usagePercentage);
  const bgColorClass = getUsageBgColor(usagePercentage);
  const remaining = invoiceLimit - invoicesUsed;
  const isApproachingLimit = usagePercentage >= 70;
  const isAtLimit = usagePercentage >= 100;

  if (compact) {
    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => isApproachingLimit && setShowUpgrade(true)}
              >
                <FileText className={`h-4 w-4 ${colorClass}`} />
                <span className={`text-sm font-medium ${colorClass}`}>
                  {invoicesUsed}/{invoiceLimit}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isAtLimit
                  ? "You've reached your invoice limit. Upgrade for unlimited invoices."
                  : `${remaining} invoices remaining this month`}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <UpgradePrompt
          open={showUpgrade}
          onOpenChange={setShowUpgrade}
          reason="limit_reached"
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>Invoices this month</span>
          </div>
          <span className={`font-medium ${colorClass}`}>
            {invoicesUsed} / {invoiceLimit}
          </span>
        </div>

        <Progress value={usagePercentage} className="h-2" />

        {isApproachingLimit && (
          <div className="flex items-center justify-between">
            <p className={`text-xs ${colorClass}`}>
              {isAtLimit
                ? "Limit reached! Upgrade for unlimited invoices."
                : `${remaining} invoices remaining`}
            </p>
            {showUpgradeButton && (
              <Button
                size="sm"
                variant="link"
                className="h-auto p-0 text-xs"
                onClick={() => setShowUpgrade(true)}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            )}
          </div>
        )}
      </div>

      <UpgradePrompt
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        reason="limit_reached"
      />
    </>
  );
}
