"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { fieldControl } from "@/components/ui/Field";

type Option = { slug: string; name: string };

const SORTS = [
  { value: "soonest", label: "Soonest available" },
  { value: "rating", label: "Highest rated" },
  { value: "experience", label: "Most experienced" },
  { value: "fee", label: "Lowest fee" },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${
        active ? "bg-navy text-white shadow-soft" : "border border-line bg-white text-navy-soft hover:border-brand hover:text-brand-deep"
      }`}
    >
      {children}
    </button>
  );
}

export function DoctorFilters({ specialties, cities }: { specialties: Option[]; cities: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(params.get("q") ?? "");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const specialty = params.get("specialty") ?? "";
  const city = params.get("city") ?? "";
  const date = params.get("date") ?? "";
  const sort = params.get("sort") ?? "soonest";
  const availableSoon = params.get("availableSoon") === "1";
  const hasFilters = Boolean(params.get("q") || specialty || city || date || availableSoon || params.get("sort"));

  function push(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const query = next.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  function onSearch(value: string) {
    setQ(value);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => push({ q: value.trim() || null }), 350);
  }

  function clearAll() {
    setQ("");
    startTransition(() => router.replace(pathname, { scroll: false }));
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="relative">
      <AnimatePresence>
        {isPending && (
          <motion.div
            key="progress"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-x-6 -top-px z-10 h-0.5 origin-left rounded-full bg-brand"
            aria-hidden
          />
        )}
      </AnimatePresence>

      <div className="rounded-5xl border border-line bg-white/95 p-4 shadow-lift backdrop-blur-xl sm:p-5">
        <div className="grid gap-3 lg:grid-cols-12">
          <label className="relative lg:col-span-4">
            <span className="sr-only">Search doctors</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              value={q}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Name, condition or keyword"
              className={`${fieldControl} pl-12`}
            />
          </label>

          <label className="lg:col-span-2">
            <span className="sr-only">Location</span>
            <select value={city} onChange={(event) => push({ city: event.target.value || null })} className={fieldControl}>
              <option value="">All locations</option>
              {cities.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="lg:col-span-2">
            <span className="sr-only">Available on date</span>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(event) => push({ date: event.target.value || null })}
              className={fieldControl}
            />
          </label>

          <label className="lg:col-span-2">
            <span className="sr-only">Sort by</span>
            <select value={sort} onChange={(event) => push({ sort: event.target.value })} className={fieldControl}>
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-sm font-semibold text-navy lg:col-span-2">
            Available soon
            <span className="relative inline-flex h-6 w-11 shrink-0">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={availableSoon}
                onChange={(event) => push({ availableSoon: event.target.checked ? "1" : null })}
              />
              <span className="absolute inset-0 rounded-full bg-line transition-colors duration-300 peer-checked:bg-mint peer-focus-visible:ring-4 peer-focus-visible:ring-mint/25" />
              <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 peer-checked:translate-x-5" />
            </span>
          </label>
        </div>

        <div className="scrollbar-none mt-4 flex items-center gap-2 overflow-x-auto pb-1">
          <Chip active={!specialty} onClick={() => push({ specialty: null })}>
            All specialties
          </Chip>
          {specialties.map((item) => (
            <Chip key={item.slug} active={specialty === item.slug} onClick={() => push({ specialty: item.slug })}>
              {item.name}
            </Chip>
          ))}
          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-rose transition-colors hover:bg-rose-soft"
            >
              <X className="h-4 w-4" aria-hidden />
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
