import { City, TravelStyle } from "./types";

export function getRecommendations(
  allCities: City[],
  preferredStyles: TravelStyle[],
  excludeSlugs: string[],
  limit = 5
): City[] {
  if (preferredStyles.length === 0) return [];

  const excluded = new Set(excludeSlugs);

  return allCities
    .filter((c) => !excluded.has(c.slug))
    .map((c) => ({
      city: c,
      score: c.bestFor.filter((s) => preferredStyles.includes(s as TravelStyle)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.city.scores.overall - a.city.scores.overall)
    .slice(0, limit)
    .map(({ city }) => city);
}
