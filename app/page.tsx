import { cities as seedCities } from "@/lib/seed-data";
import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import ExploreClient from "@/components/ExploreClient";
import HomeHero from "@/components/HomeHero";
import HomeFeatureStrips from "@/components/HomeFeatureStrips";
import HomeSidebar from "@/components/HomeSidebar";
import PersonalizedRecommendations from "@/components/PersonalizedRecommendations";
import { TravelStyle, BudgetMode } from "@/lib/types";
import { getPlatformSettings } from "@/lib/platform-settings";
import { adminCityToCity } from "@/lib/admin-cities";
import { PlacementRow } from "@/components/PlacementCard";
import { Profile } from "@/lib/profile";

function buildCountMap(rows: { city_slug: string }[] | null, slugs: string[]): Record<string, number> {
  const map: Record<string, number> = Object.fromEntries(slugs.map((s) => [s, 0]));
  for (const r of (rows ?? [])) {
    if (r.city_slug in map) map[r.city_slug]++;
  }
  return map;
}

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: { user } }, settings, { data: adminCityRows }, { data: archivedRows }, { data: placementRows }] = await Promise.all([
    supabase.auth.getUser(),
    getPlatformSettings(),
    supabase.from("admin_cities").select("*").eq("is_published", true),
    supabase.from("archived_slugs").select("slug"),
    supabase.from("placements").select("*").eq("is_active", true).order("grid_position").order("created_at"),
  ]);

  const archivedSet = new Set((archivedRows ?? []).map((r: { slug: string }) => r.slug));
  const adminCities = (adminCityRows ?? []).map(adminCityToCity);
  const cities = [...seedCities.filter((c) => !archivedSet.has(c.slug)), ...adminCities];
  const slugs = cities.map((c) => c.slug);

  const [{ data: reviewRows }, { data: anonRows }, { data: savedRows }, { data: visitedRows }, profileRes, { data: followingRows }] =
    await Promise.all([
      supabase.from("reviews").select("city_slug"),
      supabase.from("anonymous_ratings").select("city_slug"),
      supabase.from("saved_cities").select("city_slug"),
      supabase.from("visited_cities").select("city_slug"),
      user ? supabase.from("profiles").select("*").eq("id", user.id).single() : Promise.resolve({ data: null }),
      user ? supabase.from("follows").select("following_id").eq("follower_id", user.id) : Promise.resolve({ data: [] }),
    ]);

  // Social proof
  const networkVisitedCounts: Record<string, number> = {};
  if (user && (followingRows ?? []).length > 0) {
    const followingIds = (followingRows ?? []).map((r: { following_id: string }) => r.following_id);
    const { data: networkVisits } = await supabase.from("visited_cities").select("city_slug").in("user_id", followingIds);
    for (const r of (networkVisits ?? [])) {
      networkVisitedCounts[r.city_slug] = (networkVisitedCounts[r.city_slug] ?? 0) + 1;
    }
  }

  const profile = profileRes?.data as Profile | null;
  const preferredStyles = (profile?.travel_styles ?? []) as TravelStyle[];
  const savedSlugs = (savedRows ?? []).map((r) => r.city_slug);
  const visitedSlugsAll = (visitedRows ?? []).map((r) => r.city_slug);
  const excludeForRec = [...new Set([...savedSlugs, ...visitedSlugsAll])];
  const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "";

  const visitedCities = visitedSlugsAll
    .map((slug) => cities.find((c) => c.slug === slug))
    .filter(Boolean) as typeof cities;
  const visitedCountryCount = new Set(visitedCities.map((c) => c.countryIso)).size;

  const reviewCounts = buildCountMap(reviewRows, slugs);
  const anonCounts = buildCountMap(anonRows, slugs);
  const savedCounts = buildCountMap(savedRows, slugs);
  const visitedCounts = buildCountMap(visitedRows, slugs);

  const defaultBudgetMode: BudgetMode = (profile as Profile & { currency?: string })?.currency ? "budget" : "budget";

  const showSidebar = !!user && visitedCities.length > 0;

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <HomeHero />

      {/* Main content + optional sidebar */}
      <div className={`max-w-7xl mx-auto px-4 ${showSidebar ? "flex gap-6 items-start" : ""}`}>
        <div className="flex-1 min-w-0">
          {/* Personalized recommendations */}
          {settings.recommendations_enabled && preferredStyles.length > 0 && (
            <div className="py-4">
              <PersonalizedRecommendations
                allCities={cities}
                preferredStyles={preferredStyles}
                excludeSlugs={excludeForRec}
                budgetMode={defaultBudgetMode}
              />
            </div>
          )}

          {/* Feature strips */}
          <HomeFeatureStrips />

          {/* Full explore grid */}
          <div id="all-cities" className="py-4">
            <div className="flex items-center justify-between mb-4 px-0">
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>All Cities</h2>
            </div>
            <Suspense fallback={null}>
            <ExploreClient
              cities={cities}
              reviewCounts={reviewCounts}
              anonCounts={anonCounts}
              savedCounts={savedCounts}
              visitedCounts={visitedCounts}
              networkVisitedCounts={networkVisitedCounts}
              compareEnabled={settings.compare_feature_enabled}
              budgetModeEnabled={settings.budget_mode_selector}
              placements={(placementRows ?? []) as PlacementRow[]}
            />
            </Suspense>
          </div>
        </div>

        {/* Right sidebar — only for logged-in users with visited cities */}
        {showSidebar && (
          <div className="hidden lg:block pt-0 sticky top-16">
            <HomeSidebar
              profile={profile}
              displayName={displayName}
              visitedCities={visitedCities}
              visitedCountryCount={visitedCountryCount}
            />
          </div>
        )}
      </div>
    </div>
  );
}
