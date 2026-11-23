import Image from "next/image";
import { Star } from "lucide-react";
import type { ReactNode } from "react";
import { initials, STATUS_META, TONE_CLASSES } from "@/lib/format";

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`inline-flex items-center gap-2 rounded-full bg-sky px-4 py-1.5 text-xs font-bold tracking-widest text-brand-deep uppercase ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""} ${className}`}>
      {eyebrow && <Eyebrow className={align === "center" ? "mx-auto" : ""}>{eyebrow}</Eyebrow>}
      <h2 className="mt-6 font-display text-4xl leading-none tracking-tight text-balance text-navy sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {description && <div className="mt-6 text-lg leading-relaxed text-navy-soft">{description}</div>}
    </div>
  );
}

export function Avatar({
  name,
  src,
  size = "md",
  className = "",
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const dims = {
    sm: "h-9 w-9 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 text-lg",
    xl: "h-24 w-24 text-2xl",
  }[size];
  if (src) {
    return (
      <span className={`relative inline-block shrink-0 overflow-hidden rounded-full ring-2 ring-white ${dims} ${className}`}>
        <Image src={src} alt={name} fill sizes="96px" className="object-cover" />
      </span>
    );
  }
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full bg-linear-to-br from-brand to-mint font-semibold text-white ring-2 ring-white ${dims} ${className}`}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, tone: "slate" as const };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${TONE_CLASSES[meta.tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {meta.label}
    </span>
  );
}

export function Stars({ value, size = 16, className = "" }: { value: number; size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          aria-hidden
          className={i <= Math.round(value) ? "fill-amber text-amber" : "text-line"}
        />
      ))}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-4xl border border-dashed border-line bg-mist p-10 text-center">
      <p className="font-display text-3xl text-navy">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-navy-soft">{body}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
