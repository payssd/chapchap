"use client";

import { Bell, CreditCard, FileText, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animations";

export function Solution() {
  const solutions = [
    {
      icon: Bell,
      title: "Automated Reminders",
      description:
        "SMS, Email & WhatsApp reminders sent automatically before and after due dates",
      color: "blue",
    },
    {
      icon: CreditCard,
      title: "Seamless Payments",
      description:
        "Accept M-Pesa, cards, and bank transfers via Paystack integration",
      color: "green",
    },
    {
      icon: FileText,
      title: "Professional Invoicing",
      description:
        "Create and send beautiful invoices with payment links in seconds",
      color: "purple",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50" style={{ perspective: "1000px" }}>
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-sm font-medium text-green-700 mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle className="h-4 w-4" />
            </motion.div>
            The Solution
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            ChapChap Makes Getting Paid{" "}
            <span className="text-primary">Effortless</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stop chasing payments manually. Let ChapChap handle the follow-ups
            while you focus on growing your business.
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
          {solutions.map((solution, index) => (
            <StaggerItem key={index}>
              <motion.div
                className="relative group"
                whileHover={{ y: -10, rotateY: 3 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl blur-xl"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="relative bg-white p-8 rounded-2xl border shadow-sm">
                  <motion.div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                      solution.color === "blue"
                        ? "bg-blue-100 text-blue-600"
                        : solution.color === "green"
                        ? "bg-green-100 text-green-600"
                        : "bg-purple-100 text-purple-600"
                    }`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <solution.icon className="h-7 w-7" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-3">{solution.title}</h3>
                  <p className="text-muted-foreground">{solution.description}</p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Trust Badges */}
        <AnimatedSection delay={0.4} className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-6">
            Trusted by businesses worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {["TechCorp", "GlobalPay", "StartupHub", "FinanceFirst", "CloudWorks"].map(
              (company, index) => (
                <motion.div
                  key={company}
                  className="text-xl font-bold text-gray-400"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 0.6, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ opacity: 1, scale: 1.1 }}
                  viewport={{ once: true }}
                >
                  {company}
                </motion.div>
              )
            )}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
