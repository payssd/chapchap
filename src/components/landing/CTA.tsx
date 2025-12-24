"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/ui/animations";

export function CTA() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 hero-gradient overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 pattern-dots opacity-20" />
      
      {/* Floating blobs with animation */}
      <motion.div 
        className="absolute top-10 left-10 w-64 h-64 bg-[#FDB750] rounded-full mix-blend-multiply filter blur-xl opacity-30"
        animate={{ 
          y: [0, -20, 0],
          x: [0, 15, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-10 right-10 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-20"
        animate={{ 
          y: [0, 25, 0],
          x: [0, -20, 0],
          scale: [1, 1.15, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <AnimatedSection>
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="h-4 w-4" />
            </motion.div>
            Join 500+ businesses worldwide
          </motion.div>
        </AnimatedSection>
        
        <AnimatedSection delay={0.1}>
          <h2 className="text-3xl sm:text-4xl lg:text-display-sm font-display font-bold text-white mb-6">
            Start Getting Paid <span className="text-[#FDB750]">Chapchap</span> Today
          </h2>
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Transform your payment collection with automated reminders. 
            Start your free trial now and never chase invoices again.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  size="lg"
                  className="text-lg px-8 w-full sm:w-auto bg-white text-[#FF6B35] hover:bg-white/90 font-display font-semibold shadow-xl hover:shadow-2xl transition-all duration-200"
                >
                  Start Free Trial
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.span>
                </Button>
              </motion.div>
            </Link>
            <Link href="/login">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 w-full sm:w-auto bg-transparent text-white border-2 border-white hover:bg-white hover:text-[#FF6B35] font-display font-semibold transition-all duration-200"
                >
                  Login to Dashboard
                </Button>
              </motion.div>
            </Link>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <p className="text-white/70 mt-6 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
