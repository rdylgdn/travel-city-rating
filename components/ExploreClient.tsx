"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { City, BudgetMode } from "@/lib/types";
import CityCard from "./CityCard";
import BudgetModeSelector from "./BudgetModeSelector";
import FilterPanel, { Filters } from "./FilterPanel";

type SortOption = "score" | "budget_asc" | "budget_desc" | "reviews";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "score", label: "Top rated" },
  { value: "budget_asc", label: "Budget: low to high" },
  { value: "budget_desc", label: "Budget: high to low" },
  { value: "reviews", label: "Most reviewed" },
];

export default function ExploreClient({ cities }: { cities: City[] }) {
  const [query, setQuery] = useState("");
  const [budgetMode, setBudgetMode] = useState<BudgetMode>("budget");
  const [sortBy, setSortBy] = useState<SortOption>("score");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({ travelStyles: [], regions: [] });

  const filtered = useMemo(() => {
    let result = [...cities];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
      );
    }

    if (filters.travelStyles.length > 0) {
      result = result.filter((c) =>
        filters.travelStyles.some((s) => c.bestFor.includes(s))
      );
    }

    if (filters.regions.length > 0) {
      result = result.filter((c) => filters.regions.includes(c.region));
    }

    result.sort((a, b) => {
      if (sortBy === "score") return b.scores.overall - a.scores.overall;
      if (sortBy === "budget_asc") return a.dailyBudget[budgetMode] - b.dailyBudget[budgetMode];
      if (sortBy === "budget_desc") return b.dailyBudget[budgetMode] - a.dailyBudget[budgetMode];
      if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
      return 0;
    });

    return result;
  }, [cities, query, filters, sortBy, budgetMode]);

  const activeFilterCount = filters.travelStyles.length + filters.regions.length;

  return (
    <div>
      {/* Search + controls bar */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cities or countries…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                activeFilterCount > 0 || showFilters
                  ? "bg-rose-500 text-white border-rose-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-white text-rose-500 rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Budget mode selector */}
        <div className="max-w-6xl mx-auto mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Showing prices for:</span>
          <BudgetModeSelector value={budgetMode} onChange={setBudgetMode} />
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-gray-50 border-b border-gray-100 px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No cities match your search.</p>
            <button
              onClick={() => { setQuery(""); setFilters({ travelStyles: [], regions: [] }); }}
              className="mt-3 text-rose-500 text-sm font-medium hover:underline"
            >
              Clear search and filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">{filtered.length} cities</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((city) => (
                <CityCard key={city.id} city={city} budgetMode={budgetMode} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
