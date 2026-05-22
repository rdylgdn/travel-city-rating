"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe, MapPin, ChevronRight } from "lucide-react";
import { City } from "@/lib/types";
import { Profile, getTravelerBadge, getContinentsVisited } from "@/lib/profile";

type Props = {
  profile: Profile | null;
  userId: string;
  displayName: string;
  visitedCities: City[];
  visitedCountryCount: number;
};

export default function HomeSidebarFloat({ profile, userId, displayName, visitedCities, visitedCountryCount }: Props) {
  const [open, setOpen] = useState(true);
  const [animating, setAnimating] = useState(false);

  const badge = getTravelerBadge(visitedCountryCount);
  const continents = getContinentsVisited(visitedCities);
  const travelStyles = (profile?.travel_styles ?? []) as string[];
  const initials = displayName.slice(0, 2).toUpperCase();

  function toggle() {
    setAnimating(true);
    setTimeout(() => { setOpen((o) => !o); setAnimating(false); }, 50);
  }

  return (
    <div
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center hidden lg:flex"
      style={{ pointerEvents: "none" }}
    >
      {/* Cards panel */}
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          width: open ? "272px" : "0px",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div className="w-[272px] space-y-3 pr-0 pl-3 py-2">
          {/* Travel DNA card */}
          <Link href="/dashboard"
            className="block rounded-2xl p-4 shadow-xl transition-all hover:shadow-2xl"
            style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Travel DNA</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "#FF7A5918", color: "var(--brand)" }}>
                {badge.label}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                style={{ background: "#FF7A5918" }}>
                {profile?.avatar_url ? (
                  <Image src={profile.avatar_url} alt={displayName} width={40} height={40} className="object-cover w-full h-full" />
                ) : (
                  <span className="font-bold text-sm" style={{ color: "var(--brand)" }}>{initials}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate" style={{ color: "var(--text-primary)" }}>{displayName}</p>
                {profile?.home_country && (
                  <p className="text-xs flex items-center gap-1 truncate" style={{ color: "var(--text-muted)" }}>
                    <span>{profile.home_country_flag}</span>{profile.home_country}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shrink-0"
                style={{ background: "var(--brand)", color: "#fff" }}>
                {visitedCountryCount}
              </div>
            </div>

            {travelStyles.length > 0 && (
              <div className="flex gap-1 flex-wrap mt-3">
                {travelStyles.slice(0, 3).map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </Link>

          {/* Where you've been */}
          <div className="rounded-2xl p-4 shadow-xl"
            style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}>

            {/* Header — single line */}
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: "#3DD9C5" }} />
              <p className="text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--text-muted)" }}>Where you&apos;ve been</p>
              <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
                style={{ background: "#3DD9C518", color: "#3DD9C5" }}>
                {visitedCountryCount} countries
              </span>
            </div>

            {visitedCities.length > 0 ? (
              <div>
                {/* Single row: up to 7 thumbnails + overflow badge */}
                <div className="flex gap-1.5 mb-2">
                  {visitedCities.slice(0, 7).map((city) => (
                    <Link key={city.id} href={`/cities/${city.slug}`}
                      className="relative rounded-xl overflow-hidden group shrink-0" title={city.name}
                      style={{ width: "30px", height: "30px" }}>
                      <Image src={city.imageUrl} alt={city.name} fill
                        className="object-cover group-hover:scale-110 transition-transform" sizes="30px" />
                      <div className="absolute inset-0 bg-black/15 group-hover:bg-black/0 transition-colors" />
                    </Link>
                  ))}
                  {visitedCities.length > 7 && (
                    <div className="rounded-xl flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{ width: "30px", height: "30px", background: "var(--bg-primary)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                      +{visitedCities.length - 7}
                    </div>
                  )}
                </div>

                {continents.length > 0 && (
                  <p className="text-[10px] mb-2.5 truncate" style={{ color: "var(--text-muted)" }}>
                    {continents.join(" · ")}
                  </p>
                )}

                {/* View map → links to public profile which shows the world map */}
                <Link
                  href={`/u/${userId}`}
                  className="block text-center text-xs font-semibold py-1.5 rounded-xl transition-all hover:opacity-80"
                  style={{ background: "#3DD9C512", color: "#3DD9C5", border: "1px solid #3DD9C530" }}>
                  View map →
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-1">
                <MapPin className="w-5 h-5 shrink-0" style={{ color: "var(--border)" }} />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Mark cities as visited to build your map</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toggle tab — always visible */}
      <button
        onClick={toggle}
        className="relative flex flex-col items-center justify-center gap-1 w-9 rounded-l-2xl shadow-lg transition-all duration-300 hover:w-11 group"
        style={{
          background: "var(--brand)",
          height: "88px",
          pointerEvents: "auto",
          boxShadow: "0 4px 20px rgba(255,122,89,0.35)",
        }}
        title={open ? "Pack away 🧳" : "Unpack profile ✨"}
      >
        {/* Luggage icon — animates on toggle */}
        <span
          className="text-lg leading-none select-none transition-all duration-500"
          style={{
            transform: open
              ? "rotate(-8deg) scale(1.1)"
              : "rotate(0deg) scale(1)",
            filter: animating ? "blur(1px)" : "none",
          }}
        >
          🧳
        </span>

        {/* Arrow indicator */}
        <ChevronRight
          className="w-3.5 h-3.5 text-white transition-transform duration-300"
          style={{ transform: open ? "rotate(0deg)" : "rotate(180deg)" }}
        />

        {/* Tooltip */}
        <span
          className="absolute right-full mr-2 px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}
        >
          {open ? "Pack away" : "Unpack"}
        </span>
      </button>
    </div>
  );
}
