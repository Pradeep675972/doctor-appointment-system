import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLink, AuthShell, LoginForm } from "@/components/auth/AuthForms";
import { getCurrentUser } from "@/lib/auth";
import { safeNext } from "@/lib/validation";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const next = safeNext(sp.next);
  if (user) redirect(next ?? (user.role === "admin" ? "/admin" : "/dashboard"));

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in to manage your visits, review your schedule and update your health profile."
      footer={
        <>
          New to Vitalis?{" "}
          <AuthLink href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}>Create an account</AuthLink>
        </>
      }
    >
      <LoginForm next={next ?? undefined} />
    </AuthShell>
  );
}
