import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RevealItem, RevealStagger } from "@/components/motion/Reveal";
import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/primitives";
import { specialtyIcon } from "@/lib/icons";
import { plural } from "@/lib/format";

export type SpecialtyItem = {
  name: string;
  slug: string;
  icon: string;
  description: string;
  doctorCount: number;
};

export function Specialties({ items }: { items: SpecialtyItem[] }) {
  return (
    <section id="specialties" className="scroll-mt-24 bg-mist py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Medical specialties"
            title={
              <>
                Expert care across <span className="text-brand italic">every</span> discipline.
              </>
            }
            description="From the first checkup to specialist treatment, choose the expertise you need and see who is available."
          />
          <LinkButton href="/doctors" variant="light" arrow>
            View all specialists
          </LinkButton>
        </div>

        <RevealStagger className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((specialty) => {
            const Icon = specialtyIcon(specialty.icon);
            return (
              <RevealItem key={specialty.slug} className="h-full">
                <Link
                  href={`/doctors?specialty=${specialty.slug}`}
                  className="group relative flex h-full min-h-72 flex-col overflow-hidden rounded-4xl border border-line bg-white p-6 shadow-soft transition-all duration-500 ease-premium hover:-translate-y-2 hover:border-brand/30 hover:shadow-lift"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-sky transition-transform duration-700 ease-premium group-hover:scale-150"
                  />
                  <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-sky text-brand-deep transition-all duration-500 group-hover:rotate-12 group-hover:bg-brand group-hover:text-white">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="relative mt-8 font-display text-3xl leading-none text-navy">{specialty.name}</h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-navy-soft">{specialty.description}</p>
                  <p className="relative mt-auto flex items-center gap-2 pt-8 text-sm font-semibold text-brand-deep">
                    {plural(specialty.doctorCount, "specialist")}
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden />
                  </p>
                </Link>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}
