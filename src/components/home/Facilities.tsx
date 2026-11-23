"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { Clock, MapPin, Phone, Stethoscope } from "lucide-react";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/primitives";
import { plural } from "@/lib/format";

gsap.registerPlugin(ScrollTrigger);

export type ClinicItem = {
  id: number;
  slug: string;
  name: string;
  city: string;
  country: string;
  address: string;
  image: string;
  description: string;
  phone: string;
  openingHours: string;
  features: string[];
  doctorCount: number;
};

export function Facilities({ clinics }: { clinics: ClinicItem[] }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-facility-img]").forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -10 },
          {
            yPercent: 10,
            ease: "none",
            scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="facilities" ref={root} className="scroll-mt-24 bg-mist py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Facilities"
          title={
            <>
              Calm clinics, <span className="text-brand italic">close to home.</span>
            </>
          }
          description="Light-filled consulting rooms, on-site diagnostics and thoughtful details in every city we serve."
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          {clinics.map((clinic, index) => (
            <article
              key={clinic.id}
              className={`group flex flex-col rounded-5xl border border-line bg-white p-4 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-lift sm:p-5 ${
                index % 2 === 1 ? "lg:mt-24" : ""
              }`}
            >
              <motion.div
                initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
                whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}
                className="relative aspect-4/3 overflow-hidden rounded-4xl"
              >
                <div data-facility-img className="absolute inset-0 scale-110">
                  <Image
                    src={clinic.image}
                    alt={`${clinic.name} reception and waiting area`}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover transition-transform duration-1000 ease-premium group-hover:scale-105"
                  />
                </div>
                <span className="glass absolute top-4 left-4 rounded-full px-4 py-2 text-sm font-semibold text-navy">
                  {clinic.city}, {clinic.country}
                </span>
              </motion.div>

              <div className="flex flex-1 flex-col px-3 pt-8 pb-4 sm:px-4">
                <h3 className="font-display text-4xl leading-none text-navy">{clinic.name}</h3>
                <p className="mt-4 text-base leading-relaxed text-navy-soft">{clinic.description}</p>

                <ul className="mt-6 grid gap-3 text-sm text-navy-soft sm:grid-cols-2">
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                    {clinic.address}
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                    {clinic.openingHours}
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="h-4 w-4 shrink-0 text-brand" aria-hidden />
                    <a href={`tel:${clinic.phone.replace(/\s+/g, "")}`} className="transition-colors hover:text-brand-deep">
                      {clinic.phone}
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <Stethoscope className="h-4 w-4 shrink-0 text-brand" aria-hidden />
                    {plural(clinic.doctorCount, "specialist")}
                  </li>
                </ul>

                <div className="mt-6 flex flex-wrap gap-2">
                  {clinic.features.map((feature) => (
                    <span key={feature} className="rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-navy-soft">
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-8">
                  <LinkButton href={`/doctors?city=${encodeURIComponent(clinic.city)}`} variant="dark" arrow>
                    Find doctors in {clinic.city}
                  </LinkButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
