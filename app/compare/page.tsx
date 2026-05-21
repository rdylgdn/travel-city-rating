import { Suspense } from "react";
import { cities as allCities } from "@/lib/seed-data";
import { createClient } from "@/utils/supabase/server";
import CompareClient from "./CompareClient";

export const metadata = { title: "Compare Cities — CityRate" };

type Props = { searchParams: Promise<{ cities?: string }> };

async function CompareLoader({ searchParams }: Props) {
  const { cities: citiesParam } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const slugs = (citiesParam ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const MAX = user ? 4 : 2;
  const activeSlugs = slugs.slice(0, MAX);

  const selectedCities = activeSlugs
    .map((slug) => allCities.find((c) => c.slug === slug))
    .filter(Boolean) as (typeof allCities);

  let reviewsMap: Record<string, unknown[]> = {};
  if (user && selectedCities.length > 0) {
    const { data: rows } = await supabase
      .from("reviews")
      .select("*")
      .in("city_slug", activeSlugs)
      .order("created_at", { ascending: false });
    for (const slug of activeSlugs) {
      reviewsMap[slug] = (rows ?? []).filter((r) => r.city_slug === slug);
    }
  }

  return (
    <CompareClient
      allCities={allCities}
      selectedCities={selectedCities}
      isLoggedIn={!!user}
      reviewsMap={reviewsMap}
      guestLimit={2}
    />
  );
}

export default function ComparePage(props: Props) {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-8"><div className="h-8 w-48 bg-gray-100 rounded-xl animate-pulse mb-4" /><div className="h-4 w-64 bg-gray-50 rounded animate-pulse" /></div>}>
      <CompareLoader {...props} />
    </Suspense>
  );
}
