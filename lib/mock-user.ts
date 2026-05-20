import { City, Review, TravelStyle, BudgetMode } from "./types";
import { cities, reviews } from "./seed-data";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  joinedDate: string;
  travelStyles: TravelStyle[];
  defaultBudgetMode: BudgetMode;
  savedCityIds: string[];
  visitedCityIds: string[];
};

export const mockUser: UserProfile = {
  id: "u1",
  name: "Alex Rivera",
  email: "alex@example.com",
  avatarInitials: "AR",
  joinedDate: "March 2025",
  travelStyles: ["Solo", "Food", "Culture"],
  defaultBudgetMode: "budget",
  savedCityIds: ["1", "2", "4", "6"],
  visitedCityIds: ["1", "3", "5"],
};

export const mockSavedCities: City[] = cities.filter((c) =>
  mockUser.savedCityIds.includes(c.id)
);

export const mockUserReviews: Review[] = reviews.filter(
  (r) => r.cityId === "1" || r.cityId === "2"
).map((r) => ({ ...r, authorName: mockUser.name }));

export type CityStats = {
  savedCount: number;
  reviewCount: number;
  visitedCount: number;
};

export const mockStats: CityStats = {
  savedCount: mockUser.savedCityIds.length,
  reviewCount: mockUserReviews.length,
  visitedCount: mockUser.visitedCityIds.length,
};
