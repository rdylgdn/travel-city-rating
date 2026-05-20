import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, DollarSign } from "lucide-react";
import { City, BudgetMode } from "@/lib/types";
import { cn, scoreColor, budgetLabel } from "@/lib/utils";

type Props = {
  city: City;
  budgetMode: BudgetMode;
};

export default function CityCard({ city, budgetMode }: Props) {
  const dailyBudget = city.dailyBudget[budgetMode];

  return (
    <Link href={`/cities/${city.slug}`} className="group block">
      <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        {/* Image */}
        <div className="relative h-52 w-full overflow-hidden">
          <Image
            src={city.imageUrl}
            alt={city.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Score badge */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className={cn("text-sm font-bold", scoreColor(city.scores.overall))}>
              {city.scores.overall.toFixed(1)}
            </span>
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          {/* City name on image */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-bold text-lg leading-tight">{city.name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-white/80" />
              <span className="text-white/80 text-xs">{city.country}</span>
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="p-3">
          {/* Budget */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-800">${dailyBudget}/day</span>
            </div>
            <span className="text-xs text-gray-400">{budgetLabel(budgetMode)}</span>
          </div>

          {/* Best-for tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {city.bestFor.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{city.bestSeason}</span>
            <span>{city.reviewCount} reviews</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
