import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Compass } from "lucide-react";
import { Suspense } from "react";
import HeaderAuth from "@/components/HeaderAuth";
import CurrencySelector from "@/components/CurrencySelector";
import { SavedCitiesProvider } from "@/contexts/SavedCitiesContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { getPlatformSettings } from "@/lib/platform-settings";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CityRate — Find cities that match your travel style",
  description: "Discover and rate travel destinations based on how you actually travel.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPlatformSettings();
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`} style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        <CurrencyProvider>
          <SavedCitiesProvider>
            <header style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
              <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                  <Compass className="w-5 h-5" style={{ color: "var(--brand)" }} />
                  CityRate
                </Link>
                <nav className="flex items-center gap-1">
                  {[
                    { href: "/", label: "Explore" },
                    { href: "/compare", label: "Compare" },
                    ...(settings.trip_planner_enabled ? [{ href: "/trips", label: "Trips" }] : []),
                    ...(settings.suggest_city_enabled ? [{ href: "/suggest", label: "Suggest" }] : []),
                  ].map(({ href, label }) => (
                    <Link key={label} href={href} className="nav-link px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                      {label}
                    </Link>
                  ))}
                </nav>
                <div className="flex items-center gap-3">
                  <CurrencySelector />
                  <Suspense fallback={<div className="w-20 h-8 rounded-full animate-pulse" style={{ background: "var(--bg-elevated)" }} />}>
                    <HeaderAuth />
                  </Suspense>
                </div>
              </div>
            </header>
            <main>{children}</main>
          </SavedCitiesProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
