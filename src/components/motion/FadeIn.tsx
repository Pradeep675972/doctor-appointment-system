"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function FadeIn({
  children,
  className = "",
  role,
}: {
  children: ReactNode;
  className?: string;
  role?: "status" | "alert";
}) {
  return (
    <motion.div
      role={role}
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function GrowBar({ done, delay = 0 }: { done: boolean; delay?: number }) {
  return (
    <div className="relative h-1.5 overflow-hidden rounded-full bg-mist">
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: done ? 1 : 0 }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 origin-left rounded-full bg-linear-to-r from-brand to-mint"
      />
    </div>
  );
}
