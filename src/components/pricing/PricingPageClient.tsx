"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Zap,
  Crown,
  Building2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/lib/supabase/database.types";

interface PricingPageClientProps {
  plans: SubscriptionPlan[];
}

const planIcons: Record<string, React.ReactNode> = {
  starter: <Zap className="h-6 w-6" />,
  professional: <Crown className="h-6 w-6" />,
  enterprise: <Building2 className="h-6 w-6" />,
};

const planDescriptions: Record<string, string> = {
  starter: "Perfect for freelancers and small businesses just getting started.",
  professional: "For growing businesses that need advanced features and unlimited invoices.",
  enterprise: "For large teams requiring custom solutions and dedicated support.",
};

// Feature comparison data
const featureCategories = [
  {
    name: "Invoicing",
    features: [
      { name: "Invoice creation", starter: true, professional: true, enterprise: true },
      { name: "Monthly invoice limit", starter: "50", professional: "Unlimited", enterprise: "Unlimited" },
      { name: "Recurring invoices", starter: false, professional: true, enterprise: true },
      { name: "Invoice templates", starter: false, professional: true, enterprise: true },
      { name: "Bulk operations", starter: false, professional: true, enterprise: true },
      { name: "PDF generation", starter: false, professional: true, enterprise: true },
    ],
  },
  {
    name: "Payments",
    features: [
      { name: "Paystack integration", starter: true, professional: true, enterprise: true },
      { name: "M-Pesa integration", starter: true, professional: true, enterprise: true },
      { name: "Multi-currency support", starter: false, professional: true, enterprise: true },
      { name: "Payment plans/installments", starter: false, professional: true, enterprise: true },
    ],
  },
  {
    name: "Notifications",
    features: [
      { name: "Email reminders", starter: true, professional: true, enterprise: true },
      { name: "SMS reminders", starter: true, professional: true, enterprise: true },
      { name: "WhatsApp notifications", starter: false, professional: true, enterprise: true },
      { name: "Automated reminder schedules", starter: true, professional: true, enterprise: true },
    ],
  },
  {
    name: "Analytics & Reporting",
    features: [
      { name: "Basic analytics", starter: true, professional: true, enterprise: true },
      { name: "Advanced analytics", starter: false, professional: true, enterprise: true },
      { name: "Expense tracking", starter: false, professional: true, enterprise: true },
      { name: "Custom reports", starter: false, professional: true, enterprise: true },
    ],
  },
  {
    name: "Team & Collaboration",
    features: [
      { name: "Single user", starter: true, professional: true, enterprise: true },
      { name: "Multi-user access", starter: false, professional: false, enterprise: true },
      { name: "Role-based permissions", starter: false, professional: false, enterprise: true },
      { name: "Client portal", starter: false, professional: false, enterprise: true },
    ],
  },
  {
    name: "Branding & Customization",
    features: [
      { name: "ChapChap branding", starter: true, professional: true, enterprise: false },
      { name: "White-label branding", starter: false, professional: false, enterprise: true },
      { name: "Custom domain", starter: false, professional: false, enterprise: true },
    ],
  },
  {
    name: "Support",
    features: [
      { name: "Email support", starter: true, professional: true, enterprise: true },
      { name: "Priority support", starter: false, professional: true, enterprise: true },
      { name: "Dedicated account manager", starter: false, professional: false, enterprise: true },
      { name: "SLA guarantee", starter: false, professional: false, enterprise: true },
    ],
  },
];

const faqs = [
  {
    question: "How does the 14-day free trial work?",
    answer: "When you sign up, you automatically get a 14-day free trial of the Starter plan. No credit card required. You can upgrade to Professional at any time during or after your trial.",
  },
  {
    question: "Can I change plans later?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at the end of your billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards, M-Pesa, and bank transfers through Paystack. All payments are processed securely.",
  },
  {
    question: "What happens if I exceed my invoice limit?",
    answer: "On the Starter plan, you can create up to 50 invoices per month. If you need more, you can upgrade to Professional for unlimited invoices. We'll notify you when you're approaching your limit.",
  },
  {
    question: "Is there a contract or commitment?",
    answer: "No long-term contracts. All plans are billed monthly and you can cancel anytime. Your subscription will remain active until the end of your billing period.",
  },
  {
    question: "How do I get Enterprise pricing?",
    answer: "Enterprise pricing is customized based on your team size and requirements. Contact our sales team for a personalized quote and demo.",
  },
];

