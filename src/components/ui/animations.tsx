"use client";

import { motion, Variants, useInView, useReducedMotion } from "framer-motion";
import { ReactNode, useRef } from "react";

// Animation variants for reuse across components
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export const float: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const rotate3D: Variants = {
  initial: { rotateY: 0, rotateX: 0 },
  animate: {
    rotateY: [0, 5, 0, -5, 0],
    rotateX: [0, 3, 0, -3, 0],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const pulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const shimmer: Variants = {
  initial: { backgroundPosition: "-200% 0" },
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

// Animated components
interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function AnimatedSection({ 
  children, 
  className = "", 
  delay = 0,
  direction = "up" 
}: AnimatedSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    up: fadeInUp,
    down: fadeInDown,
    left: fadeInLeft,
    right: fadeInRight
  };

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants[direction]}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover3D?: boolean;
}

export function AnimatedCard({ 
  children, 
  className = "", 
  delay = 0,
  hover3D = true 
}: AnimatedCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={scaleIn}
      transition={{ delay }}
      whileHover={hover3D ? { 
        scale: 1.02, 
        rotateY: 2,
        rotateX: 2,
        z: 50,
        transition: { duration: 0.3 }
      } : { scale: 1.02 }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  intensity?: "subtle" | "medium" | "strong";
}

export function FloatingElement({ 
  children, 
  className = "",
  intensity = "medium" 
}: FloatingElementProps) {
  const shouldReduceMotion = useReducedMotion();
  
  const yRange = {
    subtle: [-5, 5, -5],
    medium: [-10, 10, -10],
    strong: [-20, 20, -20]
  };

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      animate={{ y: yRange[intensity] }}
      transition={{
        duration: intensity === "subtle" ? 4 : intensity === "medium" ? 6 : 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface GlowingBorderProps {
  children: ReactNode;
  className?: string;
  color?: string;
}

export function GlowingBorder({ 
  children, 
  className = "",
  color = "#FF6B35" 
}: GlowingBorderProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.01 }}
    >
      <motion.div
        className="absolute -inset-0.5 rounded-xl opacity-75 blur-sm"
        style={{ background: `linear-gradient(45deg, ${color}, #FDB750, ${color})` }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl">
        {children}
      </div>
    </motion.div>
  );
}

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export function Parallax({ children, className = "", speed = 0.5 }: ParallaxProps) {
  const ref = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ willChange: "transform" }}
      initial={{ y: 0 }}
      whileInView={{ y: -20 * speed }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: false, margin: "-100px" }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ 
  children, 
  className = "",
  staggerDelay = 0.1 
}: StaggerContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ 
  children, 
  className = "" 
}: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

// 3D Tilt Card
interface Tilt3DCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export function Tilt3DCard({ 
  children, 
  className = "",
  intensity = 10 
}: Tilt3DCardProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      whileHover={{ 
        rotateX: intensity / 2, 
        rotateY: intensity,
        scale: 1.02 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
}

// Gradient text animation
interface AnimatedGradientTextProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedGradientText({ children, className = "" }: AnimatedGradientTextProps) {
  return (
    <motion.span
      className={`bg-gradient-to-r from-[#FF6B35] via-[#FDB750] to-[#FF6B35] bg-clip-text text-transparent bg-[length:200%_auto] ${className}`}
      animate={{ backgroundPosition: ["0% center", "200% center"] }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}

// Magnetic button effect
interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
}

export function MagneticButton({ children, className = "" }: MagneticButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}

// Reveal on scroll
interface RevealProps {
  children: ReactNode;
  className?: string;
  width?: "fit-content" | "100%";
}

export function Reveal({ children, className = "", width = "fit-content" }: RevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className} style={{ width }}>{children}</div>;
  }

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 }
        }}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ duration: 0.5, delay: 0.25 }}
        className={className}
      >
        {children}
      </motion.div>
      <motion.div
        variants={{
          hidden: { left: 0 },
          visible: { left: "100%" }
        }}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ duration: 0.5, ease: "easeIn" }}
        style={{
          position: "absolute",
          top: 4,
          bottom: 4,
          left: 0,
          right: 0,
          background: "#FF6B35",
          zIndex: 20
        }}
      />
    </div>
  );
}
