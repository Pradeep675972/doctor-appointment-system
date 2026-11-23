"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import { loginAction, registerAction } from "@/app/actions/auth";
import { Button, SubmitButton } from "@/components/ui/Button";
import { FormNotice, Input } from "@/components/ui/Field";
import { initialActionState } from "@/lib/action-state";
import { ShieldCheck, Sparkles } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="mesh-hero grid min-h-screen pt-32 pb-16 lg:grid-cols-2 lg:pb-24">
      <aside className="relative mx-6 hidden overflow-hidden rounded-5xl bg-navy text-white shadow-lift lg:mr-0 lg:ml-10 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Image src="/images/hero.jpg" alt="" fill sizes="50vw" className="object-cover opacity-40" priority />
        <div aria-hidden className="mesh-navy absolute inset-0 opacity-90" />
        <div className="relative max-w-lg">
          <p className="font-display text-6xl leading-none">
            Care that starts with a <span className="text-mint italic">single, easy</span> click.
          </p>
          <p className="mt-6 text-lg text-white/75">
            Verified specialists in New York, London, Berlin and Dubai, with live availability in your local time.
          </p>
        </div>
        <div className="relative grid max-w-lg grid-cols-2 gap-4">
          <div className="glass-dark rounded-3xl p-5">
            <ShieldCheck className="h-6 w-6 text-mint" aria-hidden />
            <p className="mt-4 font-semibold">Private records</p>
            <p className="mt-1 text-sm text-white/65">Only you and your clinic can see your details.</p>
          </div>
          <div className="glass-dark rounded-3xl p-5">
            <Sparkles className="h-6 w-6 text-mint" aria-hidden />
            <p className="mt-4 font-semibold">Zero double-bookings</p>
            <p className="mt-1 text-sm text-white/65">Every slot is protected the moment it is requested.</p>
          </div>
        </div>
      </aside>

      <section className="flex items-start justify-center px-6 lg:items-center lg:px-12">
        <div className="w-full max-w-md">
          <h1 className="font-display text-6xl leading-none tracking-tight text-navy">{title}</h1>
          <p className="mt-5 text-lg text-navy-soft">{subtitle}</p>
          <div className="mt-10">{children}</div>
          <div className="mt-8 text-sm text-navy-soft">{footer}</div>
        </div>
      </section>
    </main>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, initialActionState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fill = (nextEmail: string, nextPassword: string) => {
    setEmail(nextEmail);
    setPassword(nextPassword);
  };

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <Input
        name="email"
        type="email"
        autoComplete="email"
        label="Email address"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={state.errors?.email}
      />
      <Input
        name="password"
        type="password"
        autoComplete="current-password"
        label="Password"
        placeholder="Your password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={state.errors?.password}
      />
      <FormNotice state={state} />
      <SubmitButton block size="lg" arrow pendingLabel="Signing you in…">
        Sign in
      </SubmitButton>

      <div className="rounded-4xl border border-dashed border-line bg-white/70 p-5">
        <p className="text-sm font-semibold text-navy">Explore with a demo account</p>
        <p className="mt-1 text-sm text-muted">Fill the form instantly to see the patient or admin experience.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Button variant="light" size="sm" onClick={() => fill("demo@vitalis.health", "Patient123!")}>
            Patient demo
          </Button>
          <Button variant="light" size="sm" onClick={() => fill("admin@vitalis.health", "Admin123!")}>
            Admin demo
          </Button>
        </div>
      </div>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(registerAction, initialActionState);
  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <Input name="fullName" autoComplete="name" label="Full name" placeholder="Jordan Smith" error={state.errors?.fullName} />
      <Input name="email" type="email" autoComplete="email" label="Email address" placeholder="you@example.com" error={state.errors?.email} />
      <div className="grid gap-6 sm:grid-cols-2">
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          label="Password"
          placeholder="At least 8 characters"
          error={state.errors?.password}
        />
        <Input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          label="Confirm password"
          placeholder="Repeat password"
          error={state.errors?.confirmPassword}
        />
      </div>
      <FormNotice state={state} />
      <SubmitButton block size="lg" arrow pendingLabel="Creating your account…">
        Create account
      </SubmitButton>
      <p className="text-xs text-muted">
        By creating an account you agree to use Vitalis for genuine healthcare booking and to keep your details accurate.
      </p>
    </form>
  );
}

export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-brand-deep transition-colors hover:text-navy">
      {children}
    </Link>
  );
}
