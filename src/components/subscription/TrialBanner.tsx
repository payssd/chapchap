"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/lib/contexts/SubscriptionContext";

const BANNER_DISMISSED_KEY = "trial_banner_dismissed_date";

export function TrialBanner() {
  const { isTrialing, trialDaysRemaining, isLoading } = useSubscription();
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Check if banner was dismissed today
    const dismissedDate = localStorage.getItem(BANNER_DISMISSED_KEY);
    const today = new Date().toDateString();
    
    if (dismissedDate !== today) {
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    const today = new Date().toDateString();
    localStorage.setItem(BANNER_DISMISSED_KEY, today);
    setIsDismissed(true);
  };

  // Don't show if not trialing, loading, or dismissed
  if (isLoading || !isTrialing || isDismissed) {
    return null;
  }

  const isUrgent = trialDaysRemaining <= 3;

  return (
    <div
      className={`relative px-4 py-3 ${
        isUrgent
          ? "bg-gradient-to-r from-red-500 to-orange-500"
          : "bg-gradient-to-r from-[#FF6B35] to-[#FDB750]"
      } text-white`}
    >
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isUrgent ? (
            <Clock className="h-5 w-5 animate-pulse" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
          <p className="text-sm font-medium">
            {isUrgent ? (
              <>
                <span className="font-bold">Hurry!</span> Your trial ends in{" "}
                {trialDaysRemaining} {trialDaysRemaining === 1 ? "day" : "days"}.
                Upgrade now to keep all your features.
              </>
            ) : (
              <>
                You&apos;re on a free trial.{" "}
                <span className="font-bold">{trialDaysRemaining} days</span> remaining.
                Upgrade anytime to unlock all features.
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/subscribe?plan=professional">
            <Button
              size="sm"
              variant="secondary"
              className="text-[#FF6B35] font-medium"
            >
              Upgrade Now
            </Button>
          </Link>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
