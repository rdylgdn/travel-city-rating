import DashboardClient from "./DashboardClient";
import { mockUser, mockUserReviews, mockStats } from "@/lib/mock-user";
import { createClient } from "@/utils/supabase/server";
import { cities as allCities } from "@/lib/seed-data";

export const metadata = { title: "Dashboard — CityRate" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch saved city slugs for the logged-in user
  let savedCities = allCities.filter((c) => mockUser.savedCityIds.includes(c.id));

  if (user) {
    const { data: rows } = await supabase
      .from("saved_cities")
      .select("city_slug")
      .eq("user_id", user.id);

    const slugs = new Set((rows ?? []).map((r) => r.city_slug));
    savedCities = allCities.filter((c) => slugs.has(c.slug));
  }

  return (
    <DashboardClient
      user={mockUser}
      savedCities={savedCities}
      reviews={mockUserReviews}
      stats={{ ...mockStats, savedCount: savedCities.length }}
    />
  );
}
