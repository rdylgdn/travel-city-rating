"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { TravelStyle, BudgetMode } from "@/lib/types";
import { cn } from "@/lib/utils";

const allStyles: TravelStyle[] = [
  "Solo", "Couple", "Honeymoon", "Friends", "Family",
  "Backpacking", "Adventure", "Culture", "Nature", "Food",
  "Nightlife", "Beach", "Digital Nomad", "Luxury",
];

const budgetModes: { value: BudgetMode; label: string; description: string }[] = [
  { value: "budget", label: "Budget", description: "Hostels, street food, public transport" },
  { value: "midRange", label: "Mid-range", description: "3-star hotels, local restaurants" },
  { value: "luxury", label: "Luxury", description: "5-star hotels, fine dining, private transfers" },
];

export default function TravelPreferences({ displayName, displayEmail }: { displayName: string; displayEmail: string }) {
  const [styles, setStyles] = useState<TravelStyle[]>([]);
  const [budgetMode, setBudgetMode] = useState<BudgetMode>("budget");
  const [saved, setSaved] = useState(false);

  function toggleStyle(s: TravelStyle) {
    setStyles((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
    setSaved(false);
  }

  function handleSave() {
    // Wire to Supabase in production
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Default travel style</h3>
        <p className="text-xs text-gray-400 mb-3">Used to personalize your explore feed when signed in.</p>
        <div className="flex flex-wrap gap-2">
          {allStyles.map((s) => (
            <button
              key={s}
              onClick={() => toggleStyle(s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                styles.includes(s)
                  ? "bg-rose-500 text-white border-rose-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Default budget mode</h3>
        <p className="text-xs text-gray-400 mb-3">Sets the default price display on city cards.</p>
        <div className="space-y-2">
          {budgetModes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => { setBudgetMode(mode.value); setSaved(false); }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all",
                budgetMode === mode.value
                  ? "border-rose-400 bg-rose-50"
                  : "border-gray-200 bg-white hover:border-rose-300"
              )}
            >
              <div>
                <p className={cn("text-sm font-semibold", budgetMode === mode.value ? "text-rose-600" : "text-gray-800")}>
                  {mode.label}
                </p>
                <p className="text-xs text-gray-400">{mode.description}</p>
              </div>
              {budgetMode === mode.value && <Check className="w-4 h-4 text-rose-500" />}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className={cn(
          "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
          saved
            ? "bg-green-500 text-white"
            : "bg-rose-500 text-white hover:bg-rose-600"
        )}
      >
        {saved ? "Saved!" : "Save preferences"}
      </button>
    </div>
  );
}
