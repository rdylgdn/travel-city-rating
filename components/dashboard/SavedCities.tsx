import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Trash2 } from "lucide-react";
import { City } from "@/lib/types";
import { scoreColor } from "@/lib/utils";

export default function SavedCities({ cities }: { cities: City[] }) {
  if (cities.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">No saved cities yet.</p>
        <Link href="/" className="mt-3 inline-block text-rose-500 text-sm font-medium hover:underline">
          Browse cities
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cities.map((city) => (
        <div key={city.id} className="group relative rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
          <Link href={`/cities/${city.slug}`}>
            <div className="relative h-40 w-full overflow-hidden">
              <Image
                src={city.imageUrl}
                alt={city.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3">
                <p className="text-white font-bold">{city.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-white/70" />
                  <span className="text-white/70 text-xs">{city.country}</span>
                </div>
              </div>
              <div className="absolute top-2 left-2 bg-white/90 rounded-full px-2 py-0.5 flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className={`text-xs font-bold ${scoreColor(city.scores.overall)}`}>
                  {city.scores.overall.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="p-3">
              <div className="flex flex-wrap gap-1">
                {city.bestFor.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">${city.dailyBudget.budget}/day · {city.bestSeason}</p>
            </div>
          </Link>
          <button className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      ))}
    </div>
  );
}
