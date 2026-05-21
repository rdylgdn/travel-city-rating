import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { cities as seedCities } from "@/lib/seed-data";
import {
  Globe, Star, BarChart2, Users, Bookmark, CheckCircle2,
  Inbox, Clock, Briefcase, MessageSquare,
} from "lucide-react";

export const metadata = { title: "Admin — CityRate" };

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: reviewsTotal },
    { count: reviewsPending },
    { count: ratingsTotal },
    { count: usersTotal },
    { count: savesTotal },
    { count: visitsTotal },
    { count: suggestionsTotal },
    { count: tripsTotal },
    { count: adminCitiesTotal },
  ] = await Promise.all([
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("anonymous_ratings").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("saved_cities").select("*", { count: "exact", head: true }),
    supabase.from("visited_cities").select("*", { count: "exact", head: true }),
    supabase.from("city_suggestions").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("trips").select("*", { count: "exact", head: true }),
    supabase.from("admin_cities").select("*", { count: "exact", head: true }).eq("is_published", true),
  ]);

  const totalRatings = (reviewsTotal ?? 0) + (ratingsTotal ?? 0);
  const totalCities = seedCities.length + (adminCitiesTotal ?? 0);

  const stats = [
    {
      label: "Total cities",
      value: totalCities,
      icon: Globe,
      href: "/admin/cities",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Approved reviews",
      value: reviewsTotal ?? 0,
      icon: Star,
      href: "/admin/reviews",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Total ratings",
      value: totalRatings,
      icon: BarChart2,
      sub: `${reviewsTotal ?? 0} reviews · ${ratingsTotal ?? 0} anonymous`,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Pending reviews",
      value: reviewsPending ?? 0,
      icon: Clock,
      href: "/admin/reviews",
      color: "text-orange-600",
      bg: "bg-orange-50",
      highlight: (reviewsPending ?? 0) > 0,
    },
    {
      label: "Registered users",
      value: usersTotal ?? 0,
      icon: Users,
      color: "text-gray-600",
      bg: "bg-gray-50",
    },
    {
      label: "Cities saved",
      value: savesTotal ?? 0,
      icon: Bookmark,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "Cities visited",
      value: visitsTotal ?? 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Trips created",
      value: tripsTotal ?? 0,
      icon: Briefcase,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Pending suggestions",
      value: suggestionsTotal ?? 0,
      icon: Inbox,
      href: "/admin/suggestions",
      color: "text-rose-600",
      bg: "bg-rose-50",
      highlight: (suggestionsTotal ?? 0) > 0,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Site-wide stats at a glance</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon, href, color, bg, sub, highlight }) => {
          const card = (
            <div className={`rounded-2xl p-4 border transition-all h-28 flex flex-col justify-between ${
              highlight ? "border-orange-200 bg-orange-50" : `${bg} border-transparent`
            } ${href ? "hover:shadow-sm" : ""}`}>
              <Icon className={`w-5 h-5 ${highlight ? "text-orange-500" : color}`} />
              <div>
                <p className={`text-2xl font-bold leading-none ${highlight ? "text-orange-600" : "text-gray-900"}`}>
                  {value.toLocaleString()}
                </p>
                <p className={`text-xs mt-1 ${highlight ? "text-orange-500 font-medium" : "text-gray-400"}`}>
                  {label}
                </p>
                {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
              </div>
            </div>
          );
          return href ? (
            <Link key={label} href={href} className="block">{card}</Link>
          ) : (
            <div key={label}>{card}</div>
          );
        })}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Moderate reviews", desc: `${reviewsPending ?? 0} pending`, href: "/admin/reviews", icon: MessageSquare, urgent: (reviewsPending ?? 0) > 0 },
            { label: "Manage cities", desc: `${totalCities} published`, href: "/admin/cities", icon: Globe, urgent: false },
            { label: "City suggestions", desc: `${suggestionsTotal ?? 0} pending`, href: "/admin/suggestions", icon: Inbox, urgent: (suggestionsTotal ?? 0) > 0 },
            { label: "Platform settings", desc: "Feature flags", href: "/admin/settings", icon: BarChart2, urgent: false },
          ].map(({ label, desc, href, icon: Icon, urgent }) => (
            <Link key={label} href={href}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all hover:shadow-sm ${
                urgent ? "border-orange-200 bg-orange-50" : "border-gray-100 bg-white hover:border-gray-200"
              }`}>
              <Icon className={`w-4 h-4 shrink-0 ${urgent ? "text-orange-500" : "text-gray-400"}`} />
              <div className="min-w-0">
                <p className={`text-sm font-semibold truncate ${urgent ? "text-orange-700" : "text-gray-700"}`}>{label}</p>
                <p className={`text-xs ${urgent ? "text-orange-500 font-medium" : "text-gray-400"}`}>{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
