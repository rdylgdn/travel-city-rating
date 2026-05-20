import { cities } from "@/lib/seed-data";
import { createClient } from "@/utils/supabase/server";
import ExploreClient from "@/components/ExploreClient";

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

  const [{ data: reviewRows }, { data: anonRows }, { data: savedRows }, { data: visitedRows }] =
    await Promise.all([
      supabase.from("reviews").select("city_slug"),
      supabase.from("anonymous_ratings").select("city_slug"),
      supabase.from("saved_cities").select("city_slug"),
      supabase.from("visited_cities").select("city_slug"),
    ]);

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
