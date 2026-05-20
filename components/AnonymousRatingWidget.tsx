"use client";

import { useState } from "react";
import { TravelStyle } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";

const styles: TravelStyle[] = [
  "Solo", "Couple", "Friends", "Family", "Backpacking",
  "Adventure", "Food", "Nightlife", "Beach", "Culture",
];

export default function AnonymousRatingWidget({ citySlug }: { citySlug: string }) {
  const [score, setScore] = useState<number | null>(null);
  const [style, setStyle] = useState<TravelStyle | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!score) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("anonymous_ratings").insert({
      city_slug: citySlug,
      overall_score: score,
      travel_style: style ?? null,
    });
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-green-700 font-medium">Thanks for your rating!</p>
        <p className="text-green-600 text-sm mt-1">Your score helps shape the overall rating for this city.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <h3 className="font-semibold text-gray-800 mb-1">Quick rate this city</h3>
      <p className="text-xs text-gray-500 mb-4">
        Your anonymous score contributes to the overall rating (at a lighter weight than member reviews).
      </p>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Overall score</p>
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button key={n} onClick={() => setScore(n)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold border transition-all ${
                score === n ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
              }`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Best for (optional)</p>
        <div className="flex flex-wrap gap-1.5">
          {styles.map((s) => (
            <button key={s} onClick={() => setStyle(style === s ? null : s)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                style === s ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleSubmit} disabled={!score || loading}
        className="w-full py-2 rounded-xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        {loading ? "Submitting…" : "Submit anonymously"}
      </button>
    </div>
  );
}
