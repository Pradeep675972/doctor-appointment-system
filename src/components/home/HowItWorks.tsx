"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BadgeCheck, CalendarClock, Search } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { LinkButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/primitives";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    icon: Search,
    title: "Choose your specialist",
    body: "Compare verified profiles, reviews and languages. Filter by location, specialty or the next day you are free.",
  },
  {
    icon: CalendarClock,
    title: "Pick a time that fits",
    body: "See live availability in the clinic's local time. Every slot is locked the moment it is requested, so nobody double-books.",
  },
  {
    icon: BadgeCheck,
    title: "Confirm and manage",
    body: "Receive a clear confirmation, reschedule with a tap and keep your full visit history, notes and reviews in one place.",
  },
];

export function HowItWorks() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-rail]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-steps]", start: "top 70%", end: "bottom 65%", scrub: true },
        },
      );
      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step) => {
        gsap.fromTo(
          step,
          { opacity: 0.2, x: 30 },
          {
            opacity: 1,
            x: 0,
            ease: "none",
            scrollTrigger: { trigger: step, start: "top 85%", end: "top 45%", scrub: true },
          },
        );
      });
      gsap.utils.toArray<HTMLElement>("[data-step-number]").forEach((node) => {
        gsap.fromTo(
          node,
          { scale: 0.6, backgroundColor: "#eaf4ff", color: "#2678e8" },
          {
            scale: 1,
            backgroundColor: "#2678e8",
            color: "#ffffff",
            ease: "power2.out",
            scrollTrigger: { trigger: node, start: "top 75%", toggleActions: "play none none reverse" },
          },
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section id="how-it-works" ref={root} className="scroll-mt-24 bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-12 lg:px-10">
        <div className="lg:sticky lg:top-32 lg:col-span-5 lg:self-start">
          <Eyebrow>How booking works</Eyebrow>
          <h2 className="mt-6 font-display text-5xl leading-none tracking-tight text-balance text-navy sm:text-6xl">
            Three calm steps from <span className="text-brand italic">worry</span> to care.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-navy-soft">
            Vitalis removes the phone tag and waiting-room guesswork. You always know who you are seeing, when, and what
            happens next.
          </p>
          <div className="mt-10">
            <LinkButton href="/doctors?sort=soonest" arrow magnetic>
              Start in 60 seconds
            </LinkButton>
          </div>
        </div>

        <div data-steps className="relative lg:col-span-7">
          <div aria-hidden className="absolute top-6 bottom-6 left-6 w-px bg-line">
            <div data-rail className="h-full w-full origin-top bg-linear-to-b from-brand to-mint" />
          </div>

          <ol className="space-y-6">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} data-step className="relative pl-20">
                  <span
                    data-step-number
                    className="absolute top-6 left-0 grid h-12 w-12 place-items-center rounded-2xl bg-sky font-display text-xl text-brand"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="group rounded-4xl border border-line bg-white p-8 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift sm:p-10">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mist text-navy transition-all duration-500 group-hover:rotate-6 group-hover:bg-navy group-hover:text-white">
                      <Icon className="h-6 w-6" aria-hidden />
                    </span>
                    <h3 className="mt-6 font-display text-4xl leading-none text-navy">{step.title}</h3>
                    <p className="mt-4 text-base leading-relaxed text-navy-soft">{step.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