export function PricingPageClient({ plans }: PricingPageClientProps) {
  const [showKES, setShowKES] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const formatPrice = (plan: SubscriptionPlan) => {
    if (plan.slug === "enterprise") {
      return "Custom";
    }
    const price = showKES ? plan.price_kes : plan.price_usd;
    const currency = showKES ? "KES" : "$";
    const formattedPrice = showKES 
      ? price.toLocaleString() 
      : price.toFixed(0);
    return `${currency}${formattedPrice}`;
  };

  const starterPlan = plans.find(p => p.slug === "starter");
  const professionalPlan = plans.find(p => p.slug === "professional");
  const enterprisePlan = plans.find(p => p.slug === "enterprise");

  return (
    <div className="py-16">
      {/* Hero Section */}
      <div className="container mx-auto px-4 text-center mb-16">
        <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-100">
          Simple Pricing
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-[#1A2332] mb-4">
          Choose the plan that&apos;s right for you
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Start with a 14-day free trial. No credit card required. 
          Upgrade anytime as your business grows.
        </p>

        {/* Currency Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={cn("text-sm font-medium", !showKES && "text-[#FF6B35]")}>
            USD
          </span>
          <Switch
            checked={showKES}
            onCheckedChange={setShowKES}
            className="data-[state=checked]:bg-[#FF6B35]"
          />
          <span className={cn("text-sm font-medium", showKES && "text-[#FF6B35]")}>
            KES
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 mb-20">
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {/* Starter Plan */}
          {starterPlan && (
            <Card className="relative hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  {planIcons.starter}
                </div>
                <h3 className="text-2xl font-bold">{starterPlan.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {planDescriptions.starter}
                </p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold">{formatPrice(starterPlan)}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <Link href="/signup?plan=starter">
                  <Button variant="outline" className="w-full mb-6">
                    Start Free Trial
                  </Button>
                </Link>
                <ul className="space-y-3 text-left">
                  {(starterPlan.features as string[]).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Professional Plan - Most Popular */}
          {professionalPlan && (
            <Card className="relative hover:shadow-xl transition-shadow border-2 border-[#FF6B35] bg-gradient-to-b from-orange-50/50 to-white">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-[#FF6B35] to-[#FDB750] text-white px-4 py-1">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-4 pt-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FDB750] flex items-center justify-center text-white">
                  {planIcons.professional}
                </div>
                <h3 className="text-2xl font-bold">{professionalPlan.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {planDescriptions.professional}
                </p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold">{formatPrice(professionalPlan)}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <Link href="/signup?plan=professional">
                  <Button className="w-full mb-6 bg-gradient-to-r from-[#FF6B35] to-[#FDB750] hover:opacity-90">
                    Start Free Trial
                  </Button>
                </Link>
                <ul className="space-y-3 text-left">
                  {(professionalPlan.features as string[]).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Enterprise Plan */}
          {enterprisePlan && (
            <Card className="relative hover:shadow-lg transition-shadow bg-[#1A2332] text-white">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  {planIcons.enterprise}
                </div>
                <h3 className="text-2xl font-bold">{enterprisePlan.name}</h3>
                <p className="text-sm text-gray-400 mt-2">
                  {planDescriptions.enterprise}
                </p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold">{formatPrice(enterprisePlan)}</span>
                </div>
                <Link href="/enterprise">
                  <Button variant="secondary" className="w-full mb-6">
                    Contact Sales
                  </Button>
                </Link>
                <ul className="space-y-3 text-left">
                  {(enterprisePlan.features as string[]).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="container mx-auto px-4 mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Compare Plans</h2>
        <div className="max-w-5xl mx-auto overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4 font-semibold">Features</th>
                <th className="text-center py-4 px-4 font-semibold">Starter</th>
                <th className="text-center py-4 px-4 font-semibold text-[#FF6B35]">Professional</th>
                <th className="text-center py-4 px-4 font-semibold">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {featureCategories.map((category) => (
                <React.Fragment key={category.name}>
                  <tr className="bg-muted/50">
                    <td colSpan={4} className="py-3 px-4 font-semibold text-sm">
                      {category.name}
                    </td>
                  </tr>
                  {category.features.map((feature) => (
                    <tr key={feature.name} className="border-b">
                      <td className="py-3 px-4 text-sm">{feature.name}</td>
                      <td className="py-3 px-4 text-center">
                        {typeof feature.starter === "boolean" ? (
                          feature.starter ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm">{feature.starter}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center bg-orange-50/50">
                        {typeof feature.professional === "boolean" ? (
                          feature.professional ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm font-medium">{feature.professional}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {typeof feature.enterprise === "boolean" ? (
                          feature.enterprise ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm">{feature.enterprise}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border rounded-lg overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <span className="font-medium">{faq.question}</span>
                {expandedFaq === index ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="px-4 pb-4 text-muted-foreground">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#FF6B35] to-[#FDB750] rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to get paid faster?</h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of businesses using ChapChap to automate their invoice reminders.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-[#FF6B35]">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
