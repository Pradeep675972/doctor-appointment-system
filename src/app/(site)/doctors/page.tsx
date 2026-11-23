import type { Metadata } from "next";
import { Suspense } from "react";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { DoctorFilters } from "@/components/doctors/DoctorFilters";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, Eyebrow } from "@/components/ui/primitives";
import { plural } from "@/lib/format";
import { getCityOptions, getSpecialtiesWithCounts, listDoctors } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Find a doctor",
  description: "Search verified specialists by specialty, location and real-time availability.",
};

type SearchParams = Promise<{
  q?: string;
  specialty?: string;
  city?: string;
  date?: string;
  availableSoon?: string;
  sort?: string;
}>;

export default async function DoctorsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const validDate = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : undefined;

  const [doctors, specialties, cities] = await Promise.all([
    listDoctors({
      q: sp.q,
      specialty: sp.specialty,
      city: sp.city,
      date: validDate,
      availableSoon: sp.availableSoon === "1",
      sort: sp.sort,
    }),
    getSpecialtiesWithCounts(),
    getCityOptions(),
  ]);

  const activeSpecialty = specialties.find((s) => s.slug === sp.specialty);
  const heading = activeSpecialty ? activeSpecialty.name : sp.city ? `Doctors in ${sp.city}` : "Doctors you can trust";

  return (
    <>
      <section className="mesh-hero relative overflow-hidden pt-32 pb-14 lg:pt-40">
        <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <Eyebrow>Find a specialist</Eyebrow>
          <h1 className="mt-6 font-display text-6xl leading-none tracking-tight text-navy sm:text-7xl">{heading}</h1>
          <p className="mt-6 max-w-2xl text-lg text-navy-soft">
            {plural(doctors.length, "specialist")} match your search. Every profile shows real reviews, transparent fees
            and live availability.
          </p>
        </div>
      </section>

      <section className="sticky top-4 z-20 mx-auto max-w-7xl px-6 pb-10 lg:px-10">
        <Suspense fallback={<div className="h-40 rounded-5xl bg-white shadow-lift" />}>
          <DoctorFilters
            specialties={specialties.map((s) => ({ slug: s.slug, name: s.name }))}
            cities={cities}
          />
        </Suspense>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-28 lg:px-10">
        {doctors.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No specialists match these filters"
            body="Try another specialty, location or date, or clear the filters to see everyone."
            action={
              <LinkButton href="/doctors" variant="dark">
                Clear filters
              </LinkButton>
            }
          />
        )}
      </section>
    </>
  );
}
