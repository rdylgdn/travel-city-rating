"use client";

import { useState } from "react";
import { TravelStyle } from "@/lib/types";

const styles: TravelStyle[] = [
  "Solo", "Couple", "Friends", "Family", "Honeymoon",
  "Backpacking", "Adventure", "Food", "Nightlife", "Beach", "Culture", "Nature",
];

export default function SuggestCityForm() {
  const [form, setForm] = useState({ cityName: "", country: "", why: "", comment: "" });
  const [selectedStyles, setSelectedStyles] = useState<TravelStyle[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function toggleStyle(s: TravelStyle) {
    setSelectedStyles((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.cityName || !form.country) return;
    console.log("Suggestion:", { ...form, travelStyles: selectedStyles });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center max-w-md mx-auto">
        <p className="text-2xl mb-2">Thanks!</p>
        <p className="text-green-700 font-medium">We&apos;ll review this city before publishing.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">City name *</label>
          <input
            value={form.cityName}
            onChange={(e) => setForm({ ...form, cityName: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            placeholder="e.g. Medellín"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Country *</label>
          <input
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            placeholder="e.g. Colombia"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Why should it be added?</label>
        <textarea
          value={form.why}
          onChange={(e) => setForm({ ...form, why: e.target.value })}
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
          placeholder="What makes this city worth listing?"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Best for (optional)</label>
        <div className="flex flex-wrap gap-1.5">
          {styles.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => toggleStyle(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                selectedStyles.includes(s)
                  ? "bg-rose-500 text-white border-rose-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Your comment (optional)</label>
        <textarea
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
          placeholder="Anything else you'd like to share"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-colors"
      >
        Submit suggestion
      </button>
    </form>
  );
}
