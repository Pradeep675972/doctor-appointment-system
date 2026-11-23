"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Magnetic } from "@/components/motion/Magnetic";

export type ButtonVariant = "primary" | "dark" | "light" | "ghost" | "danger" | "soft";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold whitespace-nowrap select-none transition-all duration-300 ease-premium hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white shadow-glow hover:bg-brand-deep",
  dark: "bg-navy text-white shadow-soft hover:bg-navy-soft hover:shadow-lift",
  light: "bg-white text-navy ring-1 ring-line shadow-soft hover:ring-brand/40 hover:shadow-lift",
  ghost: "text-navy hover:bg-sky hover:text-brand-deep",
  danger: "bg-rose-soft text-rose hover:bg-rose hover:text-white",
  soft: "bg-sky text-brand-deep hover:bg-brand hover:text-white",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3.5 text-sm sm:text-base",
  lg: "px-8 py-4 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  block = false,
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
}) {
  return [BASE, VARIANTS[variant], SIZES[size], block ? "w-full" : "", className].join(" ");
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

function ButtonInner({ children, arrow, loading }: { children: ReactNode; arrow?: boolean; loading?: boolean }) {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-white/15 transition-transform duration-700 ease-premium group-hover:translate-x-full"
      />
      <span className="relative z-10 inline-flex items-center gap-2">
        {loading && <Spinner />}
        {children}
        {arrow && <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />}
      </span>
    </>
  );
}

type SharedProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  arrow?: boolean;
  magnetic?: boolean;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant,
  size,
  block,
  arrow,
  magnetic,
  loading,
  className,
  children,
  disabled,
  ...props
}: SharedProps & ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  const node = (
    <button
      {...props}
      type={props.type ?? "button"}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, block, className })}
    >
      <ButtonInner arrow={arrow} loading={loading}>
        {children}
      </ButtonInner>
    </button>
  );
  return magnetic ? <Magnetic>{node}</Magnetic> : node;
}

export function LinkButton({
  href,
  variant,
  size,
  block,
  arrow,
  magnetic,
  className,
  children,
  target,
}: SharedProps & { href: string; target?: string }) {
  const node = (
    <Link href={href} target={target} className={buttonClasses({ variant, size, block, className })}>
      <ButtonInner arrow={arrow}>{children}</ButtonInner>
    </Link>
  );
  return magnetic ? <Magnetic>{node}</Magnetic> : node;
}

/** Submit button that reads form pending state automatically (use inside a <form>). */
export function SubmitButton({
  variant,
  size,
  block,
  arrow,
  className,
  children,
  pendingLabel,
  disabled,
}: SharedProps & { pendingLabel?: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending || undefined}
      className={buttonClasses({ variant, size, block, className })}
    >
      <ButtonInner arrow={arrow} loading={pending}>
        {pending && pendingLabel ? pendingLabel : children}
      </ButtonInner>
    </button>
  );
}
