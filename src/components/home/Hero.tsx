"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CalendarCheck2, Plus, ArrowDown, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { LinkButton } from "@/components/ui/Button";
import { Avatar, Stars } from "@/components/ui/primitives";

gsap.registerPlugin(ScrollTrigger);

export type HeroSlot = { slug: string; name: string; specialty: string; when: string };

export type HeroProps = {
  cities: number;
  rating: number;
  reviewCount: number;
  photos: { src: string; name: string }[];
  slots: HeroSlot[];
};

const HEADLINE = [
  { text: "Your", italic: false },
  { text: "Health,", italic: false },
  { text: "Our", italic: false },
  { text: "Priority.", italic: true },
];

export function Hero({ cities, rating, reviewCount, photos, slots }: HeroProps) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro
        .from("[data-hero-word]", { yPercent: 115, duration: 1.3, stagger: 0.09 })
        .from("[data-hero-fade]", { y: 28, opacity: 0, duration: 1, stagger: 0.12 }, "-=0.9")
        .fromTo(
          "[data-hero-clip]",
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "power3.inOut" },
          0.15,
        )
        .from("[data-hero-image]", { scale: 1.3, duration: 2, ease: "power3.out" }, 0.15)
        .from(
          "[data-hero-card]",
          { opacity: 0, scale: 0.8, y: 40, duration: 1.1, stagger: 0.14, ease: "back.out(1.5)" },
          "-=1.2",
        )
        .from("[data-hero-deco]", { opacity: 0, scale: 0.4, duration: 1.2, stagger: 0.1 }, "-=1");

      const scrub = {
        trigger: el,
        start: "top top",
        end: "bottom top",
        scrub: true,
      };
      gsap.to("[data-hero-parallax]", { yPercent: -10, ease: "none", scrollTrigger: scrub });
      gsap.to("[data-hero-copy]", { yPercent: 10, opacity: 0.25, ease: "none", scrollTrigger: scrub });
      gsap.utils.toArray<HTMLElement>("[data-hero-speed]").forEach((node) => {
        const speed = Number(node.dataset.heroSpeed) || 0;
        gsap.to(node, { y: -140 * speed, ease: "none", scrollTrigger: scrub });
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      aria-labelledby="hero-title"
      className="mesh-hero relative isolate overflow-hidden pt-32 pb-24 lg:min-h-screen lg:pt-36"
    >
      <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <div aria-hidden data-hero-speed="0.2" className="pointer-events-none absolute -top-48 -right-48 -z-10">
        <div className="h-160 w-160 animate-orbit rounded-full border border-dashed border-brand/25" />
      </div>
      <div aria-hidden data-hero-speed="0.35" className="pointer-events-none absolute -bottom-40 -left-40 -z-10">
        <div className="h-120 w-120 rounded-full bg-mint/10 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-12 lg:px-10">
        <div data-hero-copy className="relative z-10 lg:col-span-6">
          <div data-hero-fade>
            <span className="glass inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold text-navy shadow-soft">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-mint" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-mint" />
              </span>
              Live availability across {cities} cities
            </span>
          </div>

          <h1 id="hero-title" className="mt-8 font-display text-6xl leading-none tracking-tight text-navy sm:text-7xl xl:text-8xl">
            {HEADLINE.map((word, i) => (
              <span key={word.text} className="inline-block overflow-hidden pb-3 align-bottom">
                <span
                  data-hero-word
                  className={`inline-block ${word.italic ? "text-brand italic" : ""}`}
                >
                  {word.text}
                </span>
                {i < HEADLINE.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>

          <p data-hero-fade className="mt-8 max-w-xl text-lg leading-relaxed text-navy-soft sm:text-xl">
            Book verified specialists in minutes, see real-time availability in your local time, and manage every
            visit from one calm, beautifully simple platform.
          </p>

          <div data-hero-fade className="mt-10 flex flex-wrap items-center gap-4">
            <LinkButton href="/doctors?sort=soonest" size="lg" magnetic arrow>
              Book an Appointment
            </LinkButton>
            <LinkButton href="/doctors" size="lg" variant="light">
              Explore Doctors
            </LinkButton>
          </div>

          <div data-hero-fade className="mt-12 flex flex-wrap items-center gap-5">
            <div className="flex -space-x-3">
              {photos.slice(0, 4).map((photo) => (
                <Avatar key={photo.src} name={photo.name} src={photo.src} size="md" />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <Stars value={rating} size={16} />
                <span className="font-semibold text-navy">{rating.toFixed(1)}</span>
              </div>
              <p className="text-sm text-muted">From {reviewCount.toLocaleString("en-US")} verified patient reviews</p>
            </div>
          </div>

          <a
            href="#trust"
            className="group mt-14 hidden items-center gap-3 text-sm font-semibold text-navy-soft transition-colors hover:text-brand-deep lg:inline-flex"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white transition-all duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-white">
              <ArrowDown className="h-4 w-4 animate-float" aria-hidden />
            </span>
            Discover how Vitalis works
          </a>
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative mx-auto aspect-4/5 w-full max-w-md sm:max-w-lg">
            <div data-hero-parallax className="absolute inset-0">
              <div data-hero-clip className="absolute inset-x-6 top-0 bottom-0 overflow-hidden rounded-t-full rounded-b-5xl shadow-lift">
                <div data-hero-image className="absolute inset-0">
                  <Image
                    src="/images/hero.jpg"
                    alt="A smiling physician in a white coat ready to welcome patients"
                    fill
                    priority
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover object-top"
                  />
                </div>
              </div>
            </div>

            <div data-hero-speed="0.5" className="absolute top-12 -left-4 z-20 hidden sm:block">
              <div data-hero-card>
                <Link
                  href={slots[0] ? `/doctors/${slots[0].slug}#availability` : "/doctors"}
                  className="glass group block w-72 rounded-3xl p-5 shadow-lift transition-transform duration-500 hover:-translate-y-1 animate-float"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-mint-soft text-mint-deep">
                      <CalendarCheck2 className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-xs font-bold tracking-widest text-muted uppercase">Next available</p>
                      <p className="font-semibold text-navy">{slots[0]?.when ?? "Check availability"}</p>
                    </div>
                  </div>
                  {slots[0] && (
                    <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                      <div>
                        <p className="font-semibold text-navy">{slots[0].name}</p>
                        <p className="text-sm text-muted">{slots[0].specialty}</p>
                      </div>
                      <span className="text-sm font-semibold text-brand-deep transition-transform duration-300 group-hover:translate-x-1">
                        Book →
                      </span>
                    </div>
                  )}
                </Link>
              </div>
            </div>

            <div data-hero-speed="0.25" className="absolute -right-2 top-10 z-20 hidden sm:block">
              <div data-hero-card className="glass animate-float-slow rounded-3xl px-5 py-4 shadow-lift">
                <p className="font-display text-4xl leading-none text-navy">{rating.toFixed(1)}</p>
                <Stars value={rating} size={14} className="mt-2" />
                <p className="mt-2 text-xs font-medium text-muted">Patient rating</p>
              </div>
            </div>

            <div data-hero-speed="0.45" className="absolute bottom-16 -left-2 z-20 hidden md:block">
              <div data-hero-card>
                <Link
                  href={slots[1] ? `/doctors/${slots[1].slug}#availability` : "/doctors"}
                  className="glass-dark group block w-64 rounded-3xl p-5 text-white shadow-lift transition-transform duration-500 hover:-translate-y-1"
                >
                  <p className="text-xs font-bold tracking-widest text-white/60 uppercase">Also open</p>
                  <p className="mt-2 font-semibold">{slots[1]?.when ?? "Specialists open daily"}</p>
                  <p className="mt-1 text-sm text-white/70">{slots[1]?.name ?? "Book in under a minute"}</p>
                </Link>
              </div>
            </div>

            <div data-hero-speed="0.3" className="absolute right-0 bottom-40 z-20 hidden lg:block">
              <div data-hero-card className="glass-dark w-56 animate-float rounded-3xl p-4 text-white shadow-lift">
                <svg viewBox="0 0 240 60" className="h-14 w-full" fill="none" aria-hidden>
                  <path
                    d="M0 30 H60 L72 30 L80 8 L92 52 L100 30 H150 L158 18 L166 30 H240"
                    stroke="#12b886"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ecg-line"
                  />
                </svg>
                <p className="mt-2 text-sm font-semibold">Heart rhythm · steady</p>
                <p className="text-xs text-white/60">Preventive care, tracked</p>
              </div>
            </div>

            <div data-hero-deco className="absolute top-2 left-1/3 z-10 hidden sm:block">
              <span className="grid h-14 w-14 animate-float-slow place-items-center rounded-2xl bg-white shadow-soft">
                <Plus className="h-6 w-6 text-brand" aria-hidden />
              </span>
            </div>
            <div data-hero-deco className="absolute right-10 bottom-2 z-10 hidden sm:block">
              <span className="block h-7 w-16 -rotate-45 animate-float rounded-full bg-linear-to-r from-brand to-mint opacity-80" />
            </div>
            <div data-hero-deco className="absolute top-1/2 -left-10 z-10 hidden xl:block">
              <span className="grid h-12 w-12 animate-float place-items-center rounded-full bg-mint text-white shadow-glow">
                <Star className="h-5 w-5 fill-white" aria-hidden />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
