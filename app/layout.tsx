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
import { createClient } from "@/utils/supabase/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CityRate — Find cities that match your travel style",
  description: "Discover and rate travel destinations based on how you actually travel.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const [settings, { data: { user } }] = await Promise.all([
    getPlatformSettings(supabase),
    supabase.auth.getUser(),
  ]);
  const isLoggedIn = !!user;
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`} style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        <CurrencyProvider>
          <SavedCitiesProvider>
            <header style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
              <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
                <Link href="/" className="flex items-center gap-1.5 font-bold text-base sm:text-lg shrink-0" style={{ color: "var(--text-primary)" }}>
                  <Compass className="w-5 h-5" style={{ color: "var(--brand)" }} />
                  <span className="hidden sm:inline">CityRate</span>
                </Link>
                <nav className="flex items-center gap-0.5 sm:gap-1 min-w-0">
                  {/* Explore — desktop only */}
                  <Link href="/" className="nav-link hidden md:inline-flex px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                    Explore
                  </Link>
                  {/* Compare — always visible */}
                  <Link href="/compare" className="nav-link px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                    Compare
                  </Link>
                  {/* Trips — desktop always; mobile only when signed in */}
                  {settings.trip_planner_enabled && (
                    <Link href="/trips" className={`nav-link ${isLoggedIn ? "" : "hidden md:inline-flex"} px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors`}>
                      Trips
                    </Link>
                  )}
                  {/* Suggest — desktop only */}
                  {settings.suggest_city_enabled && (
                    <Link href="/suggest" className="nav-link hidden md:inline-flex px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                      Suggest
                    </Link>
                  )}
                </nav>
                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                  {/* USD selector — desktop always; mobile only when signed in (icon-only on mobile) */}
                  <div className={isLoggedIn ? "" : "hidden md:flex"}>
                    <CurrencySelector />
                  </div>
                  <Suspense fallback={<div className="w-16 sm:w-20 h-8 rounded-full animate-pulse" style={{ background: "var(--bg-elevated)" }} />}>
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
