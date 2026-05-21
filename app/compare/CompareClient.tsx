"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Search, Star, BarChart2, Lock } from "lucide-react";
import { City } from "@/lib/types";
import { scoreColor, scoreBgColor, cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import AuthModal from "@/components/AuthModal";
import ReviewCard from "@/components/ReviewCard";

type Tab = "scores" | "budget" | "todo" | "proscons" | "reviews";

const TABS: { id: Tab; label: string }[] = [
  { id: "scores",   label: "Scores" },
  { id: "budget",   label: "Budget" },
  { id: "todo",     label: "Things To Do" },
  { id: "proscons", label: "Highlights" },
  { id: "reviews",  label: "Reviews" },
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
  allCities: City[];
  selectedCities: City[];
  isLoggedIn: boolean;
  reviewsMap: Record<string, unknown[]>;
  guestLimit: number;
};

export default function CompareClient({ allCities, selectedCities, isLoggedIn, reviewsMap, guestLimit }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { format } = useCurrency();
  const [activeTab, setActiveTab] = useState<Tab>("scores");
  const [search, setSearch] = useState("");
  const [showAuth, setShowAuth] = useState(false);

  const slugs = selectedCities.map((c) => c.slug);
  const MAX = isLoggedIn ? 4 : guestLimit;

  function updateUrl(newSlugs: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (newSlugs.length > 0) params.set("cities", newSlugs.join(","));
    else params.delete("cities");
    router.replace(`/compare?${params.toString()}`);
  }

  function addCity(slug: string) {
    if (slugs.includes(slug)) return;
    if (slugs.length >= MAX) { if (!isLoggedIn) setShowAuth(true); return; }
    updateUrl([...slugs, slug]);
    setSearch("");
  }

  function removeCity(slug: string) {
    updateUrl(slugs.filter((s) => s !== slug));
  }

  const filtered = search.trim()
    ? allCities.filter(
        (c) => !slugs.includes(c.slug) &&
          (c.name.toLowerCase().includes(search.toLowerCase()) ||
           c.country.toLowerCase().includes(search.toLowerCase()))
      ).slice(0, 6)
    : [];

  const canAddMore = slugs.length < MAX;

  // ── Scores tab ──
  function ScoresTab() {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-36">Attribute</th>
              {selectedCities.map((city) => (
                <th key={city.id} className="py-3 px-4 text-center text-sm font-bold text-gray-800 min-w-[160px]">
                  {city.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCORE_LABELS.map(({ key, label }, i) => (
              <tr key={key} className={i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}>
                <td className="py-3 px-4 text-sm text-gray-500 font-medium">{label}</td>
                {selectedCities.map((city) => {
                  const score = city.scores[key];
                  return (
                    <td key={city.id} className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${scoreBgColor(score)}`}
                            style={{ width: `${(score / 10) * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold w-8 text-right ${scoreColor(score)}`}>
                          {score.toFixed(1)}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ── Budget tab ──
  function BudgetTab() {
    const tiers: { key: "budget" | "midRange" | "luxury"; label: string }[] = [
      { key: "budget",   label: "Budget traveler" },
      { key: "midRange", label: "Mid-range" },
      { key: "luxury",   label: "Luxury" },
    ];
    const breakdownKeys = ["accommodation", "food", "transport", "activities", "extras"] as const;

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-36">Category</th>
              {selectedCities.map((city) => (
                <th key={city.id} className="py-3 px-4 text-center text-sm font-bold text-gray-800 min-w-[160px]">{city.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tiers.map(({ key, label }, i) => (
              <tr key={key} className={i % 2 === 0 ? "bg-rose-50/30" : "bg-white"}>
                <td className="py-3 px-4 text-sm text-gray-500 font-medium">{label}</td>
                {selectedCities.map((city) => (
                  <td key={city.id} className="py-3 px-4 text-center font-bold text-rose-600">
                    {format(city.dailyBudget[key])}/day
                  </td>
                ))}
              </tr>
            ))}
            <tr><td colSpan={selectedCities.length + 1} className="py-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-t border-b border-gray-100">Breakdown (budget tier)</td></tr>
            {breakdownKeys.map((bk, i) => (
              <tr key={bk} className={i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}>
                <td className="py-3 px-4 text-sm text-gray-500 font-medium capitalize">{bk}</td>
                {selectedCities.map((city) => (
                  <td key={city.id} className="py-3 px-4 text-center text-sm text-gray-700">
                    {format(city.budgetBreakdown[bk])}/day
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ── Things To Do tab ──
  function TodoTab() {
    const maxItems = Math.max(...selectedCities.map((c) => c.bestThingsToDo.length));
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase w-8">#</th>
              {selectedCities.map((city) => (
                <th key={city.id} className="py-3 px-4 text-left text-sm font-bold text-gray-800 min-w-[200px]">{city.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxItems }).map((_, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}>
                <td className="py-3 px-4 text-xs text-gray-300 font-bold">{i + 1}</td>
                {selectedCities.map((city) => (
                  <td key={city.id} className="py-3 px-4 text-sm text-gray-600">
                    {city.bestThingsToDo[i] ? (
                      <span className="flex items-start gap-2">
                        <span className="text-rose-400 mt-0.5 shrink-0">•</span>
                        {city.bestThingsToDo[i]}
                      </span>
                    ) : <span className="text-gray-200">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ── Pros & Cons tab ──
  function ProsConsTab() {
    return (
      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${selectedCities.length}, 1fr)` }}>
        {selectedCities.map((city) => (
          <div key={city.id} className="space-y-4">
            <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2">{city.name}</h3>
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
                {city.bestAreas.map((area) => (
                  <li key={area} className="text-sm text-gray-600 flex gap-1.5">
                    <span className="text-orange-400 mt-0.5">•</span> {area}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Common complaints</p>
              <ul className="space-y-1">
                {city.commonComplaints.map((c) => (
                  <li key={c} className="text-sm text-gray-600 flex gap-1.5">
                    <span className="text-red-400 mt-0.5">!</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Reviews tab ──
  function ReviewsTab() {
    if (!isLoggedIn) {
      return (
        <div className="text-center py-16">
          <Lock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-700">Sign in to read member reviews</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Reviews are only visible to registered members.</p>
          <button onClick={() => setShowAuth(true)} className="px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors">Sign in</button>
        </div>
      );
    }

    return (
      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${selectedCities.length}, 1fr)` }}>
        {selectedCities.map((city) => {
          const reviews = (reviewsMap[city.slug] ?? []) as Record<string, unknown>[];
          return (
            <div key={city.id}>
              <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3">
                {city.name}
                <span className="text-sm text-gray-400 font-normal ml-2">({reviews.length})</span>
              </h3>
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-400">No reviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {reviews.slice(0, 3).map((r) => (
                    <ReviewCard key={r.id as string} review={{
                      id: r.id as string,
                      cityId: city.id,
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
                  {reviews.length > 3 && (
                    <Link href={`/cities/${city.slug}`} className="text-sm text-rose-500 hover:underline">
                      View all {reviews.length} reviews →
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Compare cities</h1>
          <p className="text-sm text-gray-400 mt-1">
            {isLoggedIn ? "Compare up to 4 cities side by side." : "Compare up to 2 cities. Sign in to compare more."}
          </p>
        </div>

        {/* City selector */}
        <div className="flex flex-wrap gap-3 mb-6 items-start">
          {/* Selected city chips */}
          {selectedCities.map((city) => (
            <div key={city.id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl pl-1 pr-3 py-1 shadow-sm">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden shrink-0">
                <Image src={city.imageUrl} alt={city.name} fill className="object-cover" sizes="32px" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 leading-none">{city.name}</p>
                <p className="text-xs text-gray-400">{city.country}</p>
              </div>
              <button onClick={() => removeCity(city.slug)} className="ml-1 p-0.5 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          ))}

          {/* Add city input */}
          {slugs.length < MAX && (
            <div className="relative">
              <div className="flex items-center gap-2 border border-dashed border-gray-300 rounded-2xl px-3 py-2 bg-white hover:border-rose-400 transition-colors">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Add a city…"
                  className="text-sm outline-none w-36 bg-transparent text-gray-700 placeholder-gray-400"
                />
              </div>
              {filtered.length > 0 && (
                <div className="absolute top-full mt-1 left-0 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1">
                  {filtered.map((city) => (
                    <button key={city.slug} onClick={() => addCity(city.slug)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left">
                      <div className="relative w-6 h-6 rounded-lg overflow-hidden shrink-0">
                        <Image src={city.imageUrl} alt={city.name} fill className="object-cover" sizes="24px" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{city.name}</p>
                        <p className="text-xs text-gray-400">{city.country}</p>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Guest limit prompt */}
          {!isLoggedIn && slugs.length >= guestLimit && (
            <button onClick={() => setShowAuth(true)}
              className="flex items-center gap-1.5 text-sm text-rose-500 border border-rose-200 rounded-2xl px-3 py-2 hover:bg-rose-50 transition-colors">
              <Lock className="w-3.5 h-3.5" />
              Sign in to add more cities
            </button>
          )}
        </div>

        {/* Empty state */}
        {selectedCities.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl">
            <BarChart2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No cities selected yet</p>
            <p className="text-sm text-gray-400 mt-1">Search for a city above to start comparing.</p>
          </div>
        )}

        {/* Single city prompt */}
        {selectedCities.length === 1 && (
          <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
            Add at least one more city to start comparing.
          </div>
        )}

        {/* Comparison table */}
        {selectedCities.length >= 2 && (
          <div>
            {/* City headers */}
            <div className="grid mb-4" style={{ gridTemplateColumns: `144px repeat(${selectedCities.length}, 1fr)` }}>
              <div />
              {selectedCities.map((city) => (
                <Link key={city.id} href={`/cities/${city.slug}`}
                  className="group flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-sm">
                    <Image src={city.imageUrl} alt={city.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900 group-hover:text-rose-500 transition-colors">{city.name}</p>
                    <p className="text-xs text-gray-400">{city.country}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className={`text-sm font-bold ${scoreColor(city.scores.overall)}`}>
                        {city.scores.overall.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-100 mb-6">
              <div className="flex gap-0 overflow-x-auto">
                {TABS.map(({ id, label }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
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
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              {activeTab === "scores"   && <ScoresTab />}
              {activeTab === "budget"   && <BudgetTab />}
              {activeTab === "todo"     && <div className="p-4"><TodoTab /></div>}
              {activeTab === "proscons" && <div className="p-4"><ProsConsTab /></div>}
              {activeTab === "reviews"  && <div className="p-4"><ReviewsTab /></div>}
            </div>
          </div>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultMode="signin" />}
    </>
  );
}
