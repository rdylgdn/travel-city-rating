import Link from "next/link";
import Image from "next/image";
import { Sparkles, Star } from "lucide-react";
import { City, BudgetMode, TravelStyle } from "@/lib/types";
import { scoreColor } from "@/lib/utils";
import { getRecommendations } from "@/lib/recommendations";

type Props = {
  allCities: City[];
  preferredStyles: TravelStyle[];
  excludeSlugs: string[];
  budgetMode: BudgetMode;
};

export default function PersonalizedRecommendations({ allCities, preferredStyles, excludeSlugs, budgetMode }: Props) {
  const recs = getRecommendations(allCities, preferredStyles, excludeSlugs);
  if (recs.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4" style={{ color: "var(--brand)" }} />
        <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Recommended for you</h2>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>based on your travel styles</span>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 snap-x snap-mandatory">
        {recs.map((city) => (
          <Link key={city.id} href={`/cities/${city.slug}?budget=${budgetMode}`}
            className="group flex-shrink-0 w-44 rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 snap-start"
            style={{ background: "var(--card-bg)", border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="relative h-28 overflow-hidden">
              <Image src={city.imageUrl} alt={city.name} fill
                className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="176px" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute top-2 left-2 bg-white/90 rounded-full px-2 py-0.5 flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className={`text-xs font-bold ${scoreColor(city.scores.overall)}`}>
                  {city.scores.overall.toFixed(1)}
                </span>
              </div>
              <div className="absolute bottom-2 left-2">
                <p className="text-white font-bold text-sm leading-tight">{city.name}</p>
                <p className="text-white/70 text-xs">{city.country}</p>
              </div>
            </div>
            <div className="p-2">
              <div className="flex flex-wrap gap-1">
                {city.bestFor.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: "#FF7A5918", color: "var(--brand)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
