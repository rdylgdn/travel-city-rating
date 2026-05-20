import DashboardClient from "./DashboardClient";
import { mockUser, mockUserReviews, mockStats } from "@/lib/mock-user";
import { createClient } from "@/utils/supabase/server";
import { cities as allCities } from "@/lib/seed-data";
import { BudgetMode } from "@/lib/types";

export const metadata = { title: "Dashboard — CityRate" };

export type SavedCityEntry = { slug: string; budgetMode: BudgetMode };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let savedEntries: SavedCityEntry[] = mockUser.savedCityIds.map((id) => {
    const city = allCities.find((c) => c.id === id);
    return { slug: city?.slug ?? "", budgetMode: "budget" as BudgetMode };
  }).filter((e) => e.slug);

  if (user) {
    const { data: rows } = await supabase
      .from("saved_cities")
      .select("city_slug, budget_mode")
      .eq("user_id", user.id);

    savedEntries = (rows ?? []).map((r) => ({
      slug: r.city_slug,
      budgetMode: (r.budget_mode ?? "budget") as BudgetMode,
    }));
  }

  const savedCities = savedEntries
    .map((e) => {
      const city = allCities.find((c) => c.slug === e.slug);
      return city ? { city, budgetMode: e.budgetMode } : null;
    })
    .filter(Boolean) as { city: (typeof allCities)[0]; budgetMode: BudgetMode }[];

  return (
    <DashboardClient
      user={mockUser}
      savedCities={savedCities}
      reviews={mockUserReviews}
      stats={{ ...mockStats, savedCount: savedCities.length }}
    />
  );
}
