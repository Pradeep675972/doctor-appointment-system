import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, CheckCircle2, Star } from "lucide-react";
import { AppointmentTabs } from "@/components/dashboard/AppointmentTabs";
import { LinkButton } from "@/components/ui/Button";
import { Eyebrow, StatusBadge } from "@/components/ui/primitives";
import { requireUser } from "@/lib/auth";
import { firstName, formatDate, formatTime, todayISO } from "@/lib/format";
import { getPatientAppointments } from "@/lib/queries";

export const metadata: Metadata = { title: "Dashboard" };

function StatCard({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: number }) {
  return (
    <div className="group rounded-4xl border border-line bg-white p-6 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky text-brand-deep transition-transform duration-500 group-hover:rotate-6">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <p className="mt-6 font-display text-5xl leading-none text-navy">{value}</p>
      <p className="mt-2 text-sm font-medium text-muted">{label}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const rows = await getPatientAppointments(user.id);
  const today = todayISO();

  const isActive = (status: string) => status === "pending" || status === "confirmed";
  const upcoming = rows
    .filter((r) => isActive(r.status) && r.date >= today)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const previous = rows
    .filter((r) => r.status === "completed" || (isActive(r.status) && r.date < today))
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  const cancelled = rows.filter((r) => r.status === "cancelled" || r.status === "rejected");
  const completedCount = rows.filter((r) => r.status === "completed").length;
  const reviewedCount = rows.filter((r) => r.reviewId).length;
  const next = upcoming[0];

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>Patient dashboard</Eyebrow>
          <h1 className="mt-6 font-display text-5xl leading-none tracking-tight text-navy sm:text-6xl">
            Welcome back, <span className="text-brand italic">{firstName(user.fullName)}.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-navy-soft">
            Your visits, their status and your records, all in one calm place.
          </p>
        </div>
        <LinkButton href="/doctors?sort=soonest" arrow magnetic>
          Book new appointment
        </LinkButton>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard icon={CalendarDays} label="Upcoming visits" value={upcoming.length} />
        <StatCard icon={CheckCircle2} label="Completed visits" value={completedCount} />
        <StatCard icon={Star} label="Reviews you shared" value={reviewedCount} />
      </div>

      {next ? (
        <Link
          href={`/dashboard/appointments/${next.id}`}
          className="mesh-navy group relative flex flex-col gap-8 overflow-hidden rounded-5xl bg-navy p-8 text-white shadow-lift transition-transform duration-500 hover:-translate-y-1 sm:p-10 md:flex-row md:items-center"
        >
          <span className="relative h-28 w-28 overflow-hidden rounded-4xl ring-4 ring-white/10">
            <Image src={next.doctorPhoto} alt="" fill sizes="112px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-bold tracking-widest text-mint uppercase">Next visit</p>
              <StatusBadge status={next.status} />
            </div>
            <p className="mt-3 font-display text-4xl leading-none">{next.doctorName}</p>
            <p className="mt-3 text-white/75">
              {formatDate(next.date, { weekday: "long", month: "long", day: "numeric" })} at {formatTime(next.time)} ·{" "}
              {next.clinicName}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 justify-self-start rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy transition-all duration-300 group-hover:gap-3 md:justify-self-end">
            View visit <ArrowUpRight className="h-4 w-4" aria-hidden />
          </span>
        </Link>
      ) : (
        <div className="rounded-5xl border border-dashed border-line bg-white p-10 text-center">
          <p className="font-display text-3xl text-navy">Nothing scheduled yet</p>
          <p className="mx-auto mt-3 max-w-md text-navy-soft">Choose a specialist and pick a time that suits you. It takes less than a minute.</p>
          <div className="mt-6 flex justify-center">
            <LinkButton href="/doctors?sort=soonest" arrow>
              Find an available doctor
            </LinkButton>
          </div>
        </div>
      )}

      <section aria-labelledby="visits-heading" className="space-y-6">
        <h2 id="visits-heading" className="font-display text-4xl text-navy">
          Your visits
        </h2>
        <AppointmentTabs upcoming={upcoming} previous={previous} cancelled={cancelled} />
      </section>
    </div>
  );
}
