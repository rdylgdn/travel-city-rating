import { createClient } from "@/utils/supabase/server";
import AffiliatesClient from "./AffiliatesClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Affiliate Links — Admin — CityRate" };

export default async function AdminAffiliatesPage() {
  const supabase = await createClient();
  const { data: links } = await supabase
    .from("affiliate_links")
    .select("*")
    .order("category").order("type").order("name");
  return <AffiliatesClient initialLinks={links ?? []} />;
}
