"use client";

import { useState } from "react";
import { Bookmark, Star, Settings, Sliders, MapPin, CheckCircle2 } from "lucide-react";
import { City, Review, BudgetMode } from "@/lib/types";
import { UserProfile } from "@/lib/mock-user";
import SavedCities from "@/components/dashboard/SavedCities";
import VisitedCities from "@/components/dashboard/VisitedCities";
import MyReviews from "@/components/dashboard/MyReviews";
import TravelPreferences from "@/components/dashboard/TravelPreferences";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import { cn } from "@/lib/utils";

type Tab = "saved" | "visited" | "reviews" | "preferences" | "settings";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "visited", label: "Visited", icon: CheckCircle2 },
  { id: "reviews", label: "My reviews", icon: Star },
  { id: "preferences", label: "Preferences", icon: Sliders },
  { id: "settings", label: "Settings", icon: Settings },
];

type Props = {
  user: UserProfile;
  savedCities: { city: City; budgetMode: BudgetMode }[];
  visitedCities: City[];
  reviews: Review[];
  stats: { savedCount: number; reviewCount: number; visitedCount: number };
};

export default function DashboardClient({ user, savedCities, visitedCities, reviews, stats }: Props) {
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
          { label: "Saved", value: stats.savedCount, icon: Bookmark, color: "text-rose-400", onClick: () => setActiveTab("saved") },
          { label: "Visited", value: stats.visitedCount, icon: CheckCircle2, color: "text-green-500", onClick: () => setActiveTab("visited") },
          { label: "Reviews", value: stats.reviewCount, icon: Star, color: "text-yellow-500", onClick: () => setActiveTab("reviews") },
        ].map(({ label, value, icon: Icon, color, onClick }) => (
          <button key={label} onClick={onClick} className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
            <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </button>
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
                  ? id === "visited"
                    ? "border-green-500 text-green-600"
                    : "border-rose-500 text-rose-600"
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
      {activeTab === "visited" && <VisitedCities cities={visitedCities} />}
      {activeTab === "reviews" && <MyReviews reviews={reviews} />}
      {activeTab === "preferences" && <TravelPreferences user={user} />}
      {activeTab === "settings" && <ProfileSettings user={user} />}
    </div>
  );
}
