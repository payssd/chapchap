"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap, Crown, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AnimatedSection, StaggerContainer, StaggerItem, AnimatedCard } from "@/components/ui/animations";

const plans = [
  {
    name: "Starter",
    slug: "starter",
    description: "Perfect for freelancers and small businesses",
    priceUSD: 10,
    priceKES: 1300,
    icon: Zap,
    popular: false,
    features: [
      "Up to 50 invoices/month",
      "Automated reminders",
      "Email & SMS notifications",
      "Paystack integration",
      "Client management",
      "Basic analytics",
      "14-day free trial",
    ],
    cta: "Start Free Trial",
    href: "/signup?plan=starter",
  },
  {
    name: "Professional",
    slug: "professional",
    description: "For growing businesses that need more",
    priceUSD: 20,
    priceKES: 2600,
    icon: Crown,
    popular: true,
    features: [
      "Unlimited invoices",
      "All Starter features",
      "WhatsApp notifications",
      "Advanced analytics",
      "Recurring invoices",
      "Payment plans/installments",
      "Multi-currency support",
      "Invoice templates",
      "Bulk operations",
      "Expense tracking",
      "PDF generation",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/signup?plan=professional",
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    description: "Custom solutions for large teams",
    priceUSD: null,
    priceKES: null,
    icon: Building2,
    popular: false,
    features: [
      "All Professional features",
      "Multi-user/team access",
      "Role-based permissions",
      "Client portal",
      "White-label branding",
      "Custom domain",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    href: "/enterprise",
  },
];

export function Pricing() {
  const [showKES, setShowKES] = useState(false);

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]" style={{ perspective: "1000px" }}>
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-display-sm font-display font-bold mb-6 text-[#1A2332]">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-[#44403C] max-w-3xl mx-auto mb-8">
            Choose the plan that fits your business. Start with a 14-day free trial.
          </p>

          {/* Currency Toggle */}
          <motion.div 
            className="flex items-center justify-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
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
          </motion.div>
        </AnimatedSection>

        {/* Pricing Cards */}
        <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto" staggerDelay={0.15}>
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = showKES ? plan.priceKES : plan.priceUSD;
            const currency = showKES ? "KES " : "$";

            return (
              <StaggerItem key={plan.slug}>
                <motion.div
                  className={cn(
                    "relative bg-white rounded-2xl shadow-lg overflow-hidden",
                    plan.popular && "border-2 border-[#FF6B35] scale-105 z-10"
                  )}
                  whileHover={{ 
                    y: -10, 
                    rotateY: 2,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#FF6B35] to-[#FDB750] text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}

                <div className={cn("p-8", plan.popular && "pt-14")}>
                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        plan.popular
                          ? "bg-gradient-to-br from-[#FF6B35] to-[#FDB750] text-white"
                          : plan.slug === "enterprise"
                          ? "bg-[#1A2332] text-white"
                          : "bg-blue-100 text-blue-600"
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-[#1A2332]">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-[#44403C]">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {price !== null ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-display font-bold text-[#1A2332]">
                          {currency}{price.toLocaleString()}
                        </span>
                        <span className="text-[#44403C]">/month</span>
                      </div>
                    ) : (
                      <div className="text-4xl font-display font-bold text-[#1A2332]">
                        Custom
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-[#2EB872]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-[#2EB872]" />
                        </div>
                        <span className="text-sm text-[#1A2332]">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link href={plan.href}>
                    <Button
                      size="lg"
                      className={cn(
                        "w-full font-display font-semibold",
                        plan.popular
                          ? "bg-gradient-to-r from-[#FF6B35] to-[#FDB750] hover:opacity-90 text-white"
                          : plan.slug === "enterprise"
                          ? "bg-[#1A2332] hover:bg-[#1A2332]/90 text-white"
                          : "bg-white border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white"
                      )}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Money Back Guarantee */}
        <AnimatedSection delay={0.5} className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#2EB872]/10 rounded-full">
            <div className="w-10 h-10 bg-[#2EB872]/20 rounded-full flex items-center justify-center">
              <Check className="h-5 w-5 text-[#2EB872]" />
            </div>
            <div className="text-left">
              <p className="font-display font-semibold text-[#2EB872]">
                14-Day Free Trial on All Plans
              </p>
              <p className="text-sm text-[#2EB872]/80">
                No credit card required. Cancel anytime.
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* View Full Comparison Link */}
        <AnimatedSection delay={0.6} className="mt-8 text-center">
          <motion.div
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="inline-block"
          >
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-[#FF6B35] hover:text-[#FF6B35]/80 font-medium transition-colors"
            >
              View full plan comparison
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}
