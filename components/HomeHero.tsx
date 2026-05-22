"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";

const QUICK_FILTERS = [
  { label: "Digital Nomad", color: "#3DD9C5" },
  { label: "Food", color: "#F59E0B" },
  { label: "Beach", color: "#60A5FA" },
  { label: "Nature", color: "#4ADE80" },
  { label: "Nightlife", color: "#A78BFA" },
  { label: "Budget Friendly", color: "#34D399" },
  { label: "Culture", color: "#F4C95D" },
];

// Rotating hero city backgrounds
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=80", // Lisbon
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80", // Tokyo
  "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=80", // Bangkok
];

export default function HomeHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const imgIdx = Math.floor(Date.now() / 60000) % HERO_IMAGES.length; // changes every minute

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query)}`);
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
                onClick={() => setActiveFilter(activeFilter === f.label ? null : f.label)}
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
