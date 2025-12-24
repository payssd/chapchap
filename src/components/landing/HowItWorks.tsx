"use client";

import { FileText, Send, Bell, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animations";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: FileText,
      title: "Create Invoice",
      description:
        "Add client details, amount, and due date. Invoice number generated automatically.",
    },
    {
      number: "02",
      icon: Send,
      title: "Send Payment Link",
      description:
        "One-click to send invoice with Paystack payment link via email or SMS.",
    },
    {
      number: "03",
      icon: Bell,
      title: "Auto-Reminders",
      description:
        "ChapChap sends reminders automatically. No more awkward follow-up calls.",
    },
    {
      number: "04",
      icon: CheckCircle,
      title: "Get Paid Faster",
      description:
        "Clients pay with one click. Money hits your account instantly.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
      style={{ perspective: "1000px" }}
    >
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get started in minutes. No complex setup required.
          </p>
        </AnimatedSection>

        <div className="relative">
          {/* Connection Line */}
          <motion.div 
            className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 -translate-y-1/2"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: true }}
          />

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.15}>
            {steps.map((step, index) => (
              <StaggerItem key={index}>
                <motion.div 
                  className="relative"
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <motion.div 
                    className="bg-white p-8 rounded-2xl border shadow-sm text-center h-full"
                    whileHover={{ 
                      boxShadow: "0 20px 40px -15px rgba(0,0,0,0.15)",
                      rotateY: 3
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Step Number */}
                    <motion.div 
                      className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                      viewport={{ once: true }}
                    >
                      {index + 1}
                    </motion.div>

                    <motion.div 
                      className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 mt-4"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <step.icon className="h-8 w-8 text-primary" />
                    </motion.div>

                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </motion.div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
