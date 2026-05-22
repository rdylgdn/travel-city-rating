"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, Bookmark, CheckCircle2, BarChart2 } from "lucide-react";
import { City, BudgetMode } from "@/lib/types";
import CityCard from "./CityCard";
import BudgetModeSelector from "./BudgetModeSelector";
import FilterPanel, { Filters } from "./FilterPanel";
import { useSavedCities } from "@/contexts/SavedCitiesContext";
import { cn } from "@/lib/utils";
import CompareModal from "./CompareModal";

type SortOption = "score" | "budget_asc" | "budget_desc" | "reviews" | "saved" | "visited" | "top_saved" | "top_visited";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "score",        label: "Top rated" },
  { value: "top_saved",    label: "Most saved" },
  { value: "top_visited",  label: "Most visited" },
  { value: "budget_asc",   label: "Budget: low to high" },
  { value: "budget_desc",  label: "Budget: high to low" },
  { value: "reviews",      label: "Most reviewed" },
];

type ExploreProps = {
  cities: City[];
  reviewCounts?: Record<string, number>;
  anonCounts?: Record<string, number>;
  savedCounts?: Record<string, number>;
  visitedCounts?: Record<string, number>;
  networkVisitedCounts?: Record<string, number>;
  compareEnabled?: boolean;
  budgetModeEnabled?: boolean;
};

