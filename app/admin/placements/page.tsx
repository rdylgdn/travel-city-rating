import { createClient } from "@/utils/supabase/server";
import PlacementsClient from "./PlacementsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Placements — Admin — CityRate" };

export default async function AdminPlacementsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("placements")
    .select("*")
    .order("grid_position").order("created_at");
  return <PlacementsClient initialPlacements={data ?? []} />;
}
