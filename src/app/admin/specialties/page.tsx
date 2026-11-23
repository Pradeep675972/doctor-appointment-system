import type { Metadata } from "next";
import { DeleteSpecialtyButton, SpecialtyForm } from "@/components/admin/AdminForms";
import { Eyebrow } from "@/components/ui/primitives";
import { plural, } from "@/lib/format";
import { specialtyIcon } from "@/lib/icons";
import { getSpecialtiesWithCounts } from "@/lib/queries";

export const metadata: Metadata = { title: "Specialties · Admin" };

export default async function AdminSpecialtiesPage() {
  const rows = await getSpecialtiesWithCounts();

  return (
    <div className="space-y-10">
      <header>
        <Eyebrow>Specialties</Eyebrow>
        <h1 className="mt-6 font-display text-5xl leading-none tracking-tight text-navy sm:text-6xl">
          Medical <span className="text-brand italic">specialties.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-navy-soft">
          These categories power the public specialty browser and search filters. A specialty can only be removed once it
          has no doctors assigned.
        </p>
      </header>

      <div className="grid gap-8 xl:grid-cols-12">
        <div className="grid gap-5 sm:grid-cols-2 xl:col-span-8">
          {rows.map((s) => {
            const Icon = specialtyIcon(s.icon);
            return (
              <article key={s.id} className="flex flex-col rounded-4xl border border-line bg-white p-6 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky text-brand-deep">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <DeleteSpecialtyButton id={s.id} doctorCount={s.doctorCount} />
                </div>
                <h2 className="mt-6 font-display text-3xl leading-none text-navy">{s.name}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-soft">{s.description}</p>
                <p className="mt-5 text-xs font-semibold tracking-wider text-muted uppercase">{plural(s.doctorCount, "doctor")}</p>
              </article>
            );
          })}
        </div>

        <aside className="xl:col-span-4">
          <div className="sticky top-28 rounded-5xl border border-line bg-white p-8 shadow-lift">
            <h2 className="font-display text-3xl text-navy">Add a specialty</h2>
            <p className="mt-2 mb-8 text-sm text-navy-soft">Choose a name, a short description and an icon for the public site.</p>
            <SpecialtyForm />
          </div>
        </aside>
      </div>
    </div>
  );
}
