import { Counter } from "@/components/motion/Counter";
import { RevealItem, RevealStagger } from "@/components/motion/Reveal";
import type { getPlatformStats } from "@/lib/queries";

type Stats = Awaited<ReturnType<typeof getPlatformStats>>;

export function TrustStrip({ stats, specialties }: { stats: Stats; specialties: string[] }) {
  const items = [
    { value: 48200 + stats.appointments, suffix: "+", label: "Visits booked on Vitalis" },
    { value: stats.doctors, suffix: "", label: "Verified specialists" },
    { value: stats.rating, suffix: "/5", decimals: 1, label: "Average patient rating" },
    { value: stats.clinics, suffix: "", label: "Flagship clinics worldwide" },
  ];
  const marquee = [...specialties, ...specialties];

  return (
    <section id="trust" className="scroll-mt-24 bg-white">
      <div className="overflow-hidden border-y border-line bg-navy py-6" aria-label="Medical specialties">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
          {marquee.map((name, i) => (
            <span key={`${name}-${i}`} className="flex items-center gap-12 font-display text-3xl text-white/85 italic">
              {name}
              <span className="h-2 w-2 rounded-full bg-mint" aria-hidden />
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <RevealStagger className="grid grid-cols-2 gap-px overflow-hidden rounded-5xl border border-line bg-line lg:grid-cols-4">
          {items.map((item) => (
            <RevealItem key={item.label} className="bg-white p-8 sm:p-10">
              <p className="font-display text-5xl leading-none text-navy sm:text-6xl">
                <Counter to={item.value} suffix={item.suffix} decimals={item.decimals ?? 0} />
              </p>
              <p className="mt-4 text-sm font-medium text-navy-soft">{item.label}</p>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
