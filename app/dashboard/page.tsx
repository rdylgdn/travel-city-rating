import DashboardClient from "./DashboardClient";
import { createClient } from "@/utils/supabase/server";
import { cities as allCities } from "@/lib/seed-data";
import { BudgetMode, Review } from "@/lib/types";
import { Profile } from "@/lib/profile";

export const metadata = { title: "Dashboard — CityRate" };

export type SavedCityEntry = { slug: string; budgetMode: BudgetMode };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let savedEntries: SavedCityEntry[] = [];
  let visitedSlugs: string[] = [];
  let userReviews: Review[] = [];
  let profile: Profile | null = null;

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
      stats={{
        savedCount: savedCities.length,
        reviewCount: userReviews.length,
        visitedCount: visitedCities.length,
      }}
    />
  );
}
