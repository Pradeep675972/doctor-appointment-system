import type { Metadata } from "next";
import Link from "next/link";
import { StatusActions } from "@/components/admin/AdminForms";
import { Eyebrow, EmptyState, StatusBadge } from "@/components/ui/primitives";
import { formatDate, formatTime, VISIT_TYPES } from "@/lib/format";
import { getAdminAppointments } from "@/lib/queries";

export const metadata: Metadata = { title: "Appointments · Admin" };

const TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Awaiting" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected", label: "Declined" },
];

export default async function AdminAppointmentsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const status = TABS.some((t) => t.value === sp.status) ? (sp.status ?? "") : "";
  const rows = await getAdminAppointments(status || undefined);

  return (
    <div className="space-y-8">
      <header>
        <Eyebrow>Appointments</Eyebrow>
        <h1 className="mt-6 font-display text-5xl leading-none tracking-tight text-navy sm:text-6xl">
          Every visit, <span className="text-brand italic">in one view.</span>
        </h1>
        <p className="mt-4 text-navy-soft">
          {rows.length} {rows.length === 1 ? "appointment" : "appointments"} shown. Approve or decline new requests and close
          out completed visits.
        </p>
      </header>

      <nav aria-label="Filter by status" className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const active = status === tab.value;
          return (
            <Link
              key={tab.label}
              href={tab.value ? `/admin/appointments?status=${tab.value}` : "/admin/appointments"}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                active ? "bg-navy text-white shadow-soft" : "bg-white text-navy-soft ring-1 ring-line hover:text-navy"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <EmptyState title="No appointments here" body="Try another status filter. New requests appear here as soon as they are made." />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-4xl border border-line bg-white shadow-soft md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-left text-sm">
                <thead className="bg-mist text-xs tracking-wider text-muted uppercase">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold">Patient</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Doctor</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Date &amp; time</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Visit</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                    <th scope="col" className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((r) => (
                    <tr key={r.id} className="align-top transition-colors hover:bg-mist/60">
                      <td className="px-6 py-5">
                        <p className="font-semibold text-navy">{r.patientName}</p>
                        <p className="text-xs text-muted">{r.patientEmail}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-navy">{r.doctorName}</p>
                        <p className="text-xs text-muted">{r.clinicName}</p>
                      </td>
                      <td className="px-6 py-5 text-navy-soft">
                        {formatDate(r.date, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                        <br />
                        <span className="text-xs text-muted">{formatTime(r.time)}</span>
                      </td>
                      <td className="px-6 py-5 text-navy-soft">{VISIT_TYPES.find((v) => v.value === r.visitType)?.label}</td>
                      <td className="px-6 py-5">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end">
                          <StatusActions appointmentId={r.id} status={r.status} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 md:hidden">
            {rows.map((r) => (
              <article key={r.id} className="rounded-4xl border border-line bg-white p-6 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-navy">{r.patientName}</p>
                    <p className="text-xs text-muted">{r.patientEmail}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-xs text-muted">Doctor</dt>
                    <dd className="font-medium text-navy">{r.doctorName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">When</dt>
                    <dd className="font-medium text-navy">
                      {formatDate(r.date, { month: "short", day: "numeric" })} · {formatTime(r.time)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 border-t border-line pt-5">
                  <StatusActions appointmentId={r.id} status={r.status} />
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
