import { LinkButton } from "@/components/ui/Button";

export function CtaBand() {
  return (
    <section className="bg-white px-6 pb-24 lg:px-10 lg:pb-32">
      <div className="mesh-navy relative mx-auto max-w-7xl overflow-hidden rounded-5xl bg-navy px-8 py-20 text-white shadow-lift sm:px-16 lg:py-24">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 animate-orbit rounded-full border border-dashed border-white/15" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 animate-float rounded-full bg-mint/20 blur-2xl" />

        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold tracking-widest text-mint uppercase">
              Ready when you are
            </p>
            <h2 className="mt-6 font-display text-5xl leading-none tracking-tight text-balance sm:text-6xl">
              Your next appointment is <span className="text-mint italic">one click</span> away.
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">
              Join thousands of patients who plan their care with clarity. Create a free account to save your profile,
              track visits and book in seconds.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
            <LinkButton href="/doctors?sort=soonest" size="lg" magnetic arrow>
              Book an appointment
            </LinkButton>
            <LinkButton href="/register" size="lg" variant="light">
              Create free account
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
