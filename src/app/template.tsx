"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";

let hasMounted = false;

/** Runs on every route change: a navy curtain wipes away and the page fades in. */
export default function Template({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [isNavigation] = useState(() => hasMounted);

  useEffect(() => {
    hasMounted = true;
  }, []);

  return (
    <>
      {isNavigation && !reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-40 origin-top bg-navy"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        />
      )}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
        {children}
      </motion.div>
    </>
  );
}
