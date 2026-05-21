import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cities as allCities } from "@/lib/seed-data";
import TripPlannerClient from "./TripPlannerClient";

export const metadata = { title: "Trip Planner — CityRate" };

export default async function TripsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/?auth=signin");

  const { data: trips } = await supabase
    .from("trips")
    .select("*, trip_cities(*)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <TripPlannerClient
      userId={user.id}
      allCities={allCities}
      initialTrips={trips ?? []}
    />
  );
}
