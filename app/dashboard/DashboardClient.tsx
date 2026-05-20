"use client";

import { useState } from "react";
import { Bookmark, Star, Settings, Sliders, MapPin } from "lucide-react";
import { City, Review, BudgetMode } from "@/lib/types";
import { UserProfile, CityStats } from "@/lib/mock-user";
import SavedCities from "@/components/dashboard/SavedCities";
import MyReviews from "@/components/dashboard/MyReviews";
import TravelPreferences from "@/components/dashboard/TravelPreferences";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import { cn } from "@/lib/utils";

type Tab = "saved" | "reviews" | "preferences" | "settings";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "saved", label: "Saved cities", icon: Bookmark },
  { id: "reviews", label: "My reviews", icon: Star },
  { id: "preferences", label: "Travel preferences", icon: Sliders },
  { id: "settings", label: "Settings", icon: Settings },
];

type Props = {
  user: UserProfile;
  savedCities: { city: City; budgetMode: BudgetMode }[];
  reviews: Review[];
  stats: CityStats;
};

export default function DashboardClient({ user, savedCities, reviews, stats  }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("saved");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-lg shrink-0">
          {user.avatarInitials}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-sm text-gray-400">{user.email} · Member since {user.joinedDate}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Saved cities", value: stats.savedCount, icon: Bookmark },
          { label: "Reviews written", value: stats.reviewCount, icon: Star },
          { label: "Cities visited", value: stats.visitedCount, icon: MapPin },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
            <Icon className="w-4 h-4 text-rose-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 mb-6">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                activeTab === id
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "saved" && <SavedCities cities={savedCities} />}
      {activeTab === "reviews" && <MyReviews reviews={reviews} />}
      {activeTab === "preferences" && <TravelPreferences user={user} />}
      {activeTab === "settings" && <ProfileSettings user={user} />}
    </div>
  );
}
