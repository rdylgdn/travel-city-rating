import DashboardClient from "./DashboardClient";
import { createClient } from "@/utils/supabase/server";
import { cities as allCities } from "@/lib/seed-data";
import { BudgetMode, Review } from "@/lib/types";
import { Profile } from "@/lib/profile";
import { FollowingUser } from "@/components/dashboard/Following";

export const metadata = { title: "Dashboard — CityRate" };

export type SavedCityEntry = { slug: string; budgetMode: BudgetMode };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let savedEntries: SavedCityEntry[] = [];
  let visitedSlugs: string[] = [];
  let userReviews: Review[] = [];
  let profile: Profile | null = null;
  let followingUsers: FollowingUser[] = [];

  if (user) {
    const [savedRes, visitedRes, reviewsRes, profileRes] = await Promise.all([
      supabase.from("saved_cities").select("city_slug, budget_mode").eq("user_id", user.id),
      supabase.from("visited_cities").select("city_slug").eq("user_id", user.id),
      supabase.from("reviews").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ]);

    savedEntries = (savedRes.data ?? []).map((r) => ({
      slug: r.city_slug,
      budgetMode: (r.budget_mode ?? "budget") as BudgetMode,
    }));

    visitedSlugs = (visitedRes.data ?? []).map((r) => r.city_slug);

    userReviews = (reviewsRes.data ?? []).map((r) => {
      const city = allCities.find((c) => c.slug === r.city_slug);
      return {
        id: r.id,
        cityId: city?.id ?? r.city_slug,
        authorName: profileRes.data?.display_name ?? user.email?.split("@")[0] ?? "You",
        travelStyle: r.travel_style,
        budgetCategory: r.budget_category,
        monthVisited: r.month_visited ?? "",
        overallRating: r.overall_rating,
        writtenReview: r.written_review ?? "",
        pros: r.pros ?? [],
        cons: r.cons ?? [],
        createdAt: r.created_at?.slice(0, 10) ?? "",
      } as Review;
    });

    profile = profileRes.data ?? null;

    // Fetch following list with profiles and visited counts
    const { data: followRows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    const followingIds = (followRows ?? []).map((r) => r.following_id);
    if (followingIds.length > 0) {
      const [{ data: followingProfiles }, { data: followingVisited }] = await Promise.all([
        supabase.from("profiles").select("id, display_name, username, avatar_url, home_country, home_country_flag, travel_styles").in("id", followingIds),
        supabase.from("visited_cities").select("user_id, city_slug").in("user_id", followingIds),
      ]);

      const countriesPerUser: Record<string, Set<string>> = {};
      for (const row of (followingVisited ?? [])) {
        const city = allCities.find((c) => c.slug === row.city_slug);
        if (!city) continue;
        if (!countriesPerUser[row.user_id]) countriesPerUser[row.user_id] = new Set();
        countriesPerUser[row.user_id].add(city.countryIso);
      }

      followingUsers = (followingProfiles ?? []).map((p) => ({
        id: p.id,
        display_name: p.display_name,
        username: p.username,
        avatar_url: p.avatar_url,
        home_country: p.home_country,
        home_country_flag: p.home_country_flag,
        travel_styles: p.travel_styles,
        visitedCountryCount: countriesPerUser[p.id]?.size ?? 0,
      }));
    }
  }

  const savedCities = savedEntries
    .map((e) => {
      const city = allCities.find((c) => c.slug === e.slug);
      return city ? { city, budgetMode: e.budgetMode } : null;
    })
    .filter(Boolean) as { city: (typeof allCities)[0]; budgetMode: BudgetMode }[];

  const visitedCities = visitedSlugs
    .map((slug) => allCities.find((c) => c.slug === slug))
    .filter(Boolean) as (typeof allCities);

  const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "Traveler";
  const displayEmail = user?.email ?? "";

  return (
    <DashboardClient
      userId={user?.id ?? ""}
      displayName={displayName}
      displayEmail={displayEmail}
      profile={profile}
      savedCities={savedCities}
      visitedCities={visitedCities}
      reviews={userReviews}
      followingUsers={followingUsers}
      stats={{
        savedCount: savedCities.length,
        reviewCount: userReviews.length,
        visitedCount: visitedCities.length,
      }}
    />
  );
}
