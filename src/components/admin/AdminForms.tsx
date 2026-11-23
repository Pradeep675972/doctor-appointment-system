"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  addBlockedDateAction,
  deleteSpecialtyAction,
  removeBlockedDateAction,
  saveDoctorAction,
  saveScheduleAction,
  saveSpecialtyAction,
  setAppointmentStatusAction,
} from "@/app/actions/admin";
import { Button, SubmitButton } from "@/components/ui/Button";
import { FormNotice, Input, Select, Textarea } from "@/components/ui/Field";
import { initialActionState } from "@/lib/action-state";
import { WEEKDAYS } from "@/lib/format";
import { SPECIALTY_ICONS } from "@/lib/icons";

/* ----------------------------- appointment status ----------------------------- */

const STATUS_ACTIONS: Record<string, { value: string; label: string; tone: string }[]> = {
  pending: [
    { value: "confirmed", label: "Approve", tone: "bg-mint text-white hover:bg-mint-deep" },
    { value: "rejected", label: "Decline", tone: "bg-rose-soft text-rose hover:bg-rose hover:text-white" },
  ],
  confirmed: [
    { value: "completed", label: "Mark completed", tone: "bg-sky text-brand-deep hover:bg-brand hover:text-white" },
    { value: "cancelled", label: "Cancel", tone: "bg-mist text-navy-soft hover:bg-navy hover:text-white" },
  ],
};

