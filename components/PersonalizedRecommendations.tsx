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
    <div className="border-b border-gray-100 px-4 py-5 bg-gradient-to-r from-rose-50/60 to-orange-50/40">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-rose-500" />
          <h2 className="text-sm font-bold text-gray-800">Recommended for you</h2>
          <span className="text-xs text-gray-400">based on your travel styles</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {recs.map((city) => (
            <Link key={city.id} href={`/cities/${city.slug}?budget=${budgetMode}`}
              className="group flex-shrink-0 w-44 rounded-2xl overflow-hidden bg-white border border-white/80 shadow-sm hover:shadow-md transition-all">
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
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium">{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
          <Link href="/" className="flex-shrink-0 w-32 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-xs text-gray-400 hover:border-rose-300 hover:text-rose-500 transition-colors">
            <span className="text-lg">→</span>
            <span>Browse all</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
