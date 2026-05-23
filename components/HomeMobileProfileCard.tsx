import Link from "next/link";
import Image from "next/image";
import { Globe } from "lucide-react";
import { City } from "@/lib/types";
import { Profile, getTravelerBadge } from "@/lib/profile";

type Props = {
  profile: Profile | null;
  displayName: string;
  visitedCities: City[];
  visitedCountryCount: number;
  userId: string;
};

export default function HomeMobileProfileCard({ profile, displayName, visitedCities, visitedCountryCount, userId }: Props) {
  const badge = getTravelerBadge(visitedCountryCount);
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div
      className="rounded-3xl p-5 flex flex-col gap-4 transition-all"
      style={{
        background: "linear-gradient(135deg, #FEF3F0 0%, #F5F0FF 100%)",
        border: "1px solid #FF7A5933",
        boxShadow: "0 4px 16px rgba(255,122,89,0.10)",
      }}
    >
      {/* Header: avatar + name + badge */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0"
          style={{ background: "#FF7A5922" }}>
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt={displayName} width={48} height={48} className="object-cover w-full h-full" />
          ) : (
            <span className="font-bold text-base" style={{ color: "var(--brand)" }}>{initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate" style={{ color: "var(--text-primary)" }}>{displayName}</p>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5"
            style={{ background: "#FF7A5918", color: "var(--brand)" }}>
            {badge.label}
          </span>
        </div>
        <div className="text-center shrink-0">
          <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg"
            style={{ background: "var(--brand)", color: "#fff" }}>
            {visitedCountryCount}
          </div>
          <p className="text-[9px] mt-0.5" style={{ color: "var(--text-muted)" }}>countries</p>
        </div>
      </div>

      {/* Where you've been */}
      <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.6)" }}>
        <div className="flex items-center gap-1.5 mb-2">
          <Globe className="w-3.5 h-3.5" style={{ color: "#3DD9C5" }} />
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Where you&apos;ve been</p>
        </div>

        {visitedCities.length > 0 ? (
          <div className="flex gap-1.5">
            {visitedCities.slice(0, visitedCities.length > 5 ? 4 : 5).map((city) => (
              <Link key={city.id} href={`/cities/${city.slug}`}
                className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0" title={city.name}>
                <Image src={city.imageUrl} alt={city.name} fill className="object-cover" sizes="40px" />
              </Link>
            ))}
            {visitedCities.length > 5 && (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                +{visitedCities.length - 4}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>No cities visited yet</p>
        )}
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-2 gap-2">
        <Link href="/dashboard?tab=settings"
          className="text-center text-xs font-semibold py-2 rounded-xl transition-all hover:opacity-90"
          style={{ background: "var(--brand)", color: "#fff", boxShadow: "0 2px 6px rgba(255,122,89,0.25)" }}>
          See profile →
        </Link>
        <Link href={`/u/${userId}`}
          className="text-center text-xs font-semibold py-2 rounded-xl transition-all hover:opacity-80"
          style={{ background: "#3DD9C518", color: "#3DD9C5", border: "1px solid #3DD9C540" }}>
          View map →
        </Link>
      </div>
    </div>
  );
}
