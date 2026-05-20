export type BudgetMode = "budget" | "midRange" | "luxury";

export type TravelStyle =
  | "Honeymoon"
  | "Solo"
  | "Couple"
  | "Friends"
  | "Family"
  | "Backpacking"
  | "Luxury"
  | "Adventure"
  | "Culture"
  | "Nature"
  | "Food"
  | "Nightlife"
  | "Beach"
  | "Digital Nomad";

export type Region =
  | "Southeast Asia"
  | "East Asia"
  | "South Asia"
  | "Europe"
  | "Middle East"
  | "Africa"
  | "North America"
  | "South America"
  | "Oceania";

export type City = {
  id: string;
  slug: string;
  name: string;
  country: string;
  countryIso: string; // ISO 3166-1 numeric code, matches world-atlas TopoJSON IDs
  region: Region;
  imageUrl: string;
  summary: string;
  whyVisit: string;
  bestAreas: string[];
  bestThingsToDo: string[];
  bestFor: TravelStyle[];
  scores: {
    overall: number;
    costValue: number;
    safety: number;
    food: number;
    culture: number;
    nature: number;
    nightlife: number;
    easeOfTravel: number;
  };
  dailyBudget: {
    budget: number;
    midRange: number;
    luxury: number;
    currency: string;
  };
  budgetBreakdown: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
    extras: number;
  };
  bestSeason: string;
  reviewCount: number;
  anonymousRatingCount: number;
  commonComplaints: string[];
};

export type Review = {
  id: string;
  cityId: string;
  authorName: string;
  travelStyle: TravelStyle;
  budgetCategory: BudgetMode;
  monthVisited: string;
  overallRating: number;
  writtenReview: string;
  pros: string[];
  cons: string[];
  createdAt: string;
};

export type AnonymousRating = {
  id: string;
  cityId: string;
  overallScore: number;
  travelStyle: TravelStyle;
  createdAt: string;
};
