"use client";

import { useState } from "react";
import { Bookmark, CheckCircle2 } from "lucide-react";
import { BudgetMode, City } from "@/lib/types";
import { budgetLabel, cn } from "@/lib/utils";
import AuthModal from "@/components/AuthModal";
import BudgetModeSelector from "@/components/BudgetModeSelector";
import { useSavedCities } from "@/contexts/SavedCitiesContext";
import { useCurrency } from "@/contexts/CurrencyContext";

type Props = {
  citySlug: string;
  initialBudgetMode: BudgetMode;
  city?: City;
  heroOnly?: boolean;
  totalRatings?: number;  // member reviews + anonymous
  memberReviews?: number; // signed-in reviews only
};

export default function CityDetailClient({ citySlug, initialBudgetMode, city, heroOnly, totalRatings, memberReviews }: Props) {
  const [budgetMode, setBudgetMode] = useState<BudgetMode>(initialBudgetMode);
  const [showAuth, setShowAuth] = useState(false);
  const { saved, visited, toggleSaved, toggleVisited, loading } = useSavedCities();
  const { format } = useCurrency();
  const isSaved = saved.has(citySlug);
  const isVisited = visited.has(citySlug);

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleSaved(citySlug, budgetMode);
    if (result === "unauthenticated") setShowAuth(true);
  }

  async function handleVisited(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleVisited(citySlug);
    if (result === "unauthenticated") setShowAuth(true);
  }

  if (heroOnly) {
    return (
      <>
        {!loading && (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className={cn(
                "flex flex-col items-center gap-1 w-12 h-12 rounded-xl justify-center transition-all shadow-sm",
                isSaved ? "bg-rose-500 text-white" : "bg-white/90 text-gray-500 hover:bg-white hover:text-rose-500"
              )}
            >
              <Bookmark className={cn("w-4 h-4", isSaved && "fill-white")} />
              <span className="text-[9px] font-semibold">Save</span>
            </button>
            <button
              onClick={handleVisited}
              className={cn(
                "flex flex-col items-center gap-1 w-12 h-12 rounded-xl justify-center transition-all shadow-sm",
                isVisited ? "bg-green-500 text-white" : "bg-white/90 text-gray-500 hover:bg-white hover:text-green-500"
              )}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[9px] font-semibold">Visited</span>
            </button>
          </div>
        )}
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </>
    );
  }

  if (!city) return null;

  const dailyBudget = city.dailyBudget[budgetMode];

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Overview</h2>
          <BudgetModeSelector value={budgetMode} onChange={setBudgetMode} />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {[
            { label: "Score", value: `${city.scores.overall.toFixed(1)}/10`, highlight: false },
            { label: "Budget", value: `${format(dailyBudget)}/day`, highlight: true },
            { label: "Best season", value: city.bestSeason, highlight: false },
            { label: "Ratings", value: String(totalRatings ?? 0), highlight: false },
            { label: "Reviews", value: String(memberReviews ?? 0), highlight: false },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`rounded-xl p-2.5 text-center ${highlight ? "bg-rose-50" : "bg-gray-50"}`}>
              <p className="text-[10px] text-gray-400 mb-0.5 leading-none">{label}</p>
              <p className={`text-sm font-bold leading-tight truncate ${highlight ? "text-rose-600" : "text-gray-800"}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">Budget breakdown</h2>
        <p className="text-sm text-gray-400 mb-3">{budgetLabel(budgetMode)} · per day</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(city.budgetBreakdown).map(([key, val]) => {
            const ratio = dailyBudget / city.dailyBudget.budget;
            const scaled = val * ratio;
            return (
              <div key={key} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 capitalize mb-1">{key}</p>
                <p className="font-semibold text-gray-800">{format(scaled)}/day</p>
              </div>
            );
          })}
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
