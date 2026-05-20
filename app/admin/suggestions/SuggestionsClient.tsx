"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { CitySuggestion, SuggestionStatus } from "@/lib/mock-admin";
import { cn } from "@/lib/utils";

const statusFilters: { value: SuggestionStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const statusStyles: Record<SuggestionStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-500",
};

export default function SuggestionsClient({ suggestions: initial }: { suggestions: CitySuggestion[] }) {
  const [suggestions, setSuggestions] = useState(initial);
  const [filter, setFilter] = useState<SuggestionStatus | "all">("pending");

  function updateStatus(id: string, status: SuggestionStatus) {
    setSuggestions((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
  }

  const filtered = filter === "all" ? suggestions : suggestions.filter((s) => s.status === filter);
  const pendingCount = suggestions.filter((s) => s.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Suggestions</h1>
        <p className="text-sm text-gray-400 mt-1">
          {pendingCount} pending review
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-full p-1 w-fit">
        {statusFilters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              filter === value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {label}
            {value === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 bg-rose-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-400 text-sm py-8 text-center">No suggestions in this category.</p>
      )}

      <div className="space-y-3">
        {filtered.map((s) => (
          <div key={s.id} className="border border-gray-100 rounded-xl p-4 bg-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-800">{s.cityName}, {s.country}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[s.status]}`}>
                    {s.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  by {s.submittedBy} · {s.submittedAt}
                </p>
                <p className="text-sm text-gray-600 mt-2">{s.why}</p>
                {s.travelStyles.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {s.travelStyles.map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {s.status === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => updateStatus(s.id, "approved")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-sm font-medium hover:bg-green-100 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(s.id, "rejected")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
