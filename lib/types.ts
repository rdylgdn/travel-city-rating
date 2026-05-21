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

export type MonthData = {
  weather: number;           // 1–10
  crowds: "Low" | "Medium" | "High";
  costLevel: "Cheaper" | "Normal" | "Pricier";
  note?: string;
};

export type City = {
  id: string;
  slug: string;
  name: string;
  country: string;
  countryIso: string;
  region: Region;
  imageUrl: string;
  monthlyData?: Record<string, MonthData>;
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
  updatedAt?: string;
  imageUrls?: string[];
  status?: "pending" | "approved" | "rejected";
};

export type AnonymousRating = {
  id: string;
  cityId: string;
  overallScore: number;
  travelStyle: TravelStyle;
  createdAt: string;
};
