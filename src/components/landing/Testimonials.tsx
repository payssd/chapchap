"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animations";

export function Testimonials() {
  const testimonials = [
    {
      name: "James Mwangi",
      role: "CEO, TechStart East Africa",
      content:
        "ChapChap reduced our average payment time from 45 days to just 12 days. It's been a game-changer for our cash flow.",
      rating: 5,
    },
    {
      name: "Sarah Wanjiku",
      role: "Founder, Wanjiku Designs",
      content:
        "I used to spend hours every week chasing payments. Now ChapChap handles it automatically. I can focus on my designs instead.",
      rating: 5,
    },
    {
      name: "David Ochieng",
      role: "Director, Ochieng Consulting",
      content:
        "The automatic reminders are professional and effective. My clients appreciate the payment links - it's so easy for them to pay.",
      rating: 5,
    },
    {
      name: "Grace Akinyi",
      role: "Owner, Akinyi Catering",
      content:
        "Before ChapChap, I had $5,000 in overdue invoices. Within 2 months, I collected 80% of it. Incredible!",
      rating: 5,
    },
    {
      name: "Peter Kamau",
      role: "Freelance Developer",
      content:
        "As a freelancer, getting paid on time is crucial. ChapChap has made my invoicing process completely stress-free.",
      rating: 5,
    },
    {
      name: "Mary Njeri",
      role: "MD, Njeri Supplies Ltd",
      content:
        "We process over 100 invoices monthly. ChapChap has saved us countless hours and improved our collection rate by 40%.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50" style={{ perspective: "1000px" }}>
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Loved by Businesses Worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of businesses that have transformed their payment
            collection with ChapChap.
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
          {testimonials.map((testimonial, index) => (
            <StaggerItem key={index}>
              <motion.div
                className="bg-white p-6 rounded-2xl border shadow-sm h-full"
                whileHover={{ 
                  y: -8, 
                  rotateY: 2,
                  boxShadow: "0 20px 40px -15px rgba(0,0,0,0.15)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
              >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, type: "spring" }}
                  >
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  </motion.div>
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground mb-6">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </motion.div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
