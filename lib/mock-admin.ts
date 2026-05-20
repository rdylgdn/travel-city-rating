import { TravelStyle } from "./types";

export type SuggestionStatus = "pending" | "approved" | "rejected";

export type CitySuggestion = {
  id: string;
  cityName: string;
  country: string;
  why: string;
  travelStyles: TravelStyle[];
  submittedBy: string;
  submittedAt: string;
  status: SuggestionStatus;
};

export const mockSuggestions: CitySuggestion[] = [
  {
    id: "s1",
    cityName: "Medellín",
    country: "Colombia",
    why: "Transformed city with great weather, affordable living, growing food scene and excellent nightlife. Perfect for digital nomads.",
    travelStyles: ["Digital Nomad", "Nightlife", "Culture"],
    submittedBy: "marco.traveler@gmail.com",
    submittedAt: "2025-05-10",
    status: "pending",
  },
  {
    id: "s2",
    cityName: "Tbilisi",
    country: "Georgia",
    why: "Underrated gem — incredible food, wine country, ancient architecture, very affordable and safe.",
    travelStyles: ["Food", "Culture", "Backpacking"],
    submittedBy: "sara_explores@hotmail.com",
    submittedAt: "2025-05-12",
    status: "pending",
  },
  {
    id: "s3",
    cityName: "Chiang Mai",
    country: "Thailand",
    why: "Best city in Thailand for longer stays. Temples, mountains, amazing food, very cheap.",
    travelStyles: ["Digital Nomad", "Culture", "Nature", "Food"],
    submittedBy: "nomad.notes@gmail.com",
    submittedAt: "2025-05-14",
    status: "pending",
  },
  {
    id: "s4",
    cityName: "Porto",
    country: "Portugal",
    why: "Smaller and more charming than Lisbon. Best wine, riverside bars, very walkable.",
    travelStyles: ["Couple", "Honeymoon", "Food"],
    submittedBy: "travelwithkate@gmail.com",
    submittedAt: "2025-05-08",
    status: "approved",
  },
  {
    id: "s5",
    cityName: "Generic Tourist Trap",
    country: "Nowhere",
    why: "just put it in",
    travelStyles: [],
    submittedBy: "spam@spam.com",
    submittedAt: "2025-05-15",
    status: "rejected",
  },
];

export type AdminStats = {
  totalCities: number;
  totalReviews: number;
  pendingSuggestions: number;
  totalAnonymousRatings: number;
  totalUsers: number;
};

export const mockAdminStats: AdminStats = {
  totalCities: 8,
  totalReviews: 3,
  pendingSuggestions: 3,
  totalAnonymousRatings: 2813,
  totalUsers: 142,
};
