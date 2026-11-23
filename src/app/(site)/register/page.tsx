import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLink, AuthShell, RegisterForm } from "@/components/auth/AuthForms";
import { getCurrentUser } from "@/lib/auth";
import { safeNext } from "@/lib/validation";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const next = safeNext(sp.next);
  if (user) redirect(next ?? "/dashboard");

  return (
    <AuthShell
      title="Start with clarity."
      subtitle="Create your free patient account to book specialists, track every visit and keep your records secure."
      footer={
        <>
          Already registered?{" "}
          <AuthLink href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}>Sign in</AuthLink>
        </>
      }
    >
      <RegisterForm next={next ?? undefined} />
    </AuthShell>
  );
}
