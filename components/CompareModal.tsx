"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Star, Lock } from "lucide-react";
import { City } from "@/lib/types";
import { scoreColor, scoreBgColor, cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { createClient } from "@/utils/supabase/client";
import AuthModal from "./AuthModal";
import ReviewCard from "./ReviewCard";

type Tab = "scores" | "budget" | "todo" | "highlights" | "reviews";

const TABS: { id: Tab; label: string }[] = [
  { id: "scores",     label: "Scores" },
  { id: "budget",     label: "Budget" },
  { id: "todo",       label: "Things To Do" },
  { id: "highlights", label: "Highlights" },
  { id: "reviews",    label: "Reviews" },
];

const SCORE_LABELS: { key: keyof City["scores"]; label: string }[] = [
  { key: "overall",      label: "Overall" },
  { key: "costValue",    label: "Cost / Value" },
  { key: "safety",       label: "Safety" },
  { key: "food",         label: "Food" },
  { key: "culture",      label: "Culture" },
  { key: "nature",       label: "Nature" },
  { key: "nightlife",    label: "Nightlife" },
  { key: "easeOfTravel", label: "Ease of Travel" },
];

type Props = {
  cities: City[];
  isLoggedIn: boolean;
  onClose: () => void;
};

export default function CompareModal({ cities, isLoggedIn, onClose }: Props) {
  const { format } = useCurrency();
  const [activeTab, setActiveTab] = useState<Tab>("scores");
  const [reviewsMap, setReviewsMap] = useState<Record<string, Record<string, unknown>[]>>({});
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || cities.length === 0) return;
    const supabase = createClient();
    const slugs = cities.map((c) => c.slug);
    supabase.from("reviews").select("*").in("city_slug", slugs).then(({ data }) => {
      const map: Record<string, Record<string, unknown>[]> = {};
      for (const slug of slugs) map[slug] = (data ?? []).filter((r) => r.city_slug === slug);
      setReviewsMap(map);
    });
  }, [isLoggedIn, cities.map((c) => c.slug).join(",")]);

  const cols = cities.length;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-2 sm:inset-6 z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-gray-900">Compare cities</h2>
            <span className="text-xs text-gray-400">{cols} cities selected</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* City headers */}
          <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
            <div className="grid px-4 py-3" style={{ gridTemplateColumns: `160px repeat(${cols}, 1fr)` }}>
              <div />
              {cities.map((city) => (
                <Link key={city.id} href={`/cities/${city.slug}`} onClick={onClose}
                  className="flex flex-col items-center gap-1.5 group px-2">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                    <Image src={city.imageUrl} alt={city.name} fill className="object-cover" sizes="48px" />
                  </div>
                  <p className="font-bold text-gray-900 text-sm text-center group-hover:text-rose-500 transition-colors leading-tight">{city.name}</p>
                  <p className="text-xs text-gray-400">{city.country}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className={`text-xs font-bold ${scoreColor(city.scores.overall)}`}>{city.scores.overall.toFixed(1)}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-0 overflow-x-auto border-t border-gray-50 px-4">
              {TABS.map(({ id, label }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                    id === "reviews" && !isLoggedIn && "opacity-60",
                    activeTab === id ? "border-rose-500 text-rose-600" : "border-transparent text-gray-500 hover:text-gray-700"
                  )}>
                  {label}
                  {id === "reviews" && !isLoggedIn && <Lock className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-4">
            {/* SCORES */}
            {activeTab === "scores" && (
              <table className="w-full">
                <tbody>
                  {SCORE_LABELS.map(({ key, label }, i) => (
                    <tr key={key} className={i % 2 === 0 ? "bg-gray-50/60 rounded-xl" : ""}>
                      <td className="py-3 px-4 text-sm text-gray-500 font-medium w-36">{label}</td>
                      {cities.map((city) => {
                        const score = city.scores[key];
                        return (
                          <td key={city.id} className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div className={`h-2 rounded-full ${scoreBgColor(score)}`} style={{ width: `${score * 10}%` }} />
                              </div>
                              <span className={`text-sm font-bold w-8 text-right ${scoreColor(score)}`}>{score.toFixed(1)}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* BUDGET */}
            {activeTab === "budget" && (
              <table className="w-full">
                <tbody>
                  {(["budget", "midRange", "luxury"] as const).map((tier, i) => {
                    const label = tier === "budget" ? "Budget" : tier === "midRange" ? "Mid-range" : "Luxury";
                    return (
                      <tr key={tier} className={i % 2 === 0 ? "bg-rose-50/40" : ""}>
                        <td className="py-3 px-4 text-sm text-gray-500 font-medium w-36">{label}/day</td>
                        {cities.map((city) => (
                          <td key={city.id} className="py-3 px-4 text-center font-bold text-rose-600">{format(city.dailyBudget[tier])}</td>
                        ))}
                      </tr>
                    );
                  })}
                  <tr><td colSpan={cols + 1} className="py-2 px-4 text-xs font-semibold text-gray-400 uppercase bg-gray-50 border-y border-gray-100">Breakdown (budget tier)</td></tr>
                  {(["accommodation", "food", "transport", "activities", "extras"] as const).map((bk, i) => (
                    <tr key={bk} className={i % 2 === 0 ? "bg-gray-50/50" : ""}>
                      <td className="py-3 px-4 text-sm text-gray-500 font-medium capitalize w-36">{bk}</td>
                      {cities.map((city) => (
                        <td key={city.id} className="py-3 px-4 text-center text-sm text-gray-700">{format(city.budgetBreakdown[bk])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* THINGS TO DO */}
            {activeTab === "todo" && (
              <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {cities.map((city) => (
                  <div key={city.id}>
                    <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">{city.name}</h3>
                    <ul className="space-y-2">
                      {city.bestThingsToDo.map((t, i) => (
                        <li key={t} className="flex gap-2 text-sm text-gray-600">
                          <span className="text-rose-400 font-bold shrink-0 w-4">{i + 1}.</span> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* HIGHLIGHTS */}
            {activeTab === "highlights" && (
              <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {cities.map((city) => (
                  <div key={city.id} className="space-y-4">
                    <h3 className="font-bold text-gray-800 pb-2 border-b border-gray-100">{city.name}</h3>
                    <div>
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Best for</p>
                      <div className="flex flex-wrap gap-1.5">
                        {city.bestFor.map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-2">Best areas</p>
                      <ul className="space-y-1">
                        {city.bestAreas.map((a) => (
                          <li key={a} className="text-sm text-gray-600 flex gap-1.5"><span className="text-orange-400">•</span>{a}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Common complaints</p>
                      <ul className="space-y-1">
                        {city.commonComplaints.map((c) => (
                          <li key={c} className="text-sm text-gray-600 flex gap-1.5"><span className="text-red-400">!</span>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* REVIEWS */}
            {activeTab === "reviews" && (
              !isLoggedIn ? (
                <div className="text-center py-16">
                  <Lock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="font-semibold text-gray-700 mb-1">Sign in to read member reviews</p>
                  <p className="text-sm text-gray-400 mb-4">Reviews are only visible to registered members.</p>
                  <button onClick={() => setShowAuth(true)} className="px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors">Sign in</button>
                </div>
              ) : (
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                  {cities.map((city) => {
                    const reviews = reviewsMap[city.slug] ?? [];
                    return (
                      <div key={city.id}>
                        <h3 className="font-bold text-gray-800 pb-2 border-b border-gray-100 mb-3">
                          {city.name} <span className="text-sm text-gray-400 font-normal">({reviews.length})</span>
                        </h3>
                        {reviews.length === 0 ? (
                          <p className="text-sm text-gray-400">No reviews yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {reviews.slice(0, 2).map((r) => (
                              <ReviewCard key={r.id as string} review={{
                                id: r.id as string, cityId: city.id,
                                authorName: (r.user_email as string)?.split("@")[0] ?? "Traveler",
                                travelStyle: r.travel_style as never,
                                budgetCategory: r.budget_category as never,
                                monthVisited: (r.month_visited as string) ?? "",
                                overallRating: r.overall_rating as number,
                                writtenReview: (r.written_review as string) ?? "",
                                pros: (r.pros as string[]) ?? [],
                                cons: (r.cons as string[]) ?? [],
                                createdAt: (r.created_at as string)?.slice(0, 10) ?? "",
                              }} />
                            ))}
                            {reviews.length > 2 && (
                              <Link href={`/cities/${city.slug}`} onClick={onClose} className="text-sm text-rose-500 hover:underline">
                                View all {reviews.length} reviews →
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultMode="signin" />}
    </>
  );
}
