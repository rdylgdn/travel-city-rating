import { createClient } from "@/utils/supabase/server";
import { cities as seedCities } from "@/lib/seed-data";
import AdminCitiesClient from "./AdminCitiesClient";

export const metadata = { title: "Cities — Admin — CityRate" };

export default async function AdminCitiesPage() {
  const supabase = await createClient();
  const [{ data: adminCities }, { data: archivedRows }] = await Promise.all([
    supabase.from("admin_cities").select("*").order("created_at", { ascending: false }),
    supabase.from("archived_slugs").select("slug"),
  ]);

  const archivedSlugs = new Set((archivedRows ?? []).map((r) => r.slug));

  return (
    <AdminCitiesClient
      seedCities={seedCities}
      adminCities={adminCities ?? []}
      archivedSlugs={[...archivedSlugs]}
    />
  );
}
