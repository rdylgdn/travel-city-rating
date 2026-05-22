import { City, Region, TravelStyle } from "./types";

export type AdminCityRow = {
  id: string;
  slug: string;
  name: string;
  country: string;
  country_iso: string;
  region: string;
  image_url: string;
  summary: string;
  why_visit: string;
  best_areas: string[];
  best_things_to_do: string[];
  best_for: string[];
  common_complaints: string[];
  score_overall: number;
  score_cost_value: number;
  score_safety: number;
  score_food: number;
  score_culture: number;
  score_nature: number;
  score_nightlife: number;
  score_ease_of_travel: number;
  budget_budget: number;
  budget_mid_range: number;
  budget_luxury: number;
  breakdown_accommodation: number;
  breakdown_food: number;
  breakdown_transport: number;
  breakdown_activities: number;
  breakdown_extras: number;
  best_season: string;
  budget_breakdowns?: Record<string, Record<string, number>> | null;
  monthly_data?: Record<string, unknown> | null;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
};

function sumBreakdown(bd: Record<string, number>): number {
  return Object.values(bd).reduce((a, b) => a + b, 0);
}

export function adminCityToCity(row: AdminCityRow): City {
  const bds = row.budget_breakdowns;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    country: row.country,
    countryIso: row.country_iso ?? "",
    region: (row.region ?? "Europe") as Region,
    imageUrl: row.image_url ?? "",
    summary: row.summary ?? "",
    whyVisit: row.why_visit ?? "",
    bestAreas: row.best_areas ?? [],
    bestThingsToDo: row.best_things_to_do ?? [],
    bestFor: (row.best_for ?? []) as TravelStyle[],
    commonComplaints: row.common_complaints ?? [],
    scores: {
      overall:      row.score_overall ?? 7.0,
      costValue:    row.score_cost_value ?? 7.0,
      safety:       row.score_safety ?? 7.0,
      food:         row.score_food ?? 7.0,
      culture:      row.score_culture ?? 7.0,
      nature:       row.score_nature ?? 7.0,
      nightlife:    row.score_nightlife ?? 7.0,
      easeOfTravel: row.score_ease_of_travel ?? 7.0,
    },
    dailyBudget: {
      budget:   bds?.budget   ? sumBreakdown(bds.budget)   : (row.budget_budget   ?? 50),
      midRange: bds?.midRange ? sumBreakdown(bds.midRange) : (row.budget_mid_range ?? 100),
      luxury:   bds?.luxury   ? sumBreakdown(bds.luxury)   : (row.budget_luxury   ?? 200),
      currency: "USD",
    },
    budgetBreakdown: bds?.budget ? {
      accommodation: bds.budget.accommodation ?? 20,
      food:          bds.budget.food          ?? 15,
      transport:     bds.budget.transport     ?? 10,
      activities:    bds.budget.activities    ?? 10,
      extras:        bds.budget.extras        ?? 5,
    } : {
      accommodation: row.breakdown_accommodation ?? 20,
      food:          row.breakdown_food          ?? 15,
      transport:     row.breakdown_transport     ?? 10,
      activities:    row.breakdown_activities    ?? 10,
      extras:        row.breakdown_extras        ?? 5,
    },
    bestSeason: row.best_season ?? "",
    monthlyData: row.monthly_data as Record<string, import("./types").MonthData> | undefined,
    reviewCount: 0,
    anonymousRatingCount: 0,
  };
}
