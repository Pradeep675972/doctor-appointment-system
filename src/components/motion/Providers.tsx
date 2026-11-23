"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/** Respects the OS reduced-motion setting for every framer-motion component. */
export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
