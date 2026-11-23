"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { AppointmentCard } from "@/components/dashboard/AppointmentCard";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/primitives";
import type { AppointmentRow } from "@/lib/queries";

type TabKey = "upcoming" | "previous" | "cancelled";

export function AppointmentTabs({
  upcoming,
  previous,
  cancelled,
}: {
  upcoming: AppointmentRow[];
  previous: AppointmentRow[];
  cancelled: AppointmentRow[];
}) {
  const [tab, setTab] = useState<TabKey>("upcoming");
  const lists: Record<TabKey, AppointmentRow[]> = { upcoming, previous, cancelled };
  const tabs: { key: TabKey; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "previous", label: "Previous" },
    { key: "cancelled", label: "Cancelled" },
  ];
  const rows = lists[tab];

  const emptyCopy: Record<TabKey, { title: string; body: string }> = {
    upcoming: {
      title: "No upcoming visits",
      body: "When you book a consultation it will appear here with its status and options to manage it.",
    },
    previous: {
      title: "No previous visits yet",
      body: "Completed visits appear here, ready for you to leave a review or revisit your notes.",
    },
    cancelled: {
      title: "Nothing cancelled",
      body: "Cancelled and declined requests are kept here for your records.",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="Appointments" className="inline-flex rounded-full bg-white p-1.5 shadow-soft ring-1 ring-line">
          {tabs.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.key)}
                className={`relative rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                  active ? "text-white" : "text-navy-soft hover:text-navy"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-navy"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                )}
                <span className="relative">
                  {item.label} <span className="opacity-60">({lists[item.key].length})</span>
                </span>
              </button>
            );
          })}
        </div>
        <LinkButton href="/doctors?sort=soonest" variant="soft" size="sm">
          Book another visit
        </LinkButton>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          role="tabpanel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="space-y-5"
        >
          {rows.length === 0 ? (
            <EmptyState
              title={emptyCopy[tab].title}
              body={emptyCopy[tab].body}
              action={
                tab === "upcoming" ? (
                  <Link href="/doctors?sort=soonest" className="text-sm font-semibold text-brand-deep hover:underline">
                    Find a specialist →
                  </Link>
                ) : undefined
              }
            />
          ) : (
            rows.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
