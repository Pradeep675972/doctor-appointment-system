"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export type GalleryItem = {
  src: string;
  title: string;
  caption: string;
  credit: string;
  source: "Pexels" | "Unsplash";
};

/** Pinned section: the viewport sticks while the gallery scrubs horizontally with scroll. */
export function StickyGallery({ items }: { items: GalleryItem[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = section.current;
    const t = track.current;
    const bar = progress.current;
    const count = counter.current;
    if (!el || !t || !bar || !count) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, t.scrollWidth - window.innerWidth + 96);

      const move = gsap.to(t, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      gsap.to(bar, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.3,
        },
      });

      gsap.to(count, {
        textContent: items.length,
        snap: { textContent: 1 },
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: true,
        },
      });

      // Each card drifts slightly against the scroll for depth.
      gsap.utils.toArray<HTMLElement>("[data-gallery-img]").forEach((img) => {
        gsap.fromTo(
          img,
          { xPercent: -6 },
          {
            xPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: t,
              start: "top top",
              end: () => `+=${distance()}`,
              scrub: true,
            },
          },
        );
      });

      return () => move.kill();
    }, el);

    return () => ctx.revert();
  }, [items.length]);

  return (
    <section
      ref={section}
      aria-label="Photo gallery"
      className="scrollbar-none relative flex min-h-screen flex-col justify-center overflow-x-auto bg-mist py-16"
    >
      <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-6 px-6 lg:px-10">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-sky px-4 py-1.5 text-xs font-bold tracking-widest text-brand-deep uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
            Inside Vitalis
          </p>
          <h2 className="mt-5 font-display text-4xl leading-none tracking-tight text-navy sm:text-6xl">
            Keep scrolling, <span className="text-brand italic">step inside.</span>
          </h2>
        </div>
        <p className="hidden font-display text-3xl text-navy-soft sm:block" aria-hidden>
          <span ref={counter} className="tabular-nums text-navy">
            1
          </span>
          <span className="text-muted"> / {items.length}</span>
        </p>
      </div>

      <div ref={track} className="mt-12 flex w-max gap-8 px-6 pr-12 lg:px-10">
        {items.map((item) => (
          <article
            key={item.src}
            className="group relative w-80 shrink-0 overflow-hidden rounded-4xl bg-white shadow-lift sm:w-96 lg:w-120"
          >
            <div className="relative aspect-4/5 overflow-hidden">
              <div data-gallery-img className="absolute inset-y-0 -inset-x-8">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 480px, (min-width: 640px) 384px, 320px"
                  className="object-cover transition-transform duration-1000 ease-premium group-hover:scale-110"
                />
              </div>
            </div>
            <div className="glass absolute inset-x-4 bottom-4 rounded-3xl p-5">
              <p className="font-display text-2xl leading-tight text-navy">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-navy-soft">{item.caption}</p>
              <p className="mt-3 text-xs text-muted">
                Photo · {item.source} · {item.credit}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-12 w-full max-w-7xl px-6 lg:px-10">
        <div className="h-1 overflow-hidden rounded-full bg-line">
          <div ref={progress} className="h-full origin-left scale-x-0 rounded-full bg-linear-to-r from-brand to-mint" />
        </div>
      </div>
    </section>
  );
}
