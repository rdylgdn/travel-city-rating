import { Globe, Star, Inbox, BarChart2, Users } from "lucide-react";
import { mockAdminStats } from "@/lib/mock-admin";
import { cities } from "@/lib/seed-data";
import Link from "next/link";

export const metadata = { title: "Admin — CityRate" };

export default function AdminOverviewPage() {
  const stats = mockAdminStats;

  const statCards = [
    { label: "Total cities", value: stats.totalCities, icon: Globe, href: "/admin/cities" },
    { label: "Total reviews", value: stats.totalReviews, icon: Star, href: "/admin/reviews" },
    { label: "Pending suggestions", value: stats.pendingSuggestions, icon: Inbox, href: "/admin/suggestions", highlight: true },
    { label: "Anonymous ratings", value: stats.totalAnonymousRatings.toLocaleString(), icon: BarChart2, href: null },
    { label: "Registered users", value: stats.totalUsers, icon: Users, href: null },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Site-wide stats at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map(({ label, value, icon: Icon, href, highlight }) => {
          const card = (
            <div className={`rounded-xl p-4 border ${highlight ? "bg-rose-50 border-rose-200" : "bg-gray-50 border-gray-100"}`}>
              <Icon className={`w-4 h-4 mb-2 ${highlight ? "text-rose-500" : "text-gray-400"}`} />
              <p className={`text-2xl font-bold ${highlight ? "text-rose-600" : "text-gray-800"}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          );
          return href ? (
            <Link key={label} href={href} className="hover:opacity-80 transition-opacity">{card}</Link>
          ) : (
            <div key={label}>{card}</div>
          );
        })}
      </div>

      {/* Cities quick list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Published cities</h2>
          <Link href="/admin/cities" className="text-xs text-rose-500 hover:underline">Manage all</Link>
        </div>
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">City</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Score</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Reviews</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Region</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cities.slice(0, 5).map((city) => (
                <tr key={city.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{city.name}, {city.country}</td>
                  <td className="px-4 py-2.5 text-gray-600">{city.scores.overall.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-gray-600">{city.reviewCount}</td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">{city.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
