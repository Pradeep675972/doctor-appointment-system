"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDate, formatTime } from "@/lib/format";
import type { DaySlots } from "@/lib/scheduling";

export type SelectedSlot = { date: string; time: string } | null;

function openCount(day: DaySlots) {
  return day.slots.filter((s) => s.available).length;
}

export function AvailabilityCalendar({
  days,
  selected,
  onSelect,
}: {
  days: DaySlots[];
  selected: SelectedSlot;
  onSelect: (date: string, time: string) => void;
}) {
  const firstOpen = useMemo(
    () => days.find((d) => openCount(d) > 0)?.date ?? days[0]?.date ?? "",
    [days],
  );
  const [activeDate, setActiveDate] = useState<string>(selected?.date ?? firstOpen);
  const active = days.find((d) => d.date === activeDate) ?? days[0];

  if (!active) {
    return <p className="text-navy-soft">Availability will appear here shortly.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <p className="font-display text-3xl text-navy">
            {formatDate(active.date, { month: "long", year: "numeric" })}
          </p>
          <p className="text-sm font-medium text-muted">
            {openCount(active)} open {openCount(active) === 1 ? "time" : "times"}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Choose a date"
          className="scrollbar-none -mx-2 mt-5 flex snap-x gap-2 overflow-x-auto px-2 pt-1 pb-2"
        >
          {days.map((day) => {
            const isActive = day.date === active.date;
            const open = openCount(day) > 0;
            return (
              <button
                key={day.date}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`${formatDate(day.date, { weekday: "long", month: "long", day: "numeric" })}, ${openCount(day)} open times`}
                onClick={() => setActiveDate(day.date)}
                className={`flex w-16 shrink-0 snap-start flex-col items-center gap-1 rounded-2xl border px-2 py-3 transition-all duration-300 hover:-translate-y-0.5 ${
                  isActive
                    ? "border-navy bg-navy text-white shadow-lift"
                    : open
                      ? "border-line bg-white text-navy hover:border-brand"
                      : "border-line bg-mist text-muted"
                }`}
              >
                <span className="text-xs font-semibold tracking-wider uppercase">
                  {formatDate(day.date, { weekday: "short" })}
                </span>
                <span className="font-display text-2xl leading-none">
                  {formatDate(day.date, { day: "numeric" })}
                </span>
                <span
                  aria-hidden
                  className={`mt-1 h-1.5 w-1.5 rounded-full ${open ? (isActive ? "bg-mint" : "bg-mint") : "bg-line"}`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.date}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {active.blocked ? (
              <EmptyNote>The clinic is closed on this day.</EmptyNote>
            ) : active.slots.length === 0 ? (
              <EmptyNote>No consultations are scheduled on this day.</EmptyNote>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {active.slots.map((slot) => {
                  const isSelected = selected?.date === active.date && selected.time === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      aria-pressed={isSelected}
                      onClick={() => onSelect(active.date, slot.time)}
                      className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-all duration-300 active:scale-95 ${
                        isSelected
                          ? "border-brand bg-brand text-white shadow-glow"
                          : slot.available
                            ? "border-line bg-white text-navy hover:-translate-y-0.5 hover:border-brand hover:shadow-soft"
                            : "cursor-not-allowed border-transparent bg-mist text-muted line-through"
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4" aria-hidden />}
                      {formatTime(slot.time)}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="flex items-center gap-2 text-xs text-muted">
        <span className="h-2 w-2 rounded-full bg-mint" aria-hidden /> Open ·
        <span className="ml-1 h-2 w-2 rounded-full bg-line" aria-hidden /> Unavailable · Times use the clinic&apos;s local
        time zone.
      </p>
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl bg-mist p-8 text-center text-navy-soft">{children}</div>;
}
