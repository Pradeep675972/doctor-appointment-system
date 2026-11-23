import Form from "next/form";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { SectionHeading } from "@/components/ui/primitives";

export function SearchDoctors({
  specialties,
  cities,
}: {
  specialties: { slug: string; name: string }[];
  cities: string[];
}) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section id="search" className="scroll-mt-24 bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl items-start gap-14 px-6 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="Find your match"
            title={
              <>
                Search by need, <span className="text-brand italic">place</span> and time.
              </>
            }
            description="Filter verified specialists by what you need, where you want to be seen and when you are free."
          />
          <div className="mt-10 flex flex-wrap gap-2">
            {specialties.slice(0, 6).map((s) => (
              <Link
                key={s.slug}
                href={`/doctors?specialty=${s.slug}`}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-navy-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-brand hover:text-brand-deep"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7">
          <Form
            action="/doctors"
            className="relative overflow-hidden rounded-5xl border border-line bg-white p-6 shadow-lift sm:p-10"
          >
            <div aria-hidden className="mesh-hero absolute inset-0 -z-0 opacity-70" />
            <div className="relative grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  id="search-q"
                  name="q"
                  label="Doctor, condition or keyword"
                  placeholder="e.g. migraine, Dr. Chen, skin check"
                />
              </div>
              <Select id="search-specialty" name="specialty" label="Specialty">
                <option value="">All specialties</option>
                {specialties.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </Select>
              <Select id="search-city" name="city" label="Location">
                <option value="">Any location</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </Select>
              <div className="sm:col-span-2">
                <Input
                  id="search-date"
                  name="date"
                  type="date"
                  min={today}
                  label="Preferred date"
                  hint="Shows specialists with open slots on that day."
                />
              </div>
            </div>
            <div className="relative mt-8 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted">Live availability for the next 14 days.</p>
              <Button type="submit" variant="dark" size="lg" arrow magnetic>
                <Search className="h-4 w-4" aria-hidden />
                Search doctors
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </section>
  );
}
