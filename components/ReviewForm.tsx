"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { TravelStyle } from "@/lib/types";
import { cn } from "@/lib/utils";

const TRAVEL_STYLES: TravelStyle[] = [
  "Solo", "Couple", "Honeymoon", "Friends", "Family",
  "Backpacking", "Adventure", "Culture", "Food", "Nightlife", "Beach",
];

const BUDGET_OPTIONS = [
  { value: "budget", label: "Budget" },
  { value: "midRange", label: "Mid-range" },
  { value: "luxury", label: "Luxury" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CATEGORY_SCORES = [
  { key: "score_cost_value", label: "Cost / Value" },
  { key: "score_safety", label: "Safety" },
  { key: "score_food", label: "Food" },
  { key: "score_culture", label: "Culture" },
  { key: "score_nature", label: "Nature" },
  { key: "score_nightlife", label: "Nightlife" },
  { key: "score_ease_of_travel", label: "Ease of Travel" },
] as const;

type Props = {
  citySlug: string;
  userEmail: string;
  userId: string;
};

type ScoreKey = typeof CATEGORY_SCORES[number]["key"];

export default function ReviewForm({ citySlug, userEmail, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const [travelStyle, setTravelStyle] = useState<TravelStyle | null>(null);
  const [budgetCategory, setBudgetCategory] = useState<string | null>(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(String(currentYear));
  const [overallRating, setOverallRating] = useState<number | null>(null);
  const [categoryScores, setCategoryScores] = useState<Partial<Record<ScoreKey, number>>>({});
  const [writtenReview, setWrittenReview] = useState("");
  const [pros, setPros] = useState<string[]>([""]);
  const [cons, setCons] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updatePro(i: number, val: string) { setPros((p) => p.map((x, j) => j === i ? val : x)); }
  function updateCon(i: number, val: string) { setCons((c) => c.map((x, j) => j === i ? val : x)); }
  function removePro(i: number) { setPros((p) => p.filter((_, j) => j !== i)); }
  function removeCon(i: number) { setCons((c) => c.filter((_, j) => j !== i)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!overallRating || !travelStyle) return;
    setLoading(true);
    setError(null);

    const cleanPros = pros.filter((p) => p.trim());
    const cleanCons = cons.filter((c) => c.trim());
    const monthVisited = month && year ? `${month} ${year}` : null;

    const { error: err } = await supabase.from("reviews").upsert({
      city_slug: citySlug,
      user_id: userId,
      user_email: userEmail,
      travel_style: travelStyle,
      budget_category: budgetCategory,
      month_visited: monthVisited,
      overall_rating: overallRating,
      ...categoryScores,
      written_review: writtenReview || null,
      pros: cleanPros.length ? cleanPros : null,
      cons: cleanCons.length ? cleanCons : null,
    }, { onConflict: "user_id,city_slug" });

    setLoading(false);
    if (err) { setError(err.message); return; }
    setSubmitted(true);
    router.refresh();
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="font-semibold text-green-700">Review submitted!</p>
        <p className="text-sm text-green-600 mt-1">Thanks — your ratings will now influence this city's scores.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border border-gray-100 rounded-2xl p-5">
      <h3 className="font-bold text-gray-800 text-lg">Write a review</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      {/* Travel style */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">Travel style *</label>
        <div className="flex flex-wrap gap-2">
          {TRAVEL_STYLES.map((s) => (
            <button key={s} type="button" onClick={() => setTravelStyle(s)}
              className={cn("px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                travelStyle === s ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
              )}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Budget + month */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Budget category</label>
          <div className="flex flex-col gap-1.5">
            {BUDGET_OPTIONS.map((b) => (
              <button key={b.value} type="button" onClick={() => setBudgetCategory(b.value)}
                className={cn("px-3 py-1.5 rounded-xl text-sm font-medium border transition-all text-left",
                  budgetCategory === b.value ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
                )}>
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-gray-700 block mb-2">When did you visit?</label>
          <div className="flex gap-2">
            <select value={month} onChange={(e) => setMonth(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white">
              <option value="">Month</option>
              {MONTHS.map((m) => <option key={m}>{m}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)}
              className="w-24 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white">
              {years.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Overall rating */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">Overall rating *</label>
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button" onClick={() => setOverallRating(n)}
              className={cn("w-10 h-10 rounded-xl text-sm font-semibold border transition-all",
                overallRating === n ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
              )}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Category scores */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-3">Category scores <span className="text-gray-400 font-normal">(optional but helpful)</span></label>
        <div className="space-y-3">
          {CATEGORY_SCORES.map(({ key, label }) => {
            const val = categoryScores[key] ?? null;
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32 shrink-0">{label}</span>
                <div className="flex gap-1 flex-wrap">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button key={n} type="button"
                      onClick={() => setCategoryScores((prev) => ({ ...prev, [key]: val === n ? undefined : n }))}
                      className={cn("w-7 h-7 rounded-lg text-xs font-semibold border transition-all",
                        val === n ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-500 border-gray-200 hover:border-rose-300"
                      )}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Written review */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">Your review <span className="text-gray-400 font-normal">(optional)</span></label>
        <textarea value={writtenReview} onChange={(e) => setWrittenReview(e.target.value)} rows={4}
          placeholder="Share your experience…"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
      </div>

      {/* Pros */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-green-600 block mb-2">Pros</label>
          <div className="space-y-2">
            {pros.map((pro, i) => (
              <div key={i} className="flex gap-2">
                <input value={pro} onChange={(e) => updatePro(i, e.target.value)} placeholder={`Pro ${i + 1}`}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                {pros.length > 1 && (
                  <button type="button" onClick={() => removePro(i)} className="p-2 rounded-xl hover:bg-red-50">
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </button>
                )}
              </div>
            ))}
            {pros.length < 4 && (
              <button type="button" onClick={() => setPros((p) => [...p, ""])}
                className="flex items-center gap-1 text-xs text-green-600 hover:underline">
                <Plus className="w-3 h-3" /> Add pro
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-red-500 block mb-2">Cons</label>
          <div className="space-y-2">
            {cons.map((con, i) => (
              <div key={i} className="flex gap-2">
                <input value={con} onChange={(e) => updateCon(i, e.target.value)} placeholder={`Con ${i + 1}`}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                {cons.length > 1 && (
                  <button type="button" onClick={() => removeCon(i)} className="p-2 rounded-xl hover:bg-red-50">
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </button>
                )}
              </div>
            ))}
            {cons.length < 4 && (
              <button type="button" onClick={() => setCons((c) => [...c, ""])}
                className="flex items-center gap-1 text-xs text-red-500 hover:underline">
                <Plus className="w-3 h-3" /> Add con
              </button>
            )}
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading || !overallRating || !travelStyle}
        className="w-full py-3 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Submit review
      </button>
    </form>
  );
}
