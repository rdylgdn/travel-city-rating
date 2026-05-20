import { City, TravelStyle } from "./types";

export type Profile = {
  id: string;
  display_name: string | null;
  bio: string | null;
  home_country: string | null;
  home_country_flag: string | null;
  travel_styles: TravelStyle[] | null;
  avatar_url: string | null;
  updated_at: string;
};

export type TravelerBadge = {
  label: string;
  color: string;
  bg: string;
};

const BADGES: { min: number; label: string; color: string; bg: string }[] = [
  { min: 0,  label: "New Traveler",   color: "text-gray-600",   bg: "bg-gray-100" },
  { min: 1,  label: "First Steps",    color: "text-blue-600",   bg: "bg-blue-100" },
  { min: 4,  label: "Explorer",       color: "text-green-600",  bg: "bg-green-100" },
  { min: 11, label: "Adventurer",     color: "text-orange-600", bg: "bg-orange-100" },
  { min: 21, label: "Globetrotter",   color: "text-purple-600", bg: "bg-purple-100" },
  { min: 41, label: "World Citizen",  color: "text-rose-600",   bg: "bg-rose-100" },
];

export function getTravelerBadge(visitedCountryCount: number): TravelerBadge {
  const badge = [...BADGES].reverse().find((b) => visitedCountryCount >= b.min)!;
  return { label: badge.label, color: badge.color, bg: badge.bg };
}

const REGION_TO_CONTINENT: Record<string, string> = {
  "Southeast Asia": "Asia",
  "East Asia": "Asia",
  "South Asia": "Asia",
  "Middle East": "Asia",
  "Europe": "Europe",
  "Africa": "Africa",
  "North America": "North America",
  "South America": "South America",
  "Oceania": "Oceania",
};

export function getContinentsVisited(visitedCities: City[]): string[] {
  const continents = new Set(visitedCities.map((c) => REGION_TO_CONTINENT[c.region]).filter(Boolean));
  return [...continents];
}
