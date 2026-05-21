import { createClient } from "@/utils/supabase/server";
import SettingsClient from "./SettingsClient";

export const metadata = { title: "Settings — Admin — CityRate" };

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("platform_settings").select("*").order("key");
  return <SettingsClient initialRows={rows ?? []} />;
}
