import { createClient } from "@/utils/supabase/server";
import { cities as seedCities } from "@/lib/seed-data";
import PlacementsClient from "./PlacementsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Placements — Admin — CityRate" };

export default async function AdminPlacementsPage() {
  const supabase = await createClient();
  const [{ data }, { count: adminCityCount }] = await Promise.all([
    supabase.from("placements").select("*").order("grid_position").order("created_at"),
    supabase.from("admin_cities").select("*", { count: "exact", head: true }).eq("is_published", true),
  ]);
  const cityCount = seedCities.length + (adminCityCount ?? 0);
  return <PlacementsClient initialPlacements={data ?? []} cityCount={cityCount} />;
}
