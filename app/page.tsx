import { cities } from "@/lib/seed-data";
import { createClient } from "@/utils/supabase/server";
import ExploreClient from "@/components/ExploreClient";
import PersonalizedRecommendations from "@/components/PersonalizedRecommendations";
import { TravelStyle } from "@/lib/types";

function buildCountMap(rows: { city_slug: string }[] | null, slugs: string[]): Record<string, number> {
  const map: Record<string, number> = Object.fromEntries(slugs.map((s) => [s, 0]));
  for (const r of (rows ?? [])) {
    if (r.city_slug in map) map[r.city_slug]++;
  }
  return map;
}

export default async function HomePage() {
  const supabase = await createClient();
  const slugs = cities.map((c) => c.slug);

  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: reviewRows }, { data: anonRows }, { data: savedRows }, { data: visitedRows }, profileRes] =
    await Promise.all([
      supabase.from("reviews").select("city_slug"),
      supabase.from("anonymous_ratings").select("city_slug"),
      supabase.from("saved_cities").select("city_slug"),
      supabase.from("visited_cities").select("city_slug"),
      user ? supabase.from("profiles").select("travel_styles, currency").eq("id", user.id).single() : Promise.resolve({ data: null }),
    ]);

  const profile = profileRes?.data ?? null;
  const preferredStyles = (profile?.travel_styles ?? []) as TravelStyle[];
  const savedSlugs = (savedRows ?? []).map((r) => r.city_slug);
  const visitedSlugsForRec = (visitedRows ?? []).map((r) => r.city_slug);
  const excludeForRec = [...new Set([...savedSlugs, ...visitedSlugsForRec])];

  return (
    <div>
      <div className="bg-gradient-to-b from-rose-50 to-white px-4 py-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Find cities that match <span className="text-rose-500">your travel style</span>
        </h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Real traveler ratings · Budget-aware · No booking required
        </p>
      </div>

      {preferredStyles.length > 0 && (
        <PersonalizedRecommendations
          allCities={cities}
          preferredStyles={preferredStyles}
          excludeSlugs={excludeForRec}
          budgetMode={(profile?.currency ? "budget" : "budget") as "budget"}
        />
      )}

      <ExploreClient
        cities={cities}
        reviewCounts={buildCountMap(reviewRows, slugs)}
        anonCounts={buildCountMap(anonRows, slugs)}
        savedCounts={buildCountMap(savedRows, slugs)}
        visitedCounts={buildCountMap(visitedRows, slugs)}
      />
    </div>
  );
}
