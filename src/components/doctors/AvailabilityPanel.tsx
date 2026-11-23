"use client";

import { useState } from "react";
import { AvailabilityCalendar, type SelectedSlot } from "@/components/doctors/AvailabilityCalendar";
import { Button, LinkButton } from "@/components/ui/Button";
import { formatDate, formatTime } from "@/lib/format";
import type { DaySlots } from "@/lib/scheduling";

export function AvailabilityPanel({ doctorSlug, days }: { doctorSlug: string; days: DaySlots[] }) {
  const [selected, setSelected] = useState<SelectedSlot>(null);

  return (
    <div className="rounded-5xl border border-line bg-white p-6 shadow-soft sm:p-8">
      <AvailabilityCalendar
        days={days}
        selected={selected}
        onSelect={(date, time) => setSelected({ date, time })}
      />

      <div className="mt-8 flex flex-col gap-4 rounded-4xl bg-mist p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">Your selection</p>
          <p className="font-semibold text-navy" aria-live="polite">
            {selected
              ? `${formatDate(selected.date, { weekday: "long", month: "long", day: "numeric" })} at ${formatTime(selected.time)}`
              : "Choose a date and time above"}
          </p>
        </div>
        {selected ? (
          <LinkButton
            href={`/doctors/${doctorSlug}/book?date=${selected.date}&time=${selected.time}`}
            arrow
            magnetic
          >
            Continue to booking
          </LinkButton>
        ) : (
          <Button variant="dark" disabled>
            Continue to booking
          </Button>
        )}
      </div>
    </div>
  );
}
