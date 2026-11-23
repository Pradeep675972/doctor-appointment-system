"use client";

import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useRef } from "react";
import { Avatar, Stars } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";

export type TestimonialItem = {
  id: number;
  rating: number;
  comment: string;
  patientName: string;
  doctorName: string;
  specialtyName: string;
  createdAt: Date;
};

export function Testimonials({ reviews }: { reviews: TestimonialItem[] }) {
  const track = useRef<HTMLDivElement>(null);

  if (reviews.length === 0) return null;

  const scroll = (direction: 1 | -1) => {
    const node = track.current;
    if (!node) return;
    const step = node.firstElementChild instanceof HTMLElement ? node.firstElementChild.offsetWidth + 24 : 360;
    node.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-sky px-4 py-1.5 text-xs font-bold tracking-widest text-brand-deep uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
              Patient stories
            </p>
            <h2 className="mt-6 font-display text-5xl leading-none tracking-tight text-balance text-navy sm:text-6xl">
              Heard from people <span className="text-brand italic">like you.</span>
            </h2>
          </div>
          <div className="flex gap-3">
            <Button
              variant="light"
              size="sm"
              className="h-12 w-12 p-0"
              aria-label="Previous review"
              onClick={() => scroll(-1)}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </Button>
            <Button
              variant="dark"
              size="sm"
              className="h-12 w-12 p-0"
              aria-label="Next review"
              onClick={() => scroll(1)}
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={track}
        tabIndex={0}
        aria-label="Patient reviews"
        className="scrollbar-none mt-14 flex snap-x snap-mandatory scroll-px-6 gap-6 overflow-x-auto scroll-smooth px-6 pb-8 lg:px-10"
      >
        {reviews.map((review, index) => {
          const dark = index % 3 === 1;
          return (
            <article
              key={review.id}
              className={`group flex w-80 shrink-0 snap-start flex-col justify-between rounded-4xl p-8 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-lift sm:w-96 ${
                dark ? "bg-navy text-white" : "border border-line bg-white text-navy"
              }`}
            >
              <div>
                <Quote className={`h-10 w-10 ${dark ? "text-mint" : "text-brand/40"}`} aria-hidden />
                <p className="mt-6 font-display text-2xl leading-snug italic">&ldquo;{review.comment}&rdquo;</p>
              </div>
              <div className="mt-10">
                <Stars value={review.rating} size={16} />
                <div className="mt-5 flex items-center gap-4">
                  <Avatar name={review.patientName} size="md" className={dark ? "ring-navy" : ""} />
                  <div>
                    <p className="font-semibold">{review.patientName}</p>
                    <p className={`text-sm ${dark ? "text-white/65" : "text-muted"}`}>
                      {review.doctorName} · {review.specialtyName}
                    </p>
                  </div>
                </div>
                <p className={`mt-4 text-xs ${dark ? "text-white/50" : "text-muted"}`}>
                  {formatDate(review.createdAt.toISOString().slice(0, 10), { month: "long", year: "numeric" })}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
