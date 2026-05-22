import { createClient } from "@/utils/supabase/server";
import AdminUsersClient from "./AdminUsersClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Users — Admin — CityRate" };

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url, home_country, home_country_flag, role, updated_at")
    .order("updated_at", { ascending: false });

  // Get review counts per user
  const { data: reviewCounts } = await supabase
    .from("reviews")
    .select("user_id, status");

  const countMap: Record<string, { approved: number; total: number }> = {};
  for (const r of (reviewCounts ?? [])) {
    if (!countMap[r.user_id]) countMap[r.user_id] = { approved: 0, total: 0 };
    countMap[r.user_id].total++;
    if (r.status === "approved") countMap[r.user_id].approved++;
  }

  return (
    <AdminUsersClient
      users={(profiles ?? []).map((p) => ({
        ...p,
        reviewCount: countMap[p.id]?.total ?? 0,
        approvedReviewCount: countMap[p.id]?.approved ?? 0,
      }))}
    />
  );
}
