import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function scoreColor(score: number): string {
  if (score >= 8.5) return "text-green-600";
  if (score >= 7.0) return "text-yellow-600";
  return "text-red-500";
}

export function scoreBgColor(score: number): string {
  if (score >= 8.5) return "bg-green-500";
  if (score >= 7.0) return "bg-yellow-400";
  return "bg-red-400";
}

export function budgetLabel(mode: string): string {
  if (mode === "budget") return "Budget traveler";
  if (mode === "midRange") return "Mid-range traveler";
  return "Luxury traveler";
}
