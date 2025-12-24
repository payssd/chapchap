"use client";

import { useState, ReactNode } from "react";
import { Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSubscription } from "@/lib/contexts/SubscriptionContext";
import { FEATURE_REQUIREMENTS } from "@/hooks/usePlanLimits";
import { UpgradePrompt } from "./UpgradePrompt";

interface FeatureLockProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showLockIcon?: boolean;
  className?: string;
}

export function FeatureLock({
  feature,
  children,
  fallback,
  showLockIcon = true,
  className = "",
}: FeatureLockProps) {
  const { hasFeature } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const featureInfo = FEATURE_REQUIREMENTS[feature];
  const hasAccess = hasFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  const planLabel = featureInfo?.minPlan === "enterprise" ? "Enterprise" : "Professional";

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`relative cursor-pointer ${className}`}
              onClick={() => setShowUpgrade(true)}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] rounded-lg z-10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-center p-4">
                  {showLockIcon && (
                    <div className="p-2 bg-muted rounded-full">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <p className="text-sm font-medium text-muted-foreground">
                    {planLabel} Feature
                  </p>
                  <Button size="sm" variant="outline" className="mt-1">
                    <Crown className="h-4 w-4 mr-1" />
                    Upgrade
                  </Button>
                </div>
              </div>
              {/* Blurred content */}
              <div className="opacity-50 pointer-events-none select-none">
                {children}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {featureInfo?.label || "This feature"} is available on {planLabel} plan
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <UpgradePrompt
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        feature={feature}
        reason="feature_locked"
      />
    </>
  );
}

// Simple badge to show on menu items
export function ProBadge({ plan = "professional" }: { plan?: "professional" | "enterprise" }) {
  return (
    <span
      className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${
        plan === "enterprise"
          ? "bg-purple-100 text-purple-700"
          : "bg-orange-100 text-orange-700"
      }`}
    >
      {plan === "enterprise" ? "ENT" : "PRO"}
    </span>
  );
}
