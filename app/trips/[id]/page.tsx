import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cities as allCities } from "@/lib/seed-data";
import { getPlatformSettings } from "@/lib/platform-settings";
import TripCanvasClient from "./TripCanvasClient";

type Props = { params: Promise<{ id: string }> };

export default async function TripCanvasPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: { user } }, settings] = await Promise.all([
    supabase.auth.getUser(),
    getPlatformSettings(supabase),
  ]);
  if (!user) redirect("/?auth=signin");

  const { data: trip } = await supabase
    .from("trips")
    .select("*, trip_cities(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!trip) redirect("/trips");

  const cityMap = Object.fromEntries(allCities.map((c) => [c.slug, c]));
  const tripCitiesEnriched = (trip.trip_cities ?? [])
    .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
    .map((tc: { city_slug: string; duration_days: number; position: number }) => ({
      ...tc,
      city: cityMap[tc.city_slug] ?? null,
    }));

  return (
    <TripCanvasClient
      trip={trip}
      tripCities={tripCitiesEnriched}
      userId={user.id}
      showAffiliates={settings.trip_affiliates_enabled}
    />
  );
}
