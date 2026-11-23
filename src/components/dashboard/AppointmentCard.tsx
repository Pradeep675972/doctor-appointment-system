"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Video, Building2 } from "lucide-react";
import { useActionState, useState } from "react";
import { cancelAppointmentAction } from "@/app/actions/appointments";
import { Button, LinkButton, SubmitButton } from "@/components/ui/Button";
import { FormNotice } from "@/components/ui/Field";
import { StatusBadge, Stars } from "@/components/ui/primitives";
import { initialActionState } from "@/lib/action-state";
import { isChangeable } from "@/lib/appointment-rules";
import { formatDate, formatTime, VISIT_TYPES } from "@/lib/format";
import type { AppointmentRow } from "@/lib/queries";

export function CancelAppointment({ id }: { id: number }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(cancelAppointmentAction, initialActionState);

  if (state.ok) {
    return <p className="text-sm font-semibold text-mint-deep">{state.message}</p>;
  }

  if (!open) {
    return (
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        Cancel visit
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex w-full flex-col gap-3">
      <input type="hidden" name="appointmentId" value={id} />
      <p className="text-sm text-navy-soft">Cancel this visit? The time slot will be released for other patients.</p>
      <div className="flex flex-wrap items-center gap-2">
        <SubmitButton variant="danger" size="sm" pendingLabel="Cancelling…">
          Yes, cancel visit
        </SubmitButton>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Keep appointment
        </Button>
      </div>
      <FormNotice state={state} />
    </form>
  );
}

export function AppointmentCard({ appointment: a }: { appointment: AppointmentRow }) {
  const changeable = isChangeable(a);
  const visitLabel = VISIT_TYPES.find((v) => v.value === a.visitType)?.label ?? "In person";
  const canReview = a.status === "completed" && !a.reviewId;

  return (
    <article className="group flex flex-col gap-6 rounded-4xl border border-line bg-white p-5 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift sm:p-7 md:flex-row md:items-start md:justify-between">
      <div className="flex min-w-0 flex-1 gap-5">
        <span className="relative hidden h-24 w-24 shrink-0 overflow-hidden rounded-3xl sm:block">
          <Image src={a.doctorPhoto} alt={a.doctorName} fill sizes="96px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={a.status} />
            <span className="text-xs font-semibold tracking-wider text-muted uppercase">{a.specialtyName}</span>
          </div>
          <h3 className="mt-3 truncate font-display text-3xl leading-none text-navy">
            <Link href={`/dashboard/appointments/${a.id}`} className="transition-colors hover:text-brand-deep">
              {a.doctorName}
            </Link>
          </h3>
          <ul className="mt-4 grid gap-2 text-sm text-navy-soft sm:grid-cols-2">
            <li className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-brand" aria-hidden />
              {formatDate(a.date, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </li>
            <li className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-brand" aria-hidden />
              {formatTime(a.time)}
            </li>
            <li className="flex items-center gap-2">
              {a.visitType === "video" ? (
                <Video className="h-4 w-4 text-brand" aria-hidden />
              ) : (
                <Building2 className="h-4 w-4 text-brand" aria-hidden />
              )}
              {visitLabel}
            </li>
            <li className="flex items-center gap-2 truncate">
              <MapPin className="h-4 w-4 shrink-0 text-brand" aria-hidden />
              <span className="truncate">{a.clinicName}</span>
            </li>
          </ul>
          {a.reviewRating && (
            <div className="mt-4 flex items-center gap-2 text-sm text-navy-soft">
              <Stars value={a.reviewRating} size={14} /> You rated this visit
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-2 md:flex-col md:items-end md:justify-between">
        <LinkButton href={`/dashboard/appointments/${a.id}`} variant="light" size="sm">
          View details
        </LinkButton>
        {changeable && (
          <LinkButton href={`/dashboard/appointments/${a.id}/reschedule`} variant="soft" size="sm">
            Reschedule
          </LinkButton>
        )}
        {canReview && (
          <LinkButton href={`/dashboard/appointments/${a.id}#review`} variant="dark" size="sm">
            Leave a review
          </LinkButton>
        )}
        {changeable && (
          <div className="w-full md:mt-auto md:w-auto">
            <CancelAppointment id={a.id} />
          </div>
        )}
      </div>
    </article>
  );
}