export default function ExploreClient({ cities, reviewCounts = {}, anonCounts = {}, savedCounts = {}, visitedCounts = {}, networkVisitedCounts = {}, compareEnabled = true, budgetModeEnabled = true }: ExploreProps) {
  const [query, setQuery] = useState("");
  const [budgetMode, setBudgetMode] = useState<BudgetMode>("budget");
  const [sortBy, setSortBy] = useState<SortOption>("score");
  const [showFilters, setShowFilters] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({ travelStyles: [], regions: [] });
  const { saved, visited, isLoggedIn } = useSavedCities();
  const showingSaved = sortBy === "saved";
  const showingVisited = sortBy === "visited";
  const MAX_COMPARE = isLoggedIn ? 4 : 2;

  function toggleCompareCity(slug: string) {
    setCompareSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, slug];
    });
  }

  function openCompare() {
    if (compareSlugs.length >= 2) setShowCompareModal(true);
  }

  function exitCompareMode() {
    setCompareMode(false);
    setCompareSlugs([]);
    setShowCompareModal(false);
  }

  const compareCities = compareSlugs
    .map((slug) => cities.find((c) => c.slug === slug))
    .filter(Boolean) as City[];

  const filtered = useMemo(() => {
    let result = [...cities];

    if (showingSaved) result = result.filter((c) => saved.has(c.slug));
    if (showingVisited) result = result.filter((c) => visited.has(c.slug));

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

    if (!showingSaved && !showingVisited) {
      result.sort((a, b) => {
        if (sortBy === "score")        return b.scores.overall - a.scores.overall;
        if (sortBy === "budget_asc")   return a.dailyBudget[budgetMode] - b.dailyBudget[budgetMode];
        if (sortBy === "budget_desc")  return b.dailyBudget[budgetMode] - a.dailyBudget[budgetMode];
        if (sortBy === "reviews")      return b.reviewCount - a.reviewCount;
        if (sortBy === "top_saved")    return (savedCounts[b.slug] ?? 0) - (savedCounts[a.slug] ?? 0);
        if (sortBy === "top_visited")  return (visitedCounts[b.slug] ?? 0) - (visitedCounts[a.slug] ?? 0);
        return 0;
      });
    }

    return result;
  }, [cities, query, filters, sortBy, budgetMode, saved, visited, showingSaved, showingVisited]);

  const activeFilterCount = filters.travelStyles.length + filters.regions.length;

  return (
    <div>
      {/* Search + controls bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
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
            {/* Saved / Visited quick filters */}
            {isLoggedIn && (
              <>
                <button
                  onClick={() => setSortBy(showingSaved ? "score" : "saved")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                    showingSaved
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
                  )}
                >
                  <Bookmark className={cn("w-4 h-4", showingSaved && "fill-white")} />
                  Saved
                  {saved.size > 0 && (
                    <span className={cn(
                      "rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center",
                      showingSaved ? "bg-white text-rose-500" : "bg-rose-100 text-rose-500"
                    )}>
                      {saved.size}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setSortBy(showingVisited ? "score" : "visited")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                    showingVisited
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Visited
                  {visited.size > 0 && (
                    <span className={cn(
                      "rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center",
                      showingVisited ? "bg-white text-green-500" : "bg-green-100 text-green-600"
                    )}>
                      {visited.size}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* Compare button */}
            {compareEnabled && (compareMode ? (
              <>
                <button
                  onClick={compareSlugs.length >= 2 ? openCompare : undefined}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                    compareSlugs.length >= 2
                      ? "bg-rose-500 text-white border-rose-500 hover:bg-rose-600"
                      : "bg-rose-50 text-rose-400 border-rose-200 cursor-default"
                  )}
                >
                  <BarChart2 className="w-4 h-4" />
                  Compare
                  {compareSlugs.length > 0 && (
                    <span className={cn("rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center",
                      compareSlugs.length >= 2 ? "bg-white text-rose-500" : "bg-rose-200 text-rose-500"
                    )}>
                      {compareSlugs.length}
                    </span>
                  )}
                </button>
                <button onClick={exitCompareMode} className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:border-gray-300 transition-all">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setCompareMode(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-rose-300 hover:text-rose-500 transition-all bg-white"
              >
                <BarChart2 className="w-4 h-4" />
                Compare
              </button>
            ))}


            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                activeFilterCount > 0 || showFilters
                  ? "bg-rose-500 text-white border-rose-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-white text-rose-500 rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {!showingSaved && !showingVisited && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Budget mode selector */}
        {budgetModeEnabled && (
          <div className="max-w-6xl mx-auto mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Showing prices for:</span>
            <BudgetModeSelector value={budgetMode} onChange={setBudgetMode} />
          </div>
        )}
      </div>

      {/* Compare mode banner */}
      {compareMode && (
        <div className="bg-rose-50 border-b border-rose-100 px-4 py-2.5 sticky top-[var(--header-h,112px)] z-20">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <p className="text-sm text-rose-600 font-medium">
              <BarChart2 className="w-4 h-4 inline mr-1.5" />
              Compare mode — click any city card to add it.
              {!isLoggedIn && " (2 cities max — sign in for more)"}
            </p>
            <span className="text-xs text-rose-400">{compareSlugs.length}/{MAX_COMPARE} selected</span>
          </div>
        </div>
      )}

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
            {showingSaved ? (
              <>
                <p className="text-gray-400 text-lg">No saved cities yet.</p>
                <button onClick={() => setSortBy("score")} className="mt-3 text-rose-500 text-sm font-medium hover:underline">
                  Browse all cities
                </button>
              </>
            ) : showingVisited ? (
              <>
                <p className="text-gray-400 text-lg">No visited cities yet.</p>
                <button onClick={() => setSortBy("score")} className="mt-3 text-green-500 text-sm font-medium hover:underline">
                  Browse all cities
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-400 text-lg">No cities match your search.</p>
                <button
                  onClick={() => { setQuery(""); setFilters({ travelStyles: [], regions: [] }); }}
                  className="mt-3 text-rose-500 text-sm font-medium hover:underline"
                >
                  Clear search and filters
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">
              {showingSaved ? `${filtered.length} saved` : showingVisited ? `${filtered.length} visited` : `${filtered.length} cities`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((city) => (
                <CityCard
                  key={city.id}
                  city={city}
                  budgetMode={budgetMode}
                  liveReviewCount={reviewCounts[city.slug]}
                  liveAnonCount={anonCounts[city.slug]}
                  savedCount={savedCounts[city.slug] ?? 0}
                  visitedCount={visitedCounts[city.slug] ?? 0}
                  compareMode={compareMode}
                  isCompared={compareSlugs.includes(city.slug)}
                  onCompareToggle={() => toggleCompareCity(city.slug)}
                  networkVisitedCount={networkVisitedCounts[city.slug] ?? 0}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {showCompareModal && compareCities.length >= 2 && (
        <CompareModal
          cities={compareCities}
          isLoggedIn={isLoggedIn}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </div>
  );
}
