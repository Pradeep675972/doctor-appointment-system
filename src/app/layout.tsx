import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { LoadingScreen } from "@/components/motion/LoadingScreen";
import { Providers } from "@/components/motion/Providers";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vitalis · Premium Doctor Appointments",
    template: "%s · Vitalis",
  },
  description:
    "Book verified specialists in minutes. Real-time availability, transparent fees and a calm dashboard for every visit.",
};

export const viewport: Viewport = {
  themeColor: "#102a43",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${sans.variable}`}>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{var t=localStorage.getItem('vitalis-theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}",
        }}
      />
      <body className="bg-white font-sans text-navy antialiased">
        <Providers>
          <SmoothScroll />
          <CustomCursor />
          <LoadingScreen />
          {children}
        </Providers>
      </body>
    </html>
  );
}
