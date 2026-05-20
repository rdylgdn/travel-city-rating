import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { cities } from "@/lib/seed-data";
import { scoreColor } from "@/lib/utils";

export const metadata = { title: "Cities — Admin — CityRate" };

export default function AdminCitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cities</h1>
          <p className="text-sm text-gray-400 mt-1">{cities.length} published</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors">
          + Add city
        </button>
      </div>

      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">City</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Region</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Score</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Reviews</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Budget/day</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cities.map((city) => (
              <tr key={city.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{city.name}</p>
                  <p className="text-xs text-gray-400">{city.country}</p>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{city.region}</td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${scoreColor(city.scores.overall)}`}>
                    {city.scores.overall.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{city.reviewCount}</td>
                <td className="px-4 py-3 text-gray-600">${city.dailyBudget.budget}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">
                    Published
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100">
                      <Pencil className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <Link href={`/cities/${city.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-gray-100">
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
