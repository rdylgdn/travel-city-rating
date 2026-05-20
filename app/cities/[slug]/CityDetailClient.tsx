"use client";

import { useState } from "react";
import { BudgetMode, City } from "@/lib/types";
import { budgetLabel } from "@/lib/utils";
import SaveButton from "@/components/SaveButton";
import AuthModal from "@/components/AuthModal";
import BudgetModeSelector from "@/components/BudgetModeSelector";
import { useSavedCities } from "@/contexts/SavedCitiesContext";

type Props = {
  citySlug: string;
  initialBudgetMode: BudgetMode;
  city?: City;
  heroOnly?: boolean;
};

export default function CityDetailClient({ citySlug, initialBudgetMode, city, heroOnly }: Props) {
  const [budgetMode, setBudgetMode] = useState<BudgetMode>(initialBudgetMode);
  const [showAuth, setShowAuth] = useState(false);
  const { saved, toggle, loading } = useSavedCities();
  const isSaved = saved.has(citySlug);

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggle(citySlug, budgetMode);
    if (result === "unauthenticated") setShowAuth(true);
  }

  if (heroOnly) {
    return (
      <>
        <SaveButton isSaved={isSaved} loading={loading} onToggle={handleSave} />
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Overall score</p>
            <p className="font-bold text-gray-800">{city.scores.overall.toFixed(1)}/10</p>
          </div>
          <div className="bg-rose-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">{budgetLabel(budgetMode)}</p>
            <p className="font-bold text-rose-600">${dailyBudget}/day</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Best season</p>
            <p className="font-bold text-gray-800">{city.bestSeason}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Reviews</p>
            <p className="font-bold text-gray-800">{city.reviewCount}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">Budget breakdown</h2>
        <p className="text-sm text-gray-400 mb-3">{budgetLabel(budgetMode)} · USD/day</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(city.budgetBreakdown).map(([key, val]) => {
            const ratio = dailyBudget / city.dailyBudget.budget;
            const scaled = Math.round(val * ratio);
            return (
              <div key={key} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 capitalize mb-1">{key}</p>
                <p className="font-semibold text-gray-800">${scaled}/day</p>
              </div>
            );
          })}
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
