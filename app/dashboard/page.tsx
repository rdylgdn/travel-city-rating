import DashboardClient from "./DashboardClient";
import { mockUser, mockUserReviews } from "@/lib/mock-user";
import { createClient } from "@/utils/supabase/server";
import { cities as allCities } from "@/lib/seed-data";
import { BudgetMode } from "@/lib/types";

export const metadata = { title: "Dashboard — CityRate" };

export type SavedCityEntry = { slug: string; budgetMode: BudgetMode };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let savedEntries: SavedCityEntry[] = [];
  let visitedSlugs: string[] = [];

  if (user) {
    const [savedRes, visitedRes] = await Promise.all([
      supabase.from("saved_cities").select("city_slug, budget_mode").eq("user_id", user.id),
      supabase.from("visited_cities").select("city_slug").eq("user_id", user.id),
    ]);
    savedEntries = (savedRes.data ?? []).map((r) => ({
      slug: r.city_slug,
      budgetMode: (r.budget_mode ?? "budget") as BudgetMode,
    }));
    visitedSlugs = (visitedRes.data ?? []).map((r) => r.city_slug);
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

  return (
    <DashboardClient
      user={mockUser}
      savedCities={savedCities}
      visitedCities={visitedCities}
      reviews={mockUserReviews}
      stats={{
        savedCount: savedCities.length,
        reviewCount: mockUserReviews.length,
        visitedCount: visitedCities.length,
      }}
    />
  );
}
