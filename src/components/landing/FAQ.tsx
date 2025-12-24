"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animations";

const faqs = [
  {
    question: "How does the 14-day free trial work?",
    answer:
      "Sign up and get full access to all features for 14 days. No credit card required. If you love it, subscribe to continue. If not, no worries - your data will be safely stored for 30 days in case you change your mind.",
  },
  {
    question: "What payment methods can my clients use?",
    answer:
      "Through our Payment integration, your clients can pay via M-Pesa, Visa, Mastercard, bank transfer, and other local payment methods. Payments are processed securely and funds are deposited directly to your account.",
  },
  {
    question: "How do the automatic reminders work?",
    answer:
      "You can configure reminders to be sent automatically before the due date (e.g., 3 days before), on the due date, and after the due date (e.g., 3, 7, 14 days after). Reminders can be sent via SMS, Email, or WhatsApp based on your preference.",
  },
  {
    question: "Are there any transaction fees?",
    answer:
      "ChapChap doesn't charge any transaction fees. You only pay the standard Paystack processing fees (1.5% for local cards, 3.9% for international cards). These are deducted by Paystack, not us.",
  },
  {
    question: "Can I customize the reminder messages?",
    answer:
      "Yes! You can customize the content of your reminder messages to match your brand voice. We provide professional templates as a starting point that you can modify.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use Supabase for our database with enterprise-grade security, and all payments are processed through Paystack's PCI-DSS compliant infrastructure. Your data is encrypted at rest and in transit.",
  },
  {
    question: "Can I import my existing clients and invoices?",
    answer:
      "Yes, you can import clients via CSV file. For invoices, you can quickly create them in our system. We're also working on direct import functionality for popular accounting software.",
  },
  {
    question: "What if I need help or have questions?",
    answer:
      "We offer email support for all users. Pro users get priority support with faster response times. We also have a comprehensive help center with guides and tutorials.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about ChapChap
          </p>
        </AnimatedSection>

        <StaggerContainer className="space-y-4" staggerDelay={0.1}>
          {faqs.map((faq, index) => (
            <StaggerItem key={index}>
              <motion.div
                className="border rounded-xl overflow-hidden bg-white"
                whileHover={{ scale: 1.01, boxShadow: "0 10px 40px -15px rgba(0,0,0,0.1)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                >
                  <span className="font-medium">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-4 text-muted-foreground">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
