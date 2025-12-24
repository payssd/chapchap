"use client";

import Link from "next/link";
import { ArrowRight, Play, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AnimatedSection, FloatingElement, Tilt3DCard, AnimatedGradientText } from "@/components/ui/animations";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden hero-gradient" style={{ perspective: "1000px" }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 pattern-dots opacity-20" />
      
      {/* Floating blobs with 3D effect */}
      <motion.div 
        className="absolute top-20 left-10 w-72 h-72 bg-[#FDB750] rounded-full mix-blend-multiply filter blur-xl opacity-30"
        animate={{ 
          y: [0, -30, 0],
          x: [0, 20, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-40 right-10 w-72 h-72 bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-xl opacity-30"
        animate={{ 
          y: [0, 40, 0],
          x: [0, -30, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div 
        className="absolute bottom-20 left-1/2 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-20"
        animate={{ 
          y: [0, -20, 0],
          scale: [1, 1.15, 1]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <AnimatedSection delay={0}>
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.3)" }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="h-4 w-4" />
                </motion.div>
                Now serving 1,000+ businesses worldwide
              </motion.div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-display-lg font-display font-bold tracking-tight text-white">
                Get Paid{" "}
                <AnimatedGradientText>Chapchap</AnimatedGradientText>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <p className="text-xl text-white/90 max-w-lg">
                Stop chasing invoices. Let automated reminders do the work 
                while you focus on growing your business.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button size="lg" className="w-full sm:w-auto text-lg px-8 bg-white text-[#FF6B35] hover:bg-white/90 font-display font-semibold shadow-xl hover:shadow-2xl transition-all duration-200">
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
                <a href="#how-it-works">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto text-lg px-8 bg-transparent text-white border-2 border-white hover:bg-white hover:text-[#FF6B35] font-display font-semibold transition-all duration-200"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      See How It Works
                    </Button>
                  </motion.div>
                </a>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <div className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.svg
                        key={i}
                        className="w-5 h-5 text-[#FDB750] fill-current"
                        viewBox="0 0 20 20"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </motion.svg>
                    ))}
                  </div>
                  <p className="text-sm text-white/80">
                    Rated 4.9/5 by 200+ businesses
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Right Content - Dashboard Preview */}
          <FloatingElement intensity="subtle">
            <Tilt3DCard className="relative" intensity={5}>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-[#FF6B35]/30 to-[#FDB750]/30 rounded-3xl blur-3xl"
                animate={{ 
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div 
                className="relative bg-white rounded-2xl shadow-2xl border overflow-hidden"
                initial={{ opacity: 0, y: 50, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: "preserve-3d" }}
              >
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 text-center text-sm text-muted-foreground">
                  ChapChap Dashboard
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                    <p className="text-xl font-bold text-blue-600">$2,450</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Overdue</p>
                    <p className="text-xl font-bold text-red-600">$450</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Paid</p>
                    <p className="text-xl font-bold text-green-600">$8,900</p>
                  </div>
                </div>
                {/* Invoice List */}
                <div className="space-y-2">
                  {[
                    { client: "Acme Corp", amount: "$1,250", status: "Paid", color: "green" },
                    { client: "TechStart Inc", amount: "$850", status: "Sent", color: "blue" },
                    { client: "Global Services", amount: "$450", status: "Overdue", color: "red" },
                  ].map((invoice, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{invoice.client}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.amount}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full bg-${invoice.color}-100 text-${invoice.color}-700`}
                        style={{
                          backgroundColor:
                            invoice.color === "green"
                              ? "#dcfce7"
                              : invoice.color === "blue"
                              ? "#dbeafe"
                              : "#fee2e2",
                          color:
                            invoice.color === "green"
                              ? "#15803d"
                              : invoice.color === "blue"
                              ? "#1d4ed8"
                              : "#b91c1c",
                        }}
                      >
                        {invoice.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              </motion.div>
            </Tilt3DCard>
          </FloatingElement>
        </div>
      </div>
    </section>
  );
}
