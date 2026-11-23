import Link from "next/link";

export function LogoMark({ className = "h-10 w-10 rounded-2xl" }: { className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center bg-brand text-white shadow-glow ${className}`}>
      <svg viewBox="0 0 48 48" className="h-3/5 w-3/5" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 26h9l4-10 6 18 5-12 3 4h13" />
      </svg>
    </span>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label="Vitalis home">
      <LogoMark />
      <span className={`font-display text-2xl tracking-tight ${light ? "text-white" : "text-navy"}`}>Vitalis</span>
    </Link>
  );
}
