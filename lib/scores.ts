import { City } from "./types";

// Seed data acts as if it represents this many reviews
const SEED_WEIGHT = 10;

type DbReview = {
  overall_rating: number | null;
  score_cost_value: number | null;
  score_safety: number | null;
  score_food: number | null;
  score_culture: number | null;
  score_nature: number | null;
  score_nightlife: number | null;
  score_ease_of_travel: number | null;
};

export type BlendedScores = City["scores"] & { reviewCount: number };

export function blendScores(city: City, dbReviews: DbReview[]): BlendedScores {
  const n = dbReviews.length;
  if (n === 0) return { ...city.scores, reviewCount: 0 };

  function blend(seed: number, userScores: (number | null)[]): number {
    const valid = userScores.filter((s): s is number => s !== null && s > 0);
    if (valid.length === 0) return seed;
    const sum = valid.reduce((a, b) => a + b, 0);
    const blended = (seed * SEED_WEIGHT + sum) / (SEED_WEIGHT + valid.length);
    return Math.round(blended * 10) / 10;
  }

  return {
    overall:       blend(city.scores.overall,       dbReviews.map(r => r.overall_rating)),
    costValue:     blend(city.scores.costValue,      dbReviews.map(r => r.score_cost_value)),
    safety:        blend(city.scores.safety,         dbReviews.map(r => r.score_safety)),
    food:          blend(city.scores.food,           dbReviews.map(r => r.score_food)),
    culture:       blend(city.scores.culture,        dbReviews.map(r => r.score_culture)),
    nature:        blend(city.scores.nature,         dbReviews.map(r => r.score_nature)),
    nightlife:     blend(city.scores.nightlife,      dbReviews.map(r => r.score_nightlife)),
    easeOfTravel:  blend(city.scores.easeOfTravel,   dbReviews.map(r => r.score_ease_of_travel)),
    reviewCount: n,
  };
}
