import type { ReactNode } from "react";
import { ShellNav, type ShellItem } from "@/components/shell/ShellNav";
import { requireUser } from "@/lib/auth";

const ITEMS: ShellItem[] = [
  { href: "/dashboard", label: "Overview", icon: "overview", exact: true },
  { href: "/doctors", label: "Find a doctor", icon: "search" },
  { href: "/dashboard/profile", label: "My profile", icon: "user" },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("/dashboard");
  return (
    <div className="min-h-screen bg-mist">
      <ShellNav items={ITEMS} label="Patient" user={{ fullName: user.fullName, email: user.email }} />
      <main className="lg:pl-72">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-12 lg:py-14">{children}</div>
      </main>
    </div>
  );
}
