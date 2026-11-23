import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, CalendarDays, CheckCircle2, Clock3, MapPin, Phone, Video } from "lucide-react";
import { CancelAppointment } from "@/components/dashboard/AppointmentCard";
import { ReviewForm } from "@/components/dashboard/ReviewForm";
import { FadeIn, GrowBar } from "@/components/motion/FadeIn";
import { LinkButton } from "@/components/ui/Button";
import { StatusBadge, Stars } from "@/components/ui/primitives";
import { isChangeable } from "@/lib/appointment-rules";
import { requireUser } from "@/lib/auth";
import { formatDate, formatTime, VISIT_TYPES } from "@/lib/format";
import { getAppointmentForUser } from "@/lib/queries";

export const metadata: Metadata = { title: "Appointment details" };

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ booked?: string; rescheduled?: string }>;

const STEPS = ["Requested", "Confirmed", "Completed"];

export default async function AppointmentDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id: rawId } = await params;
  const sp = await searchParams;
  const id = Number(rawId);
  const user = await requireUser(`/dashboard/appointments/${rawId}`);
  if (!Number.isInteger(id)) notFound();

  const a = await getAppointmentForUser(id, user.id);
  if (!a) notFound();

  const changeable = isChangeable(a);
  const stepIndex = a.status === "completed" ? 2 : a.status === "confirmed" ? 1 : a.status === "pending" ? 0 : -1;
  const visitLabel = VISIT_TYPES.find((v) => v.value === a.visitType)?.label ?? "In person";

  return (
    <div className="space-y-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/dashboard" className="transition-colors hover:text-brand-deep">
          Dashboard
        </Link>
        <span aria-hidden> / </span>
        <span className="font-semibold text-navy">Appointment #{a.id}</span>
      </nav>

      {sp.booked === "1" && (
        <FadeIn role="status" className="flex items-start gap-4 rounded-4xl bg-mint-soft p-6 text-mint-deep">
          <CheckCircle2 className="mt-1 h-7 w-7 shrink-0" aria-hidden />
          <div>
            <p className="font-display text-3xl text-navy">Request sent. Thank you.</p>
            <p className="mt-2 text-navy-soft">
              Your time is reserved while the clinic reviews it. You will see the status update here.
            </p>
          </div>
        </FadeIn>
      )}
      {sp.rescheduled === "1" && (
        <FadeIn role="status" className="flex items-start gap-4 rounded-4xl bg-sky p-6 text-brand-deep">
          <CalendarDays className="mt-1 h-7 w-7 shrink-0" aria-hidden />
          <div>
            <p className="font-display text-3xl text-navy">New time saved.</p>
            <p className="mt-2 text-navy-soft">The updated request has been sent back to the clinic for confirmation.</p>
          </div>
        </FadeIn>
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        <section className="space-y-8 rounded-5xl border border-line bg-white p-6 shadow-soft sm:p-10 lg:col-span-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <span className="relative h-28 w-28 shrink-0 overflow-hidden rounded-4xl">
              <Image src={a.doctorPhoto} alt={a.doctorName} fill sizes="112px" className="object-cover" />
            </span>
            <div>
              <StatusBadge status={a.status} />
              <h1 className="mt-4 font-display text-5xl leading-none tracking-tight text-navy">{a.doctorName}</h1>
              <p className="mt-3 text-navy-soft">
                {a.specialtyName} · {a.doctorTitle}
              </p>
            </div>
          </div>

          {stepIndex >= 0 ? (
            <ol className="grid grid-cols-3 gap-3" aria-label="Appointment progress">
              {STEPS.map((step, index) => {
                const done = index <= stepIndex;
                return (
                  <li key={step} className="space-y-3">
                    <GrowBar done={done} delay={index * 0.15} />
                    <p className={`text-sm font-semibold ${done ? "text-navy" : "text-muted"}`}>{step}</p>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="rounded-3xl bg-mist p-5 text-navy-soft">
              This request was {a.status === "rejected" ? "declined by the clinic" : "closed"}. You can book a new time
              with any specialist at any time.
            </p>
          )}

          <dl className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl bg-mist p-5">
              <dt className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted uppercase">
                <CalendarDays className="h-4 w-4" aria-hidden /> Date
              </dt>
              <dd className="mt-2 font-semibold text-navy">
                {formatDate(a.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </dd>
            </div>
            <div className="rounded-3xl bg-mist p-5">
              <dt className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted uppercase">
                <Clock3 className="h-4 w-4" aria-hidden /> Time
              </dt>
              <dd className="mt-2 font-semibold text-navy">{formatTime(a.time)}</dd>
            </div>
            <div className="rounded-3xl bg-mist p-5">
              <dt className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted uppercase">
                {a.visitType === "video" ? (
                  <Video className="h-4 w-4" aria-hidden />
                ) : (
                  <Building2 className="h-4 w-4" aria-hidden />
                )}
                Visit type
              </dt>
              <dd className="mt-2 font-semibold text-navy">{visitLabel}</dd>
            </div>
            <div className="rounded-3xl bg-mist p-5">
              <dt className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted uppercase">
                <MapPin className="h-4 w-4" aria-hidden /> Location
              </dt>
              <dd className="mt-2 font-semibold text-navy">{a.clinicName}</dd>
              <dd className="mt-1 text-sm text-navy-soft">{a.clinicAddress}</dd>
            </div>
          </dl>

          {a.reason && (
            <div>
              <p className="text-xs font-bold tracking-widest text-muted uppercase">Reason for visit</p>
              <p className="mt-2 text-navy-soft">{a.reason}</p>
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:gap-6">
            <a
              href={`tel:${a.clinicPhone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-deep transition-colors hover:text-navy"
            >
              <Phone className="h-4 w-4" aria-hidden /> Call the clinic
            </a>
            <Link
              href={`/doctors/${a.doctorSlug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-deep transition-colors hover:text-navy"
            >
              View doctor profile
            </Link>
          </div>
        </section>

        <aside className="space-y-6 lg:col-span-5">
          <div className="rounded-5xl border border-line bg-white p-6 shadow-soft sm:p-8">
            <p className="font-display text-3xl text-navy">Manage this visit</p>
            <p className="mt-2 text-sm text-navy-soft">
              Choosing a new time reserves it for you immediately, and the old slot is released.
            </p>
            <div className="mt-6 space-y-4">
              {changeable ? (
                <>
                  <LinkButton href={`/dashboard/appointments/${a.id}/reschedule`} variant="soft" block arrow>
                    Reschedule appointment
                  </LinkButton>
                  <CancelAppointment id={a.id} />
                </>
              ) : (
                <p className="rounded-3xl bg-mist p-5 text-sm text-navy-soft">
                  This visit is {a.status === "completed" ? "complete" : "no longer active"}, so changes are unavailable.
                </p>
              )}
            </div>
          </div>

          {a.status === "completed" && (
            <div id="review" className="scroll-mt-28 rounded-5xl border border-line bg-white p-6 shadow-soft sm:p-8">
              {a.reviewId ? (
                <>
                  <p className="font-display text-3xl text-navy">Thanks for your review</p>
                  <div className="mt-4">
                    <Stars value={a.reviewRating ?? 0} size={22} />
                  </div>
                  <p className="mt-4 text-sm text-navy-soft">Your feedback helps other patients choose with confidence.</p>
                </>
              ) : (
                <ReviewForm appointmentId={a.id} doctorName={a.doctorName} />
              )}
            </div>
          )}

          <div className="rounded-5xl bg-navy p-6 text-white sm:p-8">
            <p className="text-xs font-bold tracking-widest text-mint uppercase">Good to know</p>
            <ul className="mt-5 space-y-3 text-sm text-white/80">
              <li>Arrive five minutes early and bring any recent test results.</li>
              <li>Video visits: test your camera and connection before the start time.</li>
              <li>Need help? Call the clinic or email care@vitalis.health.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
