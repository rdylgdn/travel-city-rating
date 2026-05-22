import Link from "next/link";
import Image from "next/image";
import { City } from "@/lib/types";
import { Profile, getTravelerBadge, getContinentsVisited } from "@/lib/profile";
import { Globe } from "lucide-react";

type Props = {
  profile: Profile | null;
  displayName: string;
  visitedCities: City[];
  visitedCountryCount: number;
};

export default function HomeSidebar({ profile, displayName, visitedCities, visitedCountryCount }: Props) {
  const badge = getTravelerBadge(visitedCountryCount);
  const continents = getContinentsVisited(visitedCities);
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <aside className="w-72 xl:w-80 shrink-0 space-y-3">
      {/* Travel DNA card */}
      <div className="rounded-2xl p-4" style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Your Travel DNA</p>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#FF7A5922", color: "var(--brand)" }}>NEW</span>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0"
            style={{ background: "#FF7A5922" }}>
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt={displayName} width={48} height={48} className="object-cover w-full h-full" />
            ) : (
              <span className="font-bold text-sm" style={{ color: "var(--brand)" }}>{initials}</span>
            )}
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{displayName}</p>
            {profile?.bio && <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--text-secondary)" }}>{profile.bio}</p>}
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 rounded-xl px-3 py-2" style={{ background: "var(--bg-elevated)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>Badge</p>
            <p className="text-xs font-bold" style={{ color: badge.color.replace("text-", "") === badge.color ? "var(--brand)" : "var(--brand)" }}>
              {badge.label}
            </p>
          </div>
          {profile?.travel_styles && (profile.travel_styles as string[]).length > 0 && (
            <div className="flex-1 rounded-xl px-3 py-2" style={{ background: "var(--bg-elevated)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>Style</p>
              <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>
                {(profile.travel_styles as string[])[0]}
              </p>
            </div>
          )}
        </div>

        {/* Travel score */}
        <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-3"
          style={{ background: "linear-gradient(135deg, var(--brand)22, var(--bg-elevated))" }}>
          <div>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Travel Score</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Keep exploring</p>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl"
            style={{ background: "var(--brand)", color: "#fff" }}>
            {visitedCountryCount}
          </div>
        </div>

        <Link href={`/dashboard`}
          className="block text-center text-xs font-semibold py-2 rounded-xl transition-all hover:opacity-80"
          style={{ background: "var(--bg-elevated)", color: "var(--brand)" }}>
          View full profile →
        </Link>
      </div>

      {/* Where you've been */}
      <div className="rounded-2xl p-4" style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" style={{ color: "#3DD9C5" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Where you&apos;ve been</p>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#3DD9C522", color: "#3DD9C5" }}>
            {visitedCountryCount} countries
          </span>
        </div>

        {visitedCities.length > 0 ? (
          <div>
            <div className="flex gap-1.5 flex-wrap mb-2">
              {visitedCities.slice(0, 6).map((city) => (
                <Link key={city.id} href={`/cities/${city.slug}`}
                  className="relative w-12 h-12 rounded-xl overflow-hidden group">
                  <Image src={city.imageUrl} alt={city.name} fill className="object-cover group-hover:scale-110 transition-transform" sizes="48px" />
                  <div className="absolute inset-0 bg-black/30" />
                </Link>
              ))}
            </div>
            {continents.length > 0 && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {continents.join(" · ")}
              </p>
            )}
            <Link href="/dashboard" className="block mt-2 text-xs font-medium" style={{ color: "var(--brand)" }}>
              View my map →
            </Link>
          </div>
        ) : (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Start marking cities as visited to build your map.
          </p>
        )}
      </div>
    </aside>
  );
}
