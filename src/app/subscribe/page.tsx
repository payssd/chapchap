"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Check, Shield, CreditCard, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

const PLAN_DETAILS = {
  starter: {
    name: "Starter",
    price: "$10",
    priceKES: "KES 1,300",
    features: [
      "Up to 50 invoices/month",
      "Automated reminders",
      "Email & SMS notifications",
      "Paystack integration",
      "Client management",
      "Basic analytics",
    ],
  },
  professional: {
    name: "Professional",
    price: "$20",
    priceKES: "KES 2,600",
    features: [
      "Unlimited invoices",
      "All Starter features",
      "WhatsApp notifications",
      "Advanced analytics",
      "Recurring invoices",
      "Payment plans",
      "Multi-currency support",
      "Invoice templates",
      "Bulk operations",
      "PDF generation",
      "Priority support",
    ],
  },
};

export default function SubscribePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  const planSlug = searchParams.get("plan") || "professional";
  const plan = PLAN_DETAILS[planSlug as keyof typeof PLAN_DETAILS] || PLAN_DETAILS.professional;

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?redirect=/subscribe?plan=" + planSlug);
        return;
      }
      setUser({ id: user.id, email: user.email || "" });
    }
    getUser();
  }, [router, planSlug]);

  const handleSubscribe = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

      // Redirect to Paystack payment page
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href="/billing"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Billing
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Details */}
          <Card>
            <CardHeader>
              <Badge className="w-fit mb-2 bg-gradient-to-r from-[#FF6B35] to-[#FDB750] text-white">
                {plan.name} Plan
              </Badge>
              <CardTitle className="text-3xl">
                {plan.price}
                <span className="text-lg font-normal text-muted-foreground">/month</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{plan.priceKES}/month</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Everything you need to manage invoices and get paid faster.
              </p>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Subscribing as</p>
                <p className="font-medium">{user.email}</p>
              </div>

              {/* Order Summary */}
              <div className="space-y-3">
                <h4 className="font-medium">Order Summary</h4>
                <div className="flex justify-between text-sm">
                  <span>{plan.name} Plan (Monthly)</span>
                  <span>{plan.price}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-medium">
                  <span>Total</span>
                  <span>{plan.price}/month</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Subscribe Button */}
              <Button
                className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FDB750] hover:opacity-90"
                size="lg"
                onClick={handleSubscribe}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscribe Now
                  </>
                )}
              </Button>

              {/* Security Note */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure payment powered by Paystack</span>
              </div>

              {/* Terms */}
              <p className="text-xs text-center text-muted-foreground">
                By subscribing, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-foreground">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-foreground">
                  Privacy Policy
                </Link>
                . You can cancel anytime.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
