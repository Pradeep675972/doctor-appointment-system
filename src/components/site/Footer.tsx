"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Find doctors", href: "/doctors" },
      { label: "Specialties", href: "/#specialties" },
      { label: "Facilities", href: "/#facilities" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Patients",
    links: [
      { label: "Book an appointment", href: "/doctors?sort=soonest" },
      { label: "Create an account", href: "/register" },
      { label: "Sign in", href: "/login" },
      { label: "My dashboard", href: "/dashboard" },
      { label: "My profile", href: "/dashboard/profile" },
    ],
  },
  {
    title: "Clinics",
    links: [
      { label: "New York", href: "/doctors?city=New+York" },
      { label: "London", href: "/doctors?city=London" },
      { label: "Berlin", href: "/doctors?city=Berlin" },
      { label: "Dubai", href: "/doctors?city=Dubai" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy text-white">
      <div aria-hidden className="mesh-navy absolute inset-0 opacity-70" />
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-10 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo light />
            <p className="mt-6 max-w-sm text-base leading-relaxed text-white/70">
              Verified specialists, real-time availability and a calm, secure dashboard for every visit.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-white/80">
              <li>
                <a href="tel:+12125550148" className="group inline-flex items-center gap-3 transition-colors hover:text-white">
                  <Phone className="h-4 w-4 text-mint transition-transform duration-300 group-hover:rotate-12" aria-hidden />
                  +1 212 555 0148
                </a>
              </li>
              <li>
                <a href="mailto:care@vitalis.health" className="group inline-flex items-center gap-3 transition-colors hover:text-white">
                  <Mail className="h-4 w-4 text-mint transition-transform duration-300 group-hover:rotate-12" aria-hidden />
                  care@vitalis.health
                </a>
              </li>
              <li className="inline-flex items-center gap-3">
                <MapPin className="h-4 w-4 text-mint" aria-hidden />
                240 East 58th Street, New York
              </li>
            </ul>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="text-xs font-bold tracking-widest text-white/50 uppercase">{column.title}</p>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-block text-base text-white/85 transition-all duration-300 hover:translate-x-1 hover:text-mint"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 overflow-hidden">
          <motion.p
            initial={{ y: "100%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-9xl leading-none tracking-tight text-white/10 select-none"
            aria-hidden
          >
            Vitalis
          </motion.p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/60 sm:flex-row">
          <div className="space-y-1">
            <p>© {new Date().getFullYear()} Vitalis Health. Care you can plan around.</p>
            <p className="text-white/50">Photography from Pexels and Unsplash contributors, credited on each image.</p>
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white transition-all duration-300 hover:bg-white hover:text-navy active:scale-95"
          >
            Back to top
            <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1" aria-hidden />
          </button>
        </div>
      </div>
    </footer>
  );
}
