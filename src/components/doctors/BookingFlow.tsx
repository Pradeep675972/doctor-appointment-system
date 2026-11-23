"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { bookAppointmentAction, rescheduleAppointmentAction } from "@/app/actions/appointments";
import { AvailabilityCalendar, type SelectedSlot } from "@/components/doctors/AvailabilityCalendar";
import { SubmitButton } from "@/components/ui/Button";
import { FormNotice, Textarea } from "@/components/ui/Field";
import { initialActionState } from "@/lib/action-state";
import { formatDate, formatFee, formatTime, VISIT_TYPES } from "@/lib/format";
import type { DaySlots } from "@/lib/scheduling";

export type BookingDoctor = {
  id: number;
  slug: string;
  fullName: string;
  title: string;
  specialtyName: string;
  clinicName: string;
  clinicAddress: string;
  photo: string;
  consultationFee: number;
};

export function BookingFlow({
  mode,
  doctor,
  days,
  initialSelection,
  initialVisitType = "in-person",
  appointmentId,
  currentLabel,
}: {
  mode: "book" | "reschedule";
  doctor: BookingDoctor;
  days: DaySlots[];
  initialSelection: SelectedSlot;
  initialVisitType?: string;
  appointmentId?: number;
  currentLabel?: string;
}) {
  const router = useRouter();
  const action = mode === "book" ? bookAppointmentAction : rescheduleAppointmentAction;
  const [state, formAction] = useActionState(action, initialActionState);
  const [selected, setSelected] = useState<SelectedSlot>(initialSelection);
  const [visitType, setVisitType] = useState(initialVisitType);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (state.message && !state.ok) router.refresh();
  }, [state, router]);

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="rounded-5xl border border-line bg-white p-6 shadow-soft sm:p-8 lg:col-span-7">
        <AvailabilityCalendar
          days={days}
          selected={selected}
          onSelect={(date, time) => setSelected({ date, time })}
        />
      </div>

      <aside className="lg:col-span-5">
        <form
          action={formAction}
          className="space-y-6 rounded-5xl border border-line bg-white p-6 shadow-lift sm:p-8 lg:sticky lg:top-28"
        >
          <input type="hidden" name="doctorId" value={doctor.id} />
          <input type="hidden" name="appointmentId" value={appointmentId ?? ""} />
          <input type="hidden" name="date" value={selected?.date ?? ""} />
          <input type="hidden" name="time" value={selected?.time ?? ""} />

          <div className="overflow-hidden rounded-4xl bg-navy p-6 text-white">
            <div className="flex items-center gap-4">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                <Image src={doctor.photo} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <div>
                <p className="font-display text-2xl leading-tight">{doctor.fullName}</p>
                <p className="text-sm text-white/70">
                  {doctor.specialtyName} · {doctor.clinicName}
                </p>
              </div>
            </div>
            <dl className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">When</dt>
                <dd className="text-right font-semibold">
                  {selected
                    ? formatDate(selected.date, { weekday: "short", month: "short", day: "numeric" })
                    : "Select a date"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">Time</dt>
                <dd className="font-semibold">{selected ? formatTime(selected.time) : "Select a time"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">Location</dt>
                <dd className="text-right">{doctor.clinicAddress}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">Consultation fee</dt>
                <dd className="font-semibold">{formatFee(doctor.consultationFee)}</dd>
              </div>
            </dl>
          </div>

          {mode === "reschedule" && currentLabel && (
            <p className="rounded-2xl bg-amber-soft p-4 text-sm text-amber-deep">
              Currently booked for {currentLabel}. Rescheduled visits return to the clinic for confirmation.
            </p>
          )}

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-navy">Visit type</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {VISIT_TYPES.map((option) => (
                <label key={option.value} className="group relative cursor-pointer">
                  <input
                    type="radio"
                    name="visitType"
                    value={option.value}
                    checked={visitType === option.value}
                    onChange={() => setVisitType(option.value)}
                    className="peer sr-only"
                  />
                  <span className="flex h-full items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-sm font-semibold text-navy transition-all duration-300 group-hover:border-brand/40 peer-checked:border-brand peer-checked:bg-sky peer-checked:text-brand-deep peer-focus-visible:ring-4 peer-focus-visible:ring-brand/20">
                    <span
                      aria-hidden
                      className={`grid h-5 w-5 place-items-center rounded-full border-2 transition-colors ${
                        visitType === option.value ? "border-brand bg-brand" : "border-line"
                      }`}
                    >
                      {visitType === option.value && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {mode === "book" && (
            <Textarea
              name="reason"
              label="Reason for visit"
              hint="Optional. Share anything the doctor should know before your visit."
              maxLength={500}
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          )}

          <FormNotice state={state} />

          <SubmitButton
            block
            size="lg"
            arrow
            disabled={!selected}
            pendingLabel={mode === "book" ? "Booking your visit…" : "Saving new time…"}
          >
            {mode === "book" ? "Confirm booking request" : "Confirm new time"}
          </SubmitButton>
          {!selected && <p className="text-center text-sm text-muted">Select an open time to continue.</p>}
        </form>
      </aside>
    </div>
  );
}
