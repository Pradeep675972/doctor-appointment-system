import type { Metadata } from "next";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { Avatar, Eyebrow, StatusBadge } from "@/components/ui/primitives";
import { formatFee } from "@/lib/format";
import { getAdminDoctors } from "@/lib/queries";

export const metadata: Metadata = { title: "Doctors · Admin" };

export default async function AdminDoctorsPage() {
  const rows = await getAdminDoctors();

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>Doctors</Eyebrow>
          <h1 className="mt-6 font-display text-5xl leading-none tracking-tight text-navy sm:text-6xl">
            Your <span className="text-brand italic">specialists.</span>
          </h1>
          <p className="mt-4 text-navy-soft">
            {rows.length} doctors listed. Edit profiles, fees and weekly availability from each record.
          </p>
        </div>
        <LinkButton href="/admin/doctors/new" arrow magnetic>
          Add doctor
        </LinkButton>
      </header>

      <div className="overflow-hidden rounded-4xl border border-line bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left text-sm">
            <thead className="bg-mist text-xs tracking-wider text-muted uppercase">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Doctor</th>
                <th scope="col" className="px-6 py-4 font-semibold">Specialty</th>
                <th scope="col" className="px-6 py-4 font-semibold">Clinic</th>
                <th scope="col" className="px-6 py-4 font-semibold">Fee</th>
                <th scope="col" className="px-6 py-4 font-semibold">Upcoming</th>
                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                <th scope="col" className="px-6 py-4 text-right font-semibold"><span className="sr-only">Manage</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((d) => (
                <tr key={d.id} className="transition-colors hover:bg-mist/60">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar name={d.fullName} src={d.photo} size="md" />
                      <div>
                        <p className="font-semibold text-navy">{d.fullName}</p>
                        <p className="text-xs text-muted">{d.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-navy-soft">{d.specialtyName}</td>
                  <td className="px-6 py-4 text-navy-soft">{d.clinicName}</td>
                  <td className="px-6 py-4 font-semibold text-navy">{formatFee(d.consultationFee)}</td>
                  <td className="px-6 py-4 text-navy-soft">{d.upcomingCount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${d.isActive ? "bg-mint-soft text-mint-deep" : "bg-mist text-muted"}`}>
                      {d.isActive ? "Accepting" : "Paused"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/doctors/${d.id}`} className="inline-flex rounded-full bg-sky px-4 py-2 text-xs font-semibold text-brand-deep transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand hover:text-white">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
