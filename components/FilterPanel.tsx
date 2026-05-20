"use client";

import { TravelStyle, Region } from "@/lib/types";
import { cn } from "@/lib/utils";

const travelStyles: TravelStyle[] = [
  "Honeymoon", "Solo", "Couple", "Friends", "Family",
  "Backpacking", "Adventure", "Culture", "Nature", "Food",
  "Nightlife", "Beach", "Digital Nomad",
];

const regions: Region[] = [
  "Southeast Asia", "East Asia", "South Asia", "Europe",
  "Middle East", "Africa", "North America", "South America", "Oceania",
];

export type Filters = {
  travelStyles: TravelStyle[];
  regions: Region[];
};

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

export default function FilterPanel({ filters, onChange }: Props) {
  function toggleStyle(style: TravelStyle) {
    const next = filters.travelStyles.includes(style)
      ? filters.travelStyles.filter((s) => s !== style)
      : [...filters.travelStyles, style];
    onChange({ ...filters, travelStyles: next });
  }

  function toggleRegion(region: Region) {
    const next = filters.regions.includes(region)
      ? filters.regions.filter((r) => r !== region)
      : [...filters.regions, region];
    onChange({ ...filters, regions: next });
  }

  const hasFilters = filters.travelStyles.length > 0 || filters.regions.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Travel Style</p>
        <div className="flex flex-wrap gap-2">
          {travelStyles.map((style) => (
            <button
              key={style}
              onClick={() => toggleStyle(style)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                filters.travelStyles.includes(style)
                  ? "bg-rose-500 text-white border-rose-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
              )}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Region</p>
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => toggleRegion(region)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                filters.regions.includes(region)
                  ? "bg-rose-500 text-white border-rose-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
              )}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={() => onChange({ travelStyles: [], regions: [] })}
          className="text-sm text-rose-500 hover:text-rose-600 font-medium"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
