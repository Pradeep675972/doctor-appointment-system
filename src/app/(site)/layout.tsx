import type { ReactNode } from "react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { getCurrentUser } from "@/lib/auth";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-navy focus:px-5 focus:py-3 focus:text-white"
      >
        Skip to content
      </a>
      <Header user={user ? { fullName: user.fullName, role: user.role } : null} />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
