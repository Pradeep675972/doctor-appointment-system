import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="mesh-hero relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24">
      <div className="text-center">
        <p className="font-display text-9xl leading-none text-brand/15">404</p>
        <h1 className="-mt-6 font-display text-4xl text-navy sm:text-5xl">This page took a different appointment.</h1>
        <p className="mx-auto mt-5 max-w-md text-lg text-navy-soft">
          The page you are looking for has moved or does not exist. Let us help you find the right specialist.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <LinkButton href="/" variant="dark" arrow>
            Back to home
          </LinkButton>
          <LinkButton href="/doctors" variant="light">
            Find a doctor
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
