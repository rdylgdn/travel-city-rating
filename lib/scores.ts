import { City } from "./types";

const SEED_WEIGHT = 100;
const ANON_WEIGHT = 0.1; // 1/10th of a member review

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

export function blendScores(
  city: City,
  dbReviews: DbReview[],
  anonScores: number[] = []
): BlendedScores {
  function blendCategory(seed: number, userScores: (number | null)[]): number {
    const valid = userScores.filter((s): s is number => s !== null && s > 0);
    if (valid.length === 0) return seed;
    const sum = valid.reduce((a, b) => a + b, 0);
    return Math.round(((seed * SEED_WEIGHT + sum) / (SEED_WEIGHT + valid.length)) * 10) / 10;
  }

  function blendOverall(seed: number, userScores: (number | null)[], anon: number[]): number {
    const validUser = userScores.filter((s): s is number => s !== null && s > 0);
    const validAnon = anon.filter((s) => s > 0);
    const userSum = validUser.reduce((a, b) => a + b, 0);
    const anonSum = validAnon.reduce((a, b) => a + b, 0) * ANON_WEIGHT;
    const totalWeight = SEED_WEIGHT + validUser.length + validAnon.length * ANON_WEIGHT;
    if (totalWeight === SEED_WEIGHT) return seed;
    return Math.round(((seed * SEED_WEIGHT + userSum + anonSum) / totalWeight) * 10) / 10;
  }

  return {
    overall:      blendOverall(city.scores.overall, dbReviews.map(r => r.overall_rating), anonScores),
    costValue:    blendCategory(city.scores.costValue,    dbReviews.map(r => r.score_cost_value)),
    safety:       blendCategory(city.scores.safety,       dbReviews.map(r => r.score_safety)),
    food:         blendCategory(city.scores.food,         dbReviews.map(r => r.score_food)),
    culture:      blendCategory(city.scores.culture,      dbReviews.map(r => r.score_culture)),
    nature:       blendCategory(city.scores.nature,       dbReviews.map(r => r.score_nature)),
    nightlife:    blendCategory(city.scores.nightlife,    dbReviews.map(r => r.score_nightlife)),
    easeOfTravel: blendCategory(city.scores.easeOfTravel, dbReviews.map(r => r.score_ease_of_travel)),
    reviewCount: dbReviews.length,
  };
}
