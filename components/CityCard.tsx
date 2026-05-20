"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, DollarSign, Bookmark, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { City, BudgetMode } from "@/lib/types";
import { cn, scoreColor, budgetLabel } from "@/lib/utils";
import AuthModal from "./AuthModal";
import { useSavedCities } from "@/contexts/SavedCitiesContext";

type Props = {
  city: City;
  budgetMode: BudgetMode;
  liveReviewCount?: number;
  liveAnonCount?: number;
};

export default function CityCard({ city, budgetMode, liveReviewCount, liveAnonCount }: Props) {
  const dailyBudget = city.dailyBudget[budgetMode];
  const reviewCount = liveReviewCount ?? city.reviewCount;
  const totalCount = reviewCount + (liveAnonCount ?? 0);
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
      <div className="relative group">
        <Link href={`/cities/${city.slug}?budget=${budgetMode}`} className="block">
          <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="relative h-52 w-full overflow-hidden">
              <Image
                src={city.imageUrl}
                alt={city.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />

              {/* Score badge */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 z-10">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span className={cn("text-sm font-bold", scoreColor(city.scores.overall))}>
                  {city.scores.overall.toFixed(1)}
                </span>
              </div>

              {/* Action panel — always visible on mobile, slides in on desktop hover */}
              {!loading && (
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

            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-800">${dailyBudget}/day</span>
                </div>
                <span className="text-xs text-gray-400">{budgetLabel(budgetMode)}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {city.bestFor.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{city.bestSeason}</span>
                <span>{totalCount} {totalCount === 1 ? "review" : "reviews"}</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultMode="signin" />}
    </>
  );
}
