import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Compass } from "lucide-react";
import { Suspense } from "react";
import HeaderAuth from "@/components/HeaderAuth";
import { SavedCitiesProvider } from "@/contexts/SavedCitiesContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CityRate — Find cities that match your travel style",
  description: "Discover and rate travel destinations based on how you actually travel.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <SavedCitiesProvider>
          <header className="border-b border-gray-100 bg-white">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900">
                <Compass className="w-5 h-5 text-rose-500" />
                CityRate
              </Link>
              <nav className="flex items-center gap-4">
                <Link href="/suggest" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
                  Suggest a city
                </Link>
                <Suspense fallback={
                  <div className="w-20 h-8 bg-gray-100 rounded-full animate-pulse" />
                }>
                  <HeaderAuth />
                </Suspense>
              </nav>
            </div>
          </header>
          <main>{children}</main>
        </SavedCitiesProvider>
      </body>
    </html>
  );
}
