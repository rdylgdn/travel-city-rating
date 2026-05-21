import { createClient } from "@/utils/supabase/server";
import { cities as allCities } from "@/lib/seed-data";
import AdminReviewsClient from "./AdminReviewsClient";

export const metadata = { title: "Reviews — Admin — CityRate" };

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch profiles for all reviewers
  const reviewerIds = [...new Set((reviews ?? []).map((r) => r.user_id))];
  let profilesMap: Record<string, { display_name: string | null; avatar_url: string | null }> = {};
  if (reviewerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", reviewerIds);
    profilesMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
  }

  const enriched = (reviews ?? []).map((r) => ({
    ...r,
    city: allCities.find((c) => c.slug === r.city_slug),
    authorName: profilesMap[r.user_id]?.display_name ?? r.user_email?.split("@")[0] ?? "Traveler",
    avatarUrl: profilesMap[r.user_id]?.avatar_url ?? null,
  }));

  return <AdminReviewsClient reviews={enriched} />;
}
