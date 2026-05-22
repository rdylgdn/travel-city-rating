import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Globe, Bookmark, CheckCircle2, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { cities as allCities } from "@/lib/seed-data";
import { getTravelerBadge, getContinentsVisited } from "@/lib/profile";
import { cn } from "@/lib/utils";
import FollowButton from "@/components/FollowButton";
import ReviewCard from "@/components/ReviewCard";
import ProfileMapWrapper from "./ProfileMapWrapper";

type Props = { params: Promise<{ handle: string }> };

export default async function PublicProfilePage({ params }: Props) {
  const { handle } = await params;
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Look up by username first, then by user ID
  let profileData = null;
  let userId = "";

  const { data: byUsername } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", handle)
    .single();

  if (byUsername) {
    profileData = byUsername;
    userId = byUsername.id;
  } else {
    const { data: byId } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", handle)
      .single();
    if (byId) { profileData = byId; userId = byId.id; }
  }

  if (!profileData || !userId) notFound();

  const isOwnProfile = currentUser?.id === userId;

  // Fetch all data in parallel
  const [
    { data: visitedRows },
    { data: savedRows },
    { data: reviews },
    { count: followerCount },
    { count: followingCount },
    { data: isFollowingRow },
  ] = await Promise.all([
    supabase.from("visited_cities").select("city_slug").eq("user_id", userId),
    supabase.from("saved_cities").select("city_slug").eq("user_id", userId),
    supabase.from("reviews").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(3),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
    currentUser && !isOwnProfile
      ? supabase.from("follows").select("id").eq("follower_id", currentUser.id).eq("following_id", userId).single()
      : Promise.resolve({ data: null }),
  ]);

  const visitedCities = (visitedRows ?? [])
    .map((r) => allCities.find((c) => c.slug === r.city_slug))
    .filter(Boolean) as typeof allCities;

  const visitedCountryCount = new Set(visitedCities.map((c) => c.countryIso)).size;
  const continents = getContinentsVisited(visitedCities);
  const badge = getTravelerBadge(visitedCountryCount);
  const displayName = profileData.display_name ?? handle;
  const initials = displayName.slice(0, 2).toUpperCase();
  const isFollowing = !!isFollowingRow;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

      {/* Profile header */}
      <div className="flex items-start gap-5">
        <div className="w-20 h-20 rounded-full bg-rose-100 overflow-hidden flex items-center justify-center shrink-0">
          {profileData.avatar_url ? (
            <Image src={profileData.avatar_url} alt={displayName} width={80} height={80} className="object-cover w-full h-full" />
          ) : (
            <span className="text-rose-600 font-bold text-2xl">{initials}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                {profileData.role === "admin" && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">Admin</span>
                )}
                {profileData.role === "verified" && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">✓ Verified</span>
                )}
                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", badge.bg, badge.color)}>
                  {badge.label}
                </span>
              </div>
              {profileData.username && (
                <p className="text-sm text-gray-400 mt-0.5">@{profileData.username}</p>
              )}
              {profileData.home_country && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-base">{profileData.home_country_flag}</span>
                  <span className="text-sm text-gray-500">From {profileData.home_country}</span>
                </div>
              )}
              {profileData.bio && (
                <p className="text-sm text-gray-500 italic mt-1">{profileData.bio}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isOwnProfile && currentUser && (
                <FollowButton
                  targetUserId={userId}
                  currentUserId={currentUser.id}
                  initialIsFollowing={isFollowing}
                />
              )}
              {isOwnProfile && (
                <Link href="/dashboard" className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-rose-400 hover:text-rose-500 transition-all">
                  Edit profile
                </Link>
              )}
            </div>
          </div>

          {/* Travel style tags */}
          {profileData.travel_styles?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(profileData.travel_styles as string[]).map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {[
          { icon: CheckCircle2, label: "Cities", value: visitedCities.length, color: "text-green-500" },
          { icon: Globe, label: "Countries", value: visitedCountryCount, color: "text-green-600" },
          { icon: MapPin, label: "Continents", value: continents.length, color: "text-blue-500" },
          { icon: Users, label: "Followers", value: followerCount ?? 0, color: "text-rose-500" },
          { icon: Users, label: "Following", value: followingCount ?? 0, color: "text-gray-500" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
            <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
            <p className="text-lg font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* World map */}
      {visitedCities.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">Visited countries</h2>
          <ProfileMapWrapper visitedCities={visitedCities} />
          {continents.length > 0 && (
            <p className="text-xs text-gray-400 mt-2 text-center">{continents.join(" · ")}</p>
          )}
        </div>
      )}

      {/* Saved cities preview */}
      {(savedRows ?? []).length > 0 && (
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">
            Saved cities
            <span className="text-sm text-gray-400 font-normal ml-2">({(savedRows ?? []).length})</span>
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(savedRows ?? []).map((r) => {
              const city = allCities.find((c) => c.slug === r.city_slug);
              if (!city) return null;
              return (
                <Link key={r.city_slug} href={`/cities/${city.slug}`}
                  className="relative w-28 h-20 rounded-xl overflow-hidden shrink-0 group">
                  <Image src={city.imageUrl} alt={city.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="112px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-1.5 left-2">
                    <p className="text-white text-xs font-semibold leading-tight">{city.name}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent reviews */}
      {(reviews ?? []).length > 0 && (
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">
            Recent reviews
            <span className="text-sm text-gray-400 font-normal ml-2">({(reviews ?? []).length})</span>
          </h2>
          <div className="space-y-3">
            {(reviews ?? []).map((r) => {
              const city = allCities.find((c) => c.slug === r.city_slug);
              return (
                <div key={r.id}>
                  {city && (
                    <Link href={`/cities/${city.slug}`} className="inline-block text-xs font-semibold text-gray-500 hover:text-rose-500 mb-1.5 transition-colors">
                      {city.name}, {city.country} →
                    </Link>
                  )}
                  <ReviewCard review={{
                    id: r.id, cityId: city?.id ?? "",
                    authorName: displayName,
                    travelStyle: r.travel_style, budgetCategory: r.budget_category,
                    monthVisited: r.month_visited ?? "", overallRating: r.overall_rating,
                    writtenReview: r.written_review ?? "",
                    pros: r.pros ?? [], cons: r.cons ?? [],
                    createdAt: r.created_at ?? "", updatedAt: r.updated_at ?? "",
                  }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {visitedCities.length === 0 && (savedRows ?? []).length === 0 && (reviews ?? []).length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>This traveler hasn&apos;t shared their adventures yet.</p>
        </div>
      )}
    </div>
  );
}
