"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, DollarSign, Bookmark, CheckCircle2, BarChart2, Users } from "lucide-react";
import { useState } from "react";
import { City, BudgetMode } from "@/lib/types";
import { cn, scoreColor, budgetLabel } from "@/lib/utils";
import AuthModal from "./AuthModal";
import { useSavedCities } from "@/contexts/SavedCitiesContext";
import { useCurrency } from "@/contexts/CurrencyContext";

type Props = {
  city: City;
  budgetMode: BudgetMode;
  liveReviewCount?: number;
  liveAnonCount?: number;
  savedCount?: number;
  visitedCount?: number;
  compareMode?: boolean;
  isCompared?: boolean;
  onCompareToggle?: () => void;
  networkVisitedCount?: number;
};

export default function CityCard({ city, budgetMode, liveReviewCount, liveAnonCount, savedCount = 0, visitedCount = 0, compareMode, isCompared, onCompareToggle, networkVisitedCount = 0 }: Props) {
  const dailyBudget = city.dailyBudget[budgetMode];
  const reviewCount = liveReviewCount ?? city.reviewCount;
  const totalCount = reviewCount + (liveAnonCount ?? 0);
  const { format } = useCurrency();
  const [showAuth, setShowAuth] = useState(false);
  const { saved, visited, toggleSaved, toggleVisited, loading } = useSavedCities();
  const isSaved = saved.has(city.slug);
  const isVisited = visited.has(city.slug);

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleSaved(city.slug, budgetMode);
    if (result === "unauthenticated") setShowAuth(true);
  }

  async function handleVisited(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleVisited(city.slug);
    if (result === "unauthenticated") setShowAuth(true);
  }

  return (
    <>
      <div className={cn("relative group", compareMode && "cursor-pointer")}
        onClick={compareMode ? onCompareToggle : undefined}>
        <Link
          href={compareMode ? "#" : `/cities/${city.slug}?budget=${budgetMode}`}
          className="block"
          onClick={compareMode ? (e) => e.preventDefault() : undefined}
        >
          <div className={cn(
            "rounded-2xl overflow-hidden bg-white shadow-sm border transition-all duration-200",
            compareMode
              ? isCompared
                ? "border-rose-500 shadow-md ring-2 ring-rose-400"
                : "border-gray-100 hover:border-rose-300 hover:shadow-md"
              : "border-gray-100 hover:shadow-md"
          )}>
            <div className="relative h-52 w-full overflow-hidden">
              <Image
                src={city.imageUrl}
                alt={city.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />

              {/* Compare mode overlay */}
              {compareMode && (
                <div className={cn(
                  "absolute inset-0 z-10 flex items-center justify-center transition-all",
                  isCompared ? "bg-rose-500/20" : "bg-transparent"
                )}>
                  {isCompared && (
                    <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-6 h-6 text-white fill-white stroke-rose-500" />
                    </div>
                  )}
                </div>
              )}

              {/* Score badge */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 z-10">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span className={cn("text-sm font-bold", scoreColor(city.scores.overall))}>
                  {city.scores.overall.toFixed(1)}
                </span>
              </div>

              {/* Action panel — hidden in compare mode */}
              {!loading && !compareMode && (
                <div className={cn(
                  "absolute top-0 right-0 h-full flex items-center z-10",
                  "translate-x-0 sm:translate-x-full sm:group-hover:translate-x-0",
                  "transition-transform duration-200 ease-out"
                )}>
                  <div className="bg-white/95 backdrop-blur-sm rounded-l-2xl shadow-lg p-2 flex flex-col gap-2">
                    {/* Save button */}
                    <button
                      onClick={handleSave}
                      title={isSaved ? "Remove from saved" : "Save"}
                      className={cn(
                        "flex flex-col items-center gap-1 w-11 h-11 rounded-xl justify-center transition-all",
                        isSaved
                          ? "bg-rose-500 text-white"
                          : "bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500"
                      )}
                    >
                      <Bookmark className={cn("w-4 h-4", isSaved && "fill-white")} />
                      <span className="text-[9px] font-semibold leading-none">
                        {isSaved ? "Saved" : "Save"}
                      </span>
                    </button>

                    {/* Visited button */}
                    <button
                      onClick={handleVisited}
                      title={isVisited ? "Remove from visited" : "Mark as visited"}
                      className={cn(
                        "flex flex-col items-center gap-1 w-11 h-11 rounded-xl justify-center transition-all",
                        isVisited
                          ? "bg-green-500 text-white"
                          : "bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-500"
                      )}
                    >
                      <CheckCircle2 className={cn("w-4 h-4", isVisited && "fill-white stroke-green-500")} />
                      <span className="text-[9px] font-semibold leading-none">
                        {isVisited ? "Visited" : "Visited"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-16 sm:right-3 group-hover:right-16 transition-all duration-200">
                <h3 className="text-white font-bold text-lg leading-tight">{city.name}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-white/80" />
                  <span className="text-white/80 text-xs">{city.country}</span>
                </div>
              </div>
            </div>

            {/* Fixed-height card body — all rows always occupy space */}
            <div className="p-3 h-[116px] flex flex-col justify-between overflow-hidden">
              {/* Budget */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-800">{format(dailyBudget)}/day</span>
                </div>
                <span className="text-xs text-gray-400">{budgetLabel(budgetMode)}</span>
              </div>

              {/* Tags — no wrap, overflow hidden */}
              <div className="flex gap-1 overflow-hidden">
                {city.bestFor.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium whitespace-nowrap shrink-0">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Season + reviews */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="truncate max-w-[80px]">{city.bestSeason}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/compare?cities=${city.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-gray-400 hover:text-rose-500 transition-colors"
                    title="Compare this city"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                  </Link>
                  <span>{totalCount} {totalCount === 1 ? "review" : "reviews"}</span>
                </div>
              </div>

              {/* Social proof — always rendered, invisible when empty */}
              <div className={cn(
                "flex items-center gap-3 pt-1.5 border-t border-gray-50",
                (networkVisitedCount > 0 || savedCount > 0 || visitedCount > 0) ? "visible" : "invisible"
              )}>
                {networkVisitedCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-rose-500 font-medium whitespace-nowrap">
                    <Users className="w-3 h-3 text-rose-400" />
                    {networkVisitedCount} {networkVisitedCount === 1 ? "friend" : "friends"} visited
                  </span>
                )}
                {savedCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-rose-400 whitespace-nowrap">
                    <Bookmark className="w-3 h-3 fill-rose-400" />
                    {savedCount} saved
                  </span>
                )}
                {visitedCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-green-500 whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3" />
                    {visitedCount} visited
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultMode="signin" />}
    </>
  );
}
