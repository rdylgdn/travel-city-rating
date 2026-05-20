import { cities } from "@/lib/seed-data";
import { createClient } from "@/utils/supabase/server";
import ExploreClient from "@/components/ExploreClient";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: reviewRows }, { data: anonRows }] = await Promise.all([
    supabase.from("reviews").select("city_slug"),
    supabase.from("anonymous_ratings").select("city_slug"),
  ]);

  const reviewCounts: Record<string, number> = {};
  for (const r of (reviewRows ?? [])) {
    reviewCounts[r.city_slug] = (reviewCounts[r.city_slug] ?? 0) + 1;
  }

  const anonCounts: Record<string, number> = {};
  for (const r of (anonRows ?? [])) {
    anonCounts[r.city_slug] = (anonCounts[r.city_slug] ?? 0) + 1;
  }

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
      <ExploreClient cities={cities} reviewCounts={reviewCounts} anonCounts={anonCounts} />
    </div>
  );
}
