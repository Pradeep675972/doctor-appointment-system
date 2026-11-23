"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Fragment, useLayoutEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

/** Editorial statement: each word lights up as the reader scrolls through the paragraph. */
export function ScrollWords({ text, className = "" }: { text: string; className?: string }) {
  const root = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-word]",
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.2,
          scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 45%", scrub: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <p ref={root} className={className}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span data-word className="inline-block">
            {word}
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </p>
  );
}
