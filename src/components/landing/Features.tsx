"use client";

import {
  Bell,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Users,
  BarChart3,
  Shield,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animations";

export function Features() {
  const features = [
    {
      icon: Bell,
      title: "Auto-Reminders",
      description:
        "Automatic reminders sent 3 days before, on due date, and 3, 7, 14 days after",
    },
    {
      icon: CreditCard,
      title: "Instant Payment Links",
      description:
        "One-click payment via M-Pesa, cards, or bank transfer through Paystack",
    },
    {
      icon: LayoutDashboard,
      title: "Unified Dashboard",
      description:
        "Track all invoices, payments, and client activity in one place",
    },
    {
      icon: MessageSquare,
      title: "Multi-Channel Notifications",
      description:
        "Reach clients via SMS, Email, or WhatsApp - their preference",
    },
    {
      icon: Users,
      title: "Client Management",
      description:
        "Store client details, track payment history, and manage relationships",
    },
    {
      icon: BarChart3,
      title: "Payment Analytics",
      description:
        "Insights on payment patterns, outstanding amounts, and cash flow",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description:
        "Bank-level security with Supabase and Paystack infrastructure",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Create and send invoices in under 30 seconds with our streamlined flow",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-soft" style={{ perspective: "1000px" }}>
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-display-sm font-display font-bold mb-6 text-[#1A2332]">
            Everything You Need to{" "}
            <span className="text-[#FF6B35]">Get Paid Faster</span>
          </h2>
          <p className="text-xl text-[#44403C] max-w-3xl mx-auto">
            Powerful features designed specifically for businesses worldwide to
            streamline invoicing and payment collection.
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.08}>
          {features.map((feature, index) => (
            <StaggerItem key={index}>
              <motion.div
                className="group p-6 rounded-2xl border border-gray-200 bg-white h-full"
                whileHover={{ 
                  y: -8, 
                  rotateY: 3,
                  boxShadow: "0 20px 40px -15px rgba(255, 107, 53, 0.3)",
                  borderColor: "rgba(255, 107, 53, 0.5)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div 
                  className="w-14 h-14 bg-gradient-to-br from-[#FF6B35] to-[#FDB750] rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </motion.div>
                <h3 className="text-lg font-display font-semibold mb-2 text-[#1A2332]">{feature.title}</h3>
                <p className="text-sm text-[#44403C]">
                  {feature.description}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