function StatusButton({ value, label, tone }: { value: string; label: string; tone: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="status"
      value={value}
      disabled={pending}
      className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${tone}`}
    >
      {label}
    </button>
  );
}

export function StatusActions({ appointmentId, status }: { appointmentId: number; status: string }) {
  const [state, formAction] = useActionState(setAppointmentStatusAction, initialActionState);
  const actions = STATUS_ACTIONS[status] ?? [];

  return (
    <div className="flex flex-col items-start gap-2 md:items-end">
      {actions.length > 0 ? (
        <form action={formAction} className="flex flex-wrap gap-2">
          <input type="hidden" name="appointmentId" value={appointmentId} />
          {actions.map((action) => (
            <StatusButton key={action.value} {...action} />
          ))}
        </form>
      ) : (
        <span className="text-xs text-muted">No actions available</span>
      )}
      {state.message && (
        <p role="status" className={`text-xs font-medium ${state.ok ? "text-mint-deep" : "text-rose"}`}>
          {state.message}
        </p>
      )}
    </div>
  );
}

/* ----------------------------- doctor profile ----------------------------- */

export type DoctorFormValues = {
  id: number;
  slug: string;
  fullName: string;
  title: string;
  tagline: string;
  bio: string;
  photo: string;
  specialtyId: number;
  clinicId: number;
  yearsExperience: number;
  consultationFee: number;
  slotMinutes: number;
  languages: string[];
  qualifications: string[];
  isActive: boolean;
};

export function DoctorForm({
  doctor,
  specialties,
  clinics,
}: {
  doctor?: DoctorFormValues;
  specialties: { id: number; name: string }[];
  clinics: { id: number; name: string; city: string }[];
}) {
  const [state, formAction] = useActionState(saveDoctorAction, initialActionState);
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-8">
      {doctor && <input type="hidden" name="id" value={doctor.id} />}

      <div className="grid gap-6 rounded-4xl border border-line bg-white p-6 shadow-soft sm:p-8 lg:grid-cols-2">
        <Input name="fullName" label="Full name" defaultValue={doctor?.fullName ?? ""} placeholder="Dr. Jane Doe" error={errors.fullName} />
        <Input name="title" label="Credentials" defaultValue={doctor?.title ?? "MD"} placeholder="MD, FACC" />
        <Input name="slug" label="Profile URL slug" defaultValue={doctor?.slug ?? ""} hint="Leave blank to generate from the name." error={errors.slug} />
        <Input name="photo" label="Photo path or URL" defaultValue={doctor?.photo ?? "/images/doctors/doc-1.jpg"} hint="For example /images/doctors/doc-1.jpg" error={errors.photo} />
        <Select name="specialtyId" label="Specialty" defaultValue={doctor?.specialtyId ?? ""} error={errors.specialtyId}>
          <option value="" disabled>
            Choose a specialty
          </option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select name="clinicId" label="Clinic" defaultValue={doctor?.clinicId ?? ""} error={errors.clinicId}>
          <option value="" disabled>
            Choose a clinic
          </option>
          {clinics.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {c.city}
            </option>
          ))}
        </Select>
        <Input name="yearsExperience" type="number" min={0} max={70} label="Years of experience" defaultValue={doctor?.yearsExperience ?? 5} error={errors.yearsExperience} />
        <Input name="consultationFee" type="number" min={0} max={5000} label="Consultation fee (USD)" defaultValue={doctor?.consultationFee ?? 150} error={errors.consultationFee} />
        <Select name="slotMinutes" label="Consultation length" defaultValue={doctor?.slotMinutes ?? 30} error={errors.slotMinutes}>
          {[15, 20, 30, 45, 60].map((m) => (
            <option key={m} value={m}>
              {m} minutes
            </option>
          ))}
        </Select>
        <label className="flex cursor-pointer items-center gap-3 self-end rounded-2xl border border-line px-4 py-3.5 text-sm font-semibold text-navy transition-colors hover:border-brand/40">
          <input type="checkbox" name="isActive" defaultChecked={doctor?.isActive ?? true} className="h-5 w-5 accent-brand" />
          Accepting bookings
        </label>
        <div className="lg:col-span-2">
          <Input name="tagline" label="Tagline" defaultValue={doctor?.tagline ?? ""} placeholder="One sentence that describes the care they provide" />
        </div>
        <div className="lg:col-span-2">
          <Textarea name="bio" label="Biography" rows={5} defaultValue={doctor?.bio ?? ""} />
        </div>
        <Input name="languages" label="Languages" hint="Separate with commas" defaultValue={doctor?.languages.join(", ") ?? "English"} />
        <Textarea name="qualifications" label="Qualifications" hint="One per line" rows={4} defaultValue={doctor?.qualifications.join("\n") ?? ""} />
      </div>

      <div className="sticky bottom-4 z-10 flex flex-col gap-4 rounded-4xl glass p-4 shadow-lift sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0 flex-1">
          <FormNotice state={state} />
          {!state.message && <p className="text-sm text-muted">Changes appear on the public site immediately.</p>}
        </div>
        <SubmitButton pendingLabel="Saving…" arrow>
          {doctor ? "Save profile" : "Create doctor"}
        </SubmitButton>
      </div>
    </form>
  );
}

/* ----------------------------- weekly schedule ----------------------------- */

type DayState = { on: boolean; s1: string; e1: string; s2: string; e2: string };
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function ScheduleEditor({
  doctorId,
  slotMinutes,
  windows,
}: {
  doctorId: number;
  slotMinutes: number;
  windows: { weekday: number; startTime: string; endTime: string }[];
}) {
  const [state, formAction] = useActionState(saveScheduleAction, initialActionState);
  const [days, setDays] = useState<DayState[]>(() =>
    WEEKDAYS.map((_, weekday) => {
      const rows = windows
        .filter((w) => w.weekday === weekday)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      return {
        on: rows.length > 0,
        s1: rows[0]?.startTime ?? "09:00",
        e1: rows[0]?.endTime ?? "17:00",
        s2: rows[1]?.startTime ?? "",
        e2: rows[1]?.endTime ?? "",
      };
    }),
  );

  const update = (weekday: number, patch: Partial<DayState>) =>
    setDays((prev) => prev.map((day, i) => (i === weekday ? { ...day, ...patch } : day)));

  const copyMondayToWeekdays = () =>
    setDays((prev) =>
      prev.map((day, i) => (i >= 2 && i <= 5 ? { ...prev[1], on: true } : day)),
    );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="doctorId" value={doctorId} />
      <div className="rounded-4xl border border-line bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="sm:w-72">
            <Select name="slotMinutes" label="Appointment length" defaultValue={slotMinutes}>
              {[15, 20, 30, 45, 60].map((m) => (
                <option key={m} value={m}>
                  {m} minutes
                </option>
              ))}
            </Select>
          </div>
          <Button variant="soft" size="sm" onClick={copyMondayToWeekdays}>
            Copy Monday to Tue–Fri
          </Button>
        </div>

        <div className="mt-8 space-y-3">
          {WEEK_ORDER.map((weekday) => {
            const day = days[weekday];
            return (
              <div
                key={weekday}
                className={`grid items-center gap-4 rounded-3xl border p-4 transition-colors duration-300 md:grid-cols-5 ${
                  day.on ? "border-brand/30 bg-sky/50" : "border-line bg-mist"
                }`}
              >
                <label className="flex cursor-pointer items-center gap-3 font-semibold text-navy md:col-span-2">
                  <input
                    type="checkbox"
                    name={`day${weekday}_on`}
                    checked={day.on}
                    onChange={(event) => update(weekday, { on: event.target.checked })}
                    className="h-5 w-5 accent-brand"
                  />
                  {WEEKDAYS[weekday]}
                </label>
                <div className="grid gap-3 sm:grid-cols-2 md:col-span-3">
                  <TimeRange
                    label="Session 1"
                    disabled={!day.on}
                    start={day.s1}
                    end={day.e1}
                    startName={`day${weekday}_start1`}
                    endName={`day${weekday}_end1`}
                    onStart={(v) => update(weekday, { s1: v })}
                    onEnd={(v) => update(weekday, { e1: v })}
                  />
                  <TimeRange
                    label="Session 2 (optional)"
                    disabled={!day.on}
                    start={day.s2}
                    end={day.e2}
                    startName={`day${weekday}_start2`}
                    endName={`day${weekday}_end2`}
                    onStart={(v) => update(weekday, { s2: v })}
                    onEnd={(v) => update(weekday, { e2: v })}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FormNotice state={state} />
        <SubmitButton pendingLabel="Saving schedule…" arrow>
          Save schedule
        </SubmitButton>
      </div>
    </form>
  );
}

function TimeRange({
  label,
  disabled,
  start,
  end,
  startName,
  endName,
  onStart,
  onEnd,
}: {
  label: string;
  disabled: boolean;
  start: string;
  end: string;
  startName: string;
  endName: string;
  onStart: (value: string) => void;
  onEnd: (value: string) => void;
}) {
  return (
    <fieldset disabled={disabled} className="rounded-2xl bg-white p-3 ring-1 ring-line disabled:opacity-50">
      <legend className="px-1 text-xs font-semibold tracking-wider text-muted uppercase">{label}</legend>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="time"
          name={startName}
          aria-label={`${label} start`}
          value={start}
          onChange={(event) => onStart(event.target.value)}
          className="w-full rounded-xl bg-mist px-3 py-2 text-sm font-semibold text-navy outline-none focus:ring-2 focus:ring-brand/30"
        />
        <span aria-hidden className="text-muted">
          →
        </span>
        <input
          type="time"
          name={endName}
          aria-label={`${label} end`}
          value={end}
          onChange={(event) => onEnd(event.target.value)}
          className="w-full rounded-xl bg-mist px-3 py-2 text-sm font-semibold text-navy outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>
    </fieldset>
  );
}

/* ----------------------------- blocked dates ----------------------------- */

export function BlockedDateForm({ doctorId }: { doctorId: number }) {
  const [state, formAction] = useActionState(addBlockedDateAction, initialActionState);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 sm:items-end">
      <input type="hidden" name="doctorId" value={doctorId} />
      <Input name="date" type="date" min={today} label="Date to close" error={state.errors?.date} />
      <Input name="reason" label="Reason" placeholder="Conference, leave, training…" />
      <SubmitButton variant="dark" pendingLabel="Blocking…" block className="sm:col-span-2">
        Block date
      </SubmitButton>
      <div className="sm:col-span-2">
        <FormNotice state={state} />
      </div>
    </form>
  );
}

export function RemoveDateButton({ id, doctorId }: { id: number; doctorId: number }) {
  const [state, formAction] = useActionState(removeBlockedDateAction, initialActionState);
  return (
    <form action={formAction} className="flex items-center gap-3">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="doctorId" value={doctorId} />
      <SubmitButton variant="ghost" size="sm" pendingLabel="Removing…">
        Remove
      </SubmitButton>
      {state.message && <span className="text-xs text-muted">{state.message}</span>}
    </form>
  );
}

/* ----------------------------- specialties ----------------------------- */

export function SpecialtyForm() {
  const [state, formAction] = useActionState(saveSpecialtyAction, initialActionState);
  return (
    <form action={formAction} className="space-y-6">
      <Input name="name" label="Specialty name" placeholder="e.g. Sports Medicine" error={state.errors?.name} />
      <Textarea name="description" label="Short description" rows={3} maxLength={240} placeholder="What patients can expect from this specialty" />
      <Select name="icon" label="Icon" defaultValue="stethoscope">
        {Object.keys(SPECIALTY_ICONS).map((key) => (
          <option key={key} value={key}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </option>
        ))}
      </Select>
      <FormNotice state={state} />
      <SubmitButton block pendingLabel="Adding…">
        Add specialty
      </SubmitButton>
    </form>
  );
}

export function DeleteSpecialtyButton({ id, doctorCount }: { id: number; doctorCount: number }) {
  const [state, formAction] = useActionState(deleteSpecialtyAction, initialActionState);
  if (doctorCount > 0) {
    return (
      <p className="text-xs text-muted" title="Reassign its doctors before deleting">
        {doctorCount} linked
      </p>
    );
  }
  return (
    <form action={formAction} className="flex items-center gap-3">
      <input type="hidden" name="id" value={id} />
      <SubmitButton variant="danger" size="sm" pendingLabel="Deleting…">
        Delete
      </SubmitButton>
      {state.message && <span className="text-xs text-rose">{state.message}</span>}
    </form>
  );
}
