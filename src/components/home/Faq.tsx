"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { SectionHeading } from "@/components/ui/primitives";

const FAQS = [
  {
    q: "How do I book an appointment?",
    a: "Choose a specialist, pick an open time in their calendar and confirm. Your request appears in your dashboard straight away, with its status.",
  },
  {
    q: "Can two patients ever get the same time?",
    a: "No. Each slot is locked the moment it is requested and the database enforces this, so the same time cannot be booked twice.",
  },
  {
    q: "Can I reschedule or cancel a visit?",
    a: "Yes. Open any upcoming visit in your dashboard to move it to a new time or cancel it. Rescheduled visits return to the clinic for confirmation.",
  },
  {
    q: "Will my appointment be confirmed?",
    a: "Clinics review every request. You will see the status change from awaiting confirmation to confirmed as soon as it has been approved.",
  },
  {
    q: "Do you offer video consultations?",
    a: "Many of our specialists do. Choose Video consultation when you book, and your confirmation will explain how to join.",
  },
  {
    q: "How is my health information protected?",
    a: "Your medical details are visible only to you and the clinic team. You can update allergies, conditions and emergency contacts at any time from your profile.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="Questions"
            title={
              <>
                Everything you need to <span className="text-brand italic">know.</span>
              </>
            }
            description="Still curious? Our care team is happy to help you choose the right specialist."
          />
          <a
            href="mailto:care@vitalis.health"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-deep transition-all duration-300 hover:gap-3"
          >
            Email care@vitalis.health →
          </a>
        </div>

        <div className="divide-y divide-line rounded-5xl border border-line bg-white px-6 shadow-soft sm:px-10 lg:col-span-7">
          {FAQS.map((item, index) => {
            const isOpen = open === index;
            const panelId = `faq-panel-${index}`;
            return (
              <div key={item.q}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : index)}
                    className="group flex w-full items-center justify-between gap-6 py-7 text-left"
                  >
                    <span
                      className={`font-display text-2xl leading-snug transition-colors duration-300 sm:text-3xl ${
                        isOpen ? "text-brand-deep" : "text-navy group-hover:text-brand-deep"
                      }`}
                    >
                      {item.q}
                    </span>
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-all duration-500 ${
                        isOpen ? "rotate-180 bg-brand text-white" : "bg-mist text-navy group-hover:bg-sky"
                      }`}
                      aria-hidden
                    >
                      {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-8 text-lg leading-relaxed text-navy-soft">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
