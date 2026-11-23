import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, ClipboardCheck, Stethoscope, Users } from "lucide-react";
import { StatusActions } from "@/components/admin/AdminForms";
import { LinkButton } from "@/components/ui/Button";
import { Avatar, Eyebrow, StatusBadge } from "@/components/ui/primitives";
import { formatDate, formatTime } from "@/lib/format";
import { getAdminOverview } from "@/lib/queries";

export const metadata: Metadata = { title: "Admin overview" };

const SEGMENTS = [
  { key: "pending", label: "Awaiting", color: "bg-amber" },
  { key: "confirmed", label: "Confirmed", color: "bg-mint" },
  { key: "completed", label: "Completed", color: "bg-brand" },
  { key: "cancelled", label: "Cancelled", color: "bg-navy/30" },
  { key: "rejected", label: "Declined", color: "bg-rose" },
];

export default async function AdminOverviewPage() {
  const o = await getAdminOverview();
  const max = Math.max(1, ...o.days.map((d) => d.count));
  const total = Math.max(1, o.total);
  const periodTotal = o.days.reduce((sum, d) => sum + d.count, 0);

  const kpis = [
    { label: "Active patients", value: o.patients, icon: Users, href: "/admin/patients" },
    { label: "Listed doctors", value: o.doctors, icon: Stethoscope, href: "/admin/doctors" },
    { label: "Visits today", value: o.todayCount, icon: CalendarClock, href: "/admin/appointments" },
    { label: "Awaiting approval", value: o.pendingCount, icon: ClipboardCheck, href: "/admin/appointments?status=pending", highlight: true },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>Administration</Eyebrow>
          <h1 className="mt-6 font-display text-5xl leading-none tracking-tight text-navy sm:text-6xl">
            Clinic <span className="text-brand italic">overview.</span>
          </h1>
          <p className="mt-4 max-w-xl text-navy-soft">Bookings, approvals and capacity across every Vitalis clinic.</p>
        </div>
        <LinkButton href="/admin/appointments?status=pending" variant="dark" arrow>
          Review approvals
        </LinkButton>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className={`group rounded-4xl border p-6 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift ${
                kpi.highlight ? "border-amber/40 bg-amber-soft" : "border-line bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`grid h-11 w-11 place-items-center rounded-2xl transition-transform duration-500 group-hover:rotate-6 ${kpi.highlight ? "bg-white text-amber-deep" : "bg-sky text-brand-deep"}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-xs font-semibold text-muted opacity-0 transition-opacity group-hover:opacity-100">View →</span>
              </div>
              <p className="mt-6 font-display text-5xl leading-none text-navy">{kpi.value.toLocaleString("en-US")}</p>
              <p className="mt-2 text-sm font-medium text-muted">{kpi.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <section className="rounded-5xl border border-line bg-white p-6 shadow-soft sm:p-8 xl:col-span-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-widest text-muted uppercase">Booking statistics</p>
              <h2 className="mt-2 font-display text-3xl text-navy">Requests, last 14 days</h2>
            </div>
            <p className="text-sm text-muted">
              <span className="font-semibold text-navy">{periodTotal}</span> requests in this period
            </p>
          </div>
          <div className="mt-10 flex h-64 items-end gap-2 sm:gap-3" role="img" aria-label="Bar chart of booking requests per day">
            {o.days.map((day) => (
              <div key={day.date} className="flex h-full flex-1 flex-col justify-end gap-3">
                <div className="relative flex-1 overflow-hidden rounded-t-2xl bg-mist">
                  <div
                    className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-linear-to-t from-brand to-mint transition-all duration-700 ease-premium hover:opacity-80"
                    style={{ height: `${Math.max(day.count ? 6 : 0, (day.count / max) * 100)}%` }}
                    title={`${day.label}: ${day.count} requests`}
                  />
                </div>
                <span className="text-center text-xs font-medium text-muted">{day.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8 rounded-5xl border border-line bg-white p-6 shadow-soft sm:p-8 xl:col-span-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-muted uppercase">Status mix</p>
            <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-mist">
              {SEGMENTS.map((segment) => {
                const count = o.byStatus[segment.key] ?? 0;
                return (
                  <div
                    key={segment.key}
                    className={`${segment.color} h-full transition-all duration-700`}
                    style={{ width: `${(count / total) * 100}%` }}
                    title={`${segment.label}: ${count}`}
                  />
                );
              })}
            </div>
            <ul className="mt-5 grid grid-cols-2 gap-3 text-sm">
              {SEGMENTS.map((segment) => (
                <li key={segment.key} className="flex items-center justify-between gap-2 text-navy-soft">
                  <span className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${segment.color}`} aria-hidden />
                    {segment.label}
                  </span>
                  <span className="font-semibold text-navy">{o.byStatus[segment.key] ?? 0}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold tracking-widest text-muted uppercase">Demand by specialty</p>
            <ul className="mt-5 space-y-4">
              {o.specialties.slice(0, 5).map((s) => {
                const top = Math.max(1, o.specialties[0]?.total ?? 1);
                return (
                  <li key={s.name}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-navy">{s.name}</span>
                      <span className="text-muted">{s.total}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-mist">
                      <div className="h-full rounded-full bg-linear-to-r from-brand to-mint transition-all duration-700" style={{ width: `${(s.total / top) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-5xl border border-line bg-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-6 sm:p-8">
          <div>
            <p className="text-xs font-bold tracking-widest text-muted uppercase">Approval queue</p>
            <h2 className="mt-2 font-display text-3xl text-navy">Requests waiting for a decision</h2>
          </div>
          <Link href="/admin/appointments?status=pending" className="text-sm font-semibold text-brand-deep transition-colors hover:text-navy">
            Open full queue →
          </Link>
        </div>
        {o.pending.length === 0 ? (
          <p className="p-8 text-center text-navy-soft">All caught up. No requests are waiting for approval.</p>
        ) : (
          <ul className="divide-y divide-line">
            {o.pending.map((r) => (
              <li key={r.id} className="flex flex-col gap-5 p-6 transition-colors hover:bg-mist/50 md:flex-row md:items-center md:justify-between sm:px-8">
                <div className="flex items-center gap-4">
                  <Avatar name={r.patientName} size="md" />
                  <div>
                    <p className="font-semibold text-navy">{r.patientName}</p>
                    <p className="text-sm text-navy-soft">
                      {r.doctorName} · {r.specialtyName}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {formatDate(r.date, { weekday: "short", month: "short", day: "numeric" })} at {formatTime(r.time)} ·{" "}
                      {r.visitType === "video" ? "Video" : "In person"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={r.status} />
                  <StatusActions appointmentId={r.id} status={r.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
