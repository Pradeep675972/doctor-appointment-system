"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Building2,
  CalendarDays,
  ClipboardList,
  Globe,
  LayoutDashboard,
  LogOut,
  Search,
  Stethoscope,
  Tags,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/primitives";

const ICONS = {
  overview: LayoutDashboard,
  calendar: CalendarDays,
  user: UserRound,
  search: Search,
  stethoscope: Stethoscope,
  users: Users,
  clipboard: ClipboardList,
  tags: Tags,
  activity: Activity,
  globe: Globe,
  building: Building2,
} as const;

export type ShellIcon = keyof typeof ICONS;
export type ShellItem = { href: string; label: string; icon: ShellIcon; exact?: boolean };

export function ShellNav({
  items,
  user,
  label,
}: {
  items: ShellItem[];
  user: { fullName: string; email: string };
  label: string;
}) {
  const pathname = usePathname();
  const isActive = (item: ShellItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-line bg-white px-5 py-6 lg:flex">
        <div className="px-3">
          <Logo />
        </div>
        <p className="mt-10 px-3 text-xs font-bold tracking-widest text-muted uppercase">{label}</p>
        <nav aria-label={`${label} navigation`} className="mt-3 flex-1 space-y-1">
          {items.map((item) => {
            const Icon = ICONS[item.icon];
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors duration-300 ${
                  active ? "text-white" : "text-navy-soft hover:bg-mist hover:text-navy"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="shell-active"
                    className="absolute inset-0 rounded-2xl bg-navy shadow-soft"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}
                <Icon className="relative h-5 w-5 transition-transform duration-300 group-hover:scale-110" aria-hidden />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="rounded-3xl bg-mist p-4">
          <div className="flex items-center gap-3">
            <Avatar name={user.fullName} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-navy">{user.fullName}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>
          <form action={logoutAction} className="mt-4">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-navy ring-1 ring-line transition-all duration-300 hover:bg-navy hover:text-white active:scale-95"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <Logo />
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full bg-mist px-4 py-2 text-sm font-semibold text-navy transition-all active:scale-95"
            >
              Sign out
            </button>
          </form>
        </div>
        <nav aria-label={`${label} navigation`} className="scrollbar-none flex gap-2 overflow-x-auto px-6 pb-4">
          {items.map((item) => {
            const Icon = ICONS[item.icon];
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  active ? "bg-navy text-white" : "bg-mist text-navy-soft"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
