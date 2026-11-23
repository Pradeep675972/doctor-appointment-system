import type { ReactNode } from "react";
import { ShellNav, type ShellItem } from "@/components/shell/ShellNav";
import { requireAdmin } from "@/lib/auth";

const ITEMS: ShellItem[] = [
  { href: "/admin", label: "Overview", icon: "overview", exact: true },
  { href: "/admin/appointments", label: "Appointments", icon: "calendar" },
  { href: "/admin/doctors", label: "Doctors", icon: "stethoscope" },
  { href: "/admin/patients", label: "Patients", icon: "users" },
  { href: "/admin/specialties", label: "Specialties", icon: "tags" },
  { href: "/", label: "View website", icon: "globe", exact: true },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="min-h-screen bg-mist">
      <ShellNav items={ITEMS} label="Administration" user={{ fullName: user.fullName, email: user.email }} />
      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-14">{children}</div>
      </main>
    </div>
  );
}
