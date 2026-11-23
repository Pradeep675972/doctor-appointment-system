import type { Metadata } from "next";
import Form from "next/form";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar, Eyebrow, EmptyState } from "@/components/ui/primitives";
import { formatDate } from "@/lib/format";
import { getAdminPatients } from "@/lib/queries";

export const metadata: Metadata = { title: "Patients · Admin" };

export default async function AdminPatientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const patients = await getAdminPatients(q || undefined);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>Patients</Eyebrow>
          <h1 className="mt-6 font-display text-5xl leading-none tracking-tight text-navy sm:text-6xl">
            Patient <span className="text-brand italic">directory.</span>
          </h1>
          <p className="mt-4 text-navy-soft">{patients.length} patients {q ? `matching “${q}”` : "registered"}.</p>
        </div>
        <Form action="/admin/patients" className="flex w-full gap-3 md:w-96">
          <label className="relative flex-1">
            <span className="sr-only">Search patients</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Name or email"
              className="w-full rounded-full border border-line bg-white py-3 pr-4 pl-11 text-sm text-navy outline-none transition-all duration-300 focus:border-brand focus:ring-4 focus:ring-brand/15"
            />
          </label>
          <Button type="submit" variant="dark" size="sm">
            Search
          </Button>
        </Form>
      </header>

      {patients.length === 0 ? (
        <EmptyState title="No patients found" body="Try a different name or email address." />
      ) : (
        <div className="overflow-hidden rounded-4xl border border-line bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left text-sm">
              <thead className="bg-mist text-xs tracking-wider text-muted uppercase">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Patient</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Phone</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Joined</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Visits</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Last visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {patients.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-mist/60">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar name={p.fullName} size="sm" />
                        <div>
                          <p className="font-semibold text-navy">{p.fullName}</p>
                          <p className="text-xs text-muted">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-navy-soft">{p.phone || "—"}</td>
                    <td className="px-6 py-4 text-navy-soft">{formatDate(p.createdAt.toISOString().slice(0, 10), { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td className="px-6 py-4 font-semibold text-navy">{p.total}</td>
                    <td className="px-6 py-4 text-navy-soft">{p.lastDate ? formatDate(p.lastDate, { month: "short", day: "numeric", year: "numeric" }) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
