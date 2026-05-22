import Link from "next/link";
import Image from "next/image";
import { Globe, MapPin } from "lucide-react";
import { City } from "@/lib/types";
import { Profile, getTravelerBadge, getContinentsVisited } from "@/lib/profile";

type Props = {
  profile: Profile | null;
  displayName: string;
  visitedCities: City[];
  visitedCountryCount: number;
};

export default function HomeUserSection({ profile, displayName, visitedCities, visitedCountryCount }: Props) {
  const badge = getTravelerBadge(visitedCountryCount);
  const continents = getContinentsVisited(visitedCities);
  const initials = displayName.slice(0, 2).toUpperCase();
  const travelStyles = (profile?.travel_styles ?? []) as string[];

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Travel DNA */}
        <div className="rounded-2xl p-5 flex items-center gap-5"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center shrink-0"
            style={{ background: "#FF7A5918" }}>
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt={displayName} width={56} height={56} className="object-cover w-full h-full" />
            ) : (
              <span className="font-bold text-lg" style={{ color: "var(--brand)" }}>{initials}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-bold" style={{ color: "var(--text-primary)" }}>{displayName}</p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "var(--brand)" + "18", color: "var(--brand)" }}>
                {badge.label}
              </span>
            </div>
            {profile?.bio && (
              <p className="text-sm line-clamp-1 mb-2" style={{ color: "var(--text-secondary)" }}>{profile.bio}</p>
            )}
            {travelStyles.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {travelStyles.slice(0, 3).map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Score */}
          <div className="shrink-0 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-1"
              style={{ background: "var(--brand)", color: "#fff" }}>
              {visitedCountryCount}
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>countries</p>
          </div>

          <Link href="/dashboard" className="shrink-0 text-xs font-semibold px-3 py-2 rounded-xl transition-all hover:opacity-80"
            style={{ background: "var(--bg-primary)", color: "var(--brand)", border: "1px solid var(--border)" }}>
            Profile →
          </Link>
        </div>

        {/* Where you've been */}
        <div className="rounded-2xl p-5"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" style={{ color: "#3DD9C5" }} />
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Where you&apos;ve been</p>
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
              <span><strong style={{ color: "var(--text-primary)" }}>{visitedCountryCount}</strong> countries</span>
              {continents.length > 0 && (
                <span><strong style={{ color: "var(--text-primary)" }}>{continents.length}</strong> continents</span>
              )}
            </div>
          </div>

          {visitedCities.length > 0 ? (
            <div className="flex items-center gap-2">
              {/* City photo strip */}
              <div className="flex gap-2 flex-1 overflow-hidden">
                {visitedCities.slice(0, 5).map((city) => (
                  <Link key={city.id} href={`/cities/${city.slug}`}
                    className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 group" title={city.name}>
                    <Image src={city.imageUrl} alt={city.name} fill className="object-cover group-hover:scale-110 transition-transform" sizes="48px" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  </Link>
                ))}
                {visitedCities.length > 5 && (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: "var(--bg-primary)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                    +{visitedCities.length - 5}
                  </div>
                )}
              </div>
              <Link href="/dashboard?tab=visited"
                className="shrink-0 text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap transition-all hover:opacity-80"
                style={{ background: "#3DD9C518", color: "#3DD9C5", border: "1px solid #3DD9C533" }}>
                View map →
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8" style={{ color: "var(--border)" }} />
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>No cities visited yet</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Mark cities as visited to build your map</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
