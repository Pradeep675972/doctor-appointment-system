"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { logoutAction } from "@/app/actions/auth";
import { Button, LinkButton } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Avatar } from "@/components/ui/primitives";

export type HeaderUser = { fullName: string; role: string } | null;

const NAV = [
  { label: "Find doctors", href: "/doctors" },
  { label: "Specialties", href: "/#specialties" },
  { label: "Facilities", href: "/#facilities" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
];

export function Header({ user }: { user: HeaderUser }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > last && y > 320);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const dashboardHref = user?.role === "admin" ? "/admin" : "/dashboard";
  const isHidden = hidden && !open;

  return (
    <>
      <motion.header
        initial={{ y: "-100%" }}
        animate={{ y: isHidden ? "-100%" : "0%" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-30 transition-colors duration-500 ${
          scrolled ? "glass shadow-soft" : "bg-transparent"
        }`}
      >
        <nav aria-label="Primary" className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6 lg:px-10">
          <Logo />

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active = item.href.startsWith("/doctors") && pathname.startsWith("/doctors");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group relative block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                      active ? "text-navy" : "text-navy-soft hover:text-navy"
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={`absolute inset-x-4 bottom-1 h-px origin-left bg-brand transition-transform duration-500 ease-premium ${
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="hidden items-center gap-3 rounded-full py-1 pr-4 pl-1 text-sm font-semibold text-navy transition-colors hover:bg-sky md:inline-flex"
                >
                  <Avatar name={user.fullName} size="sm" />
                  {user.role === "admin" ? "Admin" : user.fullName.split(" ")[0]}
                </Link>
                <form action={logoutAction} className="hidden lg:block">
                  <button
                    type="submit"
                    aria-label="Sign out"
                    className="grid h-10 w-10 place-items-center rounded-full text-navy-soft transition-all duration-300 hover:bg-sky hover:text-navy active:scale-90"
                  >
                    <LogOut className="h-5 w-5" aria-hidden />
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-sky md:inline-flex"
              >
                Log in
              </Link>
            )}
            <ThemeToggle />
            <div className="hidden sm:block">
              <LinkButton href="/doctors?sort=soonest" size="sm" magnetic>
                Book appointment
              </LinkButton>
            </div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid h-11 w-11 place-items-center rounded-full bg-white text-navy shadow-soft ring-1 ring-line transition-all duration-300 hover:ring-brand/40 active:scale-90 lg:hidden"
            >
              {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-20 flex flex-col overflow-y-auto bg-white px-6 pt-28 pb-10 lg:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between border-b border-line py-5 font-display text-4xl text-navy"
                  >
                    {item.label}
                    <ArrowUpRight className="h-6 w-6 text-brand transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden />
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-auto space-y-3 pt-10">
              {user ? (
                <>
                  <LinkButton href={dashboardHref} block variant="dark" size="lg">
                    {user.role === "admin" ? "Open admin console" : "Go to my dashboard"}
                  </LinkButton>
                  <form action={logoutAction}>
                    <Button type="submit" block variant="light" size="lg">
                      Sign out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <LinkButton href="/doctors?sort=soonest" block size="lg" arrow>
                    Book an appointment
                  </LinkButton>
                  <LinkButton href="/login" block variant="light" size="lg">
                    Log in
                  </LinkButton>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
