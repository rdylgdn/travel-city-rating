"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Heart, TrendingUp, Globe2 } from "lucide-react";
import { City } from "@/lib/types";

// Labels must match TravelStyle values in lib/types.ts exactly
const QUICK_FILTERS = [
  { label: "Digital Nomad", color: "#3DD9C5" },
  { label: "Food",          color: "#F59E0B" },
  { label: "Beach",         color: "#60A5FA" },
  { label: "Nature",        color: "#4ADE80" },
  { label: "Nightlife",     color: "#A78BFA" },
  { label: "Adventure",     color: "#FB7185" },
  { label: "Culture",       color: "#F4C95D" },
  { label: "Solo",          color: "#34D399" },
];

// Rotating hero city backgrounds
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=80", // Lisbon
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80", // Tokyo
  "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=80", // Bangkok
];

type SocialProofItem = { city: City; count: number };

export default function HomeHero({ socialProof = [] }: { socialProof?: SocialProofItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const imgIdx = Math.floor(Date.now() / 60000) % HERO_IMAGES.length; // changes every minute

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}#all-cities`);
    }
  }

  function handleFilterClick(label: string) {
    const next = activeFilter === label ? null : label;
    setActiveFilter(next);
    if (next) {
      router.push(`/?style=${encodeURIComponent(next)}#all-cities`);
    } else {
      router.push(`/`);
    }
  }

  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden">
      {/* Background city photo — right side fading into dark */}
      <div className="absolute inset-0">
        <div
          className="absolute right-0 top-0 bottom-0 w-3/5"
          style={{
            backgroundImage: `url(${HERO_IMAGES[imgIdx]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Gradient fade left — warm cream */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, #F7F4EE 30%, #F7F4EEcc 50%, #F7F4EE55 70%, transparent 100%)`,
          }}
        />
        {/* Gradient fade bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40"
          style={{ background: `linear-gradient(to top, #F7F4EE, transparent)` }}
        />
      </div>

      {/* Floating social proof cards — glassmorphism, over the hero image */}
      <div className="hidden md:block absolute z-20 right-6 lg:right-10 top-20 space-y-4">
        {/* Card 1: Top saved today */}
        {socialProof[0] && (
          <FloatingCard delay={0}>
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0">
                <Image src={socialProof[0].city.imageUrl} alt={socialProof[0].city.name} fill className="object-cover" sizes="40px" />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  <Heart className="w-3 h-3 inline mr-1 fill-rose-500 text-rose-500" />
                  Trending today
                </p>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {socialProof[0].count.toLocaleString()} saved {socialProof[0].city.name}
                </p>
              </div>
            </div>
          </FloatingCard>
        )}

        {/* Card 2: Trending style */}
        <FloatingCard delay={0.3}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FF7A5922" }}>
              <TrendingUp className="w-4 h-4" style={{ color: "var(--brand)" }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>This week</p>
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                🔥 Trending with Solo Travelers
              </p>
            </div>
          </div>
        </FloatingCard>

        {/* Card 3: Wishlist */}
        {socialProof[1] && (
          <FloatingCard delay={0.6}>
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0">
                <Image src={socialProof[1].city.imageUrl} alt={socialProof[1].city.name} fill className="object-cover" sizes="40px" />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  <Globe2 className="w-3 h-3 inline mr-1" style={{ color: "#3DD9C5" }} />
                  Travelers wishlist
                </p>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {socialProof[1].count.toLocaleString()} added {socialProof[1].city.name}
                </p>
              </div>
            </div>
          </FloatingCard>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--brand)" }}>
            Real Experiences. Real Travellers.
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-4" style={{ color: "var(--text-primary)" }}>
            Find the city<br />
            that fits{" "}
            <span style={{ color: "var(--brand)" }}>your vibe.</span>
          </h1>
          <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
            Discover amazing places, plan your trips,<br />
            and build your travel identity.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cities, countries, or vibes…"
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm outline-none"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl text-sm font-semibold transition-all"
              style={{ background: "var(--brand)", color: "#fff" }}
            >
              Search
            </button>
          </form>

          {/* Quick filter chips */}
          <div className="flex flex-wrap gap-2">
            {QUICK_FILTERS.map((f) => (
              <button
                key={f.label}
                onClick={() => handleFilterClick(f.label)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: activeFilter === f.label ? f.color + "22" : "var(--bg-elevated)",
                  border: `1px solid ${activeFilter === f.label ? f.color : "var(--border)"}`,
                  color: activeFilter === f.label ? f.color : "var(--text-secondary)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: f.color }} />
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div
      className="px-4 py-3 max-w-[260px] animate-float-in"
      style={{
        background: "rgba(255, 255, 255, 0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        borderRadius: "20px",
        boxShadow: "0 8px 32px rgba(31, 38, 135, 0.12), 0 2px 4px rgba(0, 0, 0, 0.04)",
        animationDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
