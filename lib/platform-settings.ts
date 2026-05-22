import { createClient } from "@/utils/supabase/server";

export type PlatformSettings = {
  seed_weight_enabled: boolean;
  anonymous_ratings_enabled: boolean;
  guest_review_gate: boolean;
  compare_feature_enabled: boolean;
  compare_guest_limit: number;
  trip_planner_enabled: boolean;
  recommendations_enabled: boolean;
  public_profiles_enabled: boolean;
  follow_system_enabled: boolean;
  best_time_chart_enabled: boolean;
  gallery_enabled: boolean;
  review_images_enabled: boolean;
  suggest_city_enabled: boolean;
  budget_mode_selector: boolean;
  score_display_note: boolean;
};

export const SETTINGS_DEFAULTS: PlatformSettings = {
  seed_weight_enabled: true,
  anonymous_ratings_enabled: true,
  guest_review_gate: true,
  compare_feature_enabled: true,
  compare_guest_limit: 2,
  trip_planner_enabled: true,
  recommendations_enabled: true,
  public_profiles_enabled: true,
  follow_system_enabled: true,
  best_time_chart_enabled: true,
  gallery_enabled: true,
  review_images_enabled: true,
  suggest_city_enabled: true,
  budget_mode_selector: true,
  score_display_note: true,
};

export async function getPlatformSettings(existingClient?: Awaited<ReturnType<typeof createClient>>): Promise<PlatformSettings> {
  try {
    const supabase = existingClient ?? await createClient();
    const { data } = await supabase.from("platform_settings").select("key, value");
    if (!data) return SETTINGS_DEFAULTS;
    const map: Record<string, string> = {};
    for (const row of data) map[row.key] = row.value;
    return {
      seed_weight_enabled:       (map.seed_weight_enabled ?? "true") === "true",
      anonymous_ratings_enabled: (map.anonymous_ratings_enabled ?? "true") === "true",
      guest_review_gate:         (map.guest_review_gate ?? "true") === "true",
      compare_feature_enabled:   (map.compare_feature_enabled ?? "true") === "true",
      compare_guest_limit:       parseInt(map.compare_guest_limit ?? "2"),
      trip_planner_enabled:      (map.trip_planner_enabled ?? "true") === "true",
      recommendations_enabled:   (map.recommendations_enabled ?? "true") === "true",
      public_profiles_enabled:   (map.public_profiles_enabled ?? "true") === "true",
      follow_system_enabled:     (map.follow_system_enabled ?? "true") === "true",
      best_time_chart_enabled:   (map.best_time_chart_enabled ?? "true") === "true",
      gallery_enabled:           (map.gallery_enabled ?? "true") === "true",
      review_images_enabled:     (map.review_images_enabled ?? "true") === "true",
      suggest_city_enabled:      (map.suggest_city_enabled ?? "true") === "true",
      budget_mode_selector:      (map.budget_mode_selector ?? "true") === "true",
      score_display_note:        (map.score_display_note ?? "true") === "true",
    };
  } catch {
    return SETTINGS_DEFAULTS;
  }
}
