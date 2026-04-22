import { motion, type Transition, type TargetAndTransition } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  variant?: "fade" | "slide-up" | "slide-right";
}

interface VariantConfig {
  initial:    TargetAndTransition;
  animate:    TargetAndTransition;
  exit:       TargetAndTransition;
  transition: Transition;
}

const variants: Record<string, VariantConfig> = {
  fade: {
    initial:    { opacity: 0 },
    animate:    { opacity: 1 },
    exit:       { opacity: 0 },
    transition: { duration: 0.25 },
  },
  "slide-up": {
    initial:    { opacity: 0, y: 24 },
    animate:    { opacity: 1, y: 0 },
    exit:       { opacity: 0, y: -16 },
    transition: { duration: 0.3 },
  },
  "slide-right": {
    initial:    { opacity: 0, x: -24 },
    animate:    { opacity: 1, x: 0 },
    exit:       { opacity: 0, x: 24 },
    transition: { duration: 0.28 },
  },
};

export function PageTransition({ children, variant = "slide-up" }: PageTransitionProps) {
  const v = variants[variant];
  return (
    <motion.div
      initial={v.initial}
      animate={v.animate}
      exit={v.exit}
      transition={v.transition}
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </motion.div>
  );
}
