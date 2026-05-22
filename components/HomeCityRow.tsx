"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Bookmark, Users, CheckCircle2 } from "lucide-react";
import { City, BudgetMode } from "@/lib/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useSavedCities } from "@/contexts/SavedCitiesContext";

const TAG_COLORS: Record<string, string> = {
  "Solo": "#3DD9C5", "Couple": "#F472B6", "Honeymoon": "#F472B6",
  "Friends": "#60A5FA", "Family": "#4ADE80", "Backpacking": "#34D399",
  "Adventure": "#FB7185", "Culture": "#F4C95D", "Nature": "#4ADE80",
  "Food": "#F59E0B", "Nightlife": "#A78BFA", "Beach": "#60A5FA",
  "Digital Nomad": "#3DD9C5", "Luxury": "#FBBF24",
};

type Props = {
  cities: City[];
  budgetMode: BudgetMode;
  savedCounts: Record<string, number>;
  visitedCounts: Record<string, number>;
  networkVisitedCounts: Record<string, number>;
  reviewCounts: Record<string, number>;
};

export default function HomeCityRow({ cities, budgetMode, savedCounts, visitedCounts, networkVisitedCounts, reviewCounts }: Props) {
  const { format } = useCurrency();
  const { saved, visited, toggleSaved, toggleVisited } = useSavedCities();

  if (cities.length === 0) return null;

  const topCities = [...cities].sort((a, b) => b.scores.overall - a.scores.overall).slice(0, 8);

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Top Cities For You</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Highest rated destinations this month</p>
        </div>
        <Link href="/#all-cities" className="text-sm font-medium transition-colors" style={{ color: "var(--brand)" }}>
          View all cities →
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {topCities.map((city) => {
          const isSaved = saved.has(city.slug);
          const isVisited = visited.has(city.slug);
          const networkCount = networkVisitedCounts[city.slug] ?? 0;
          const savCount = savedCounts[city.slug] ?? 0;
          const visCount = visitedCounts[city.slug] ?? 0;
          const revCount = reviewCounts[city.slug] ?? 0;

          return (
            <Link key={city.id} href={`/cities/${city.slug}?budget=${budgetMode}`}
              className="group shrink-0 w-52 rounded-2xl overflow-hidden flex flex-col transition-transform hover:-translate-y-1"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}>
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <Image src={city.imageUrl} alt={city.name} fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="208px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Score */}
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(11,16,32,0.85)", backdropFilter: "blur(4px)" }}>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold text-white">{city.scores.overall.toFixed(1)}</span>
                </div>

                {/* Save button */}
                <button
                  onClick={(e) => { e.preventDefault(); toggleSaved(city.slug, budgetMode); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{ background: isSaved ? "var(--brand)" : "rgba(11,16,32,0.7)" }}>
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-white text-white" : "text-white"}`} />
                </button>

                {/* City name bottom */}
                <div className="absolute bottom-2 left-3 right-3">
                  <p className="text-white font-bold text-sm leading-tight">{city.name}</p>
                  <p className="text-white/70 text-xs">{city.country}</p>
                </div>
              </div>

              {/* Card body */}
              <div className="p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: "var(--brand)" }}>{format(city.dailyBudget[budgetMode])}/day</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{revCount} reviews</span>
                </div>

                {/* Tags */}
                <div className="flex gap-1 overflow-hidden">
                  {city.bestFor.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap"
                      style={{ background: (TAG_COLORS[tag] ?? "#6B7280") + "22", color: TAG_COLORS[tag] ?? "#A8B0C5" }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Social proof */}
                {(networkCount > 0 || savCount > 0 || visCount > 0) && (
                  <div className="flex items-center gap-2 pt-1.5" style={{ borderTop: "1px solid var(--border)" }}>
                    {networkCount > 0 && (
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: "#FB7185" }}>
                        <Users className="w-3 h-3" />{networkCount} friend{networkCount > 1 ? "s" : ""}
                      </span>
                    )}
                    {savCount > 0 && (
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--brand)" }}>
                        <Bookmark className="w-3 h-3 fill-current" />{savCount}
                      </span>
                    )}
                    {visCount > 0 && (
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: "#4ADE80" }}>
                        <CheckCircle2 className="w-3 h-3" />{visCount}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
