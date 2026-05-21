"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, Star, Settings, CheckCircle2, Globe, ExternalLink } from "lucide-react";
import { City, Review, BudgetMode } from "@/lib/types";
import { Profile, getTravelerBadge, getContinentsVisited } from "@/lib/profile";
import SavedCities from "@/components/dashboard/SavedCities";
import VisitedCities from "@/components/dashboard/VisitedCities";
import MyReviews from "@/components/dashboard/MyReviews";
import ProfileEditor from "@/components/dashboard/ProfileEditor";
import CountriesModal from "@/components/dashboard/CountriesModal";
import { cn } from "@/lib/utils";

type Tab = "saved" | "visited" | "reviews" | "settings";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "saved",    label: "Saved",      icon: Bookmark },
  { id: "visited",  label: "Visited",    icon: CheckCircle2 },
  { id: "reviews",  label: "My reviews", icon: Star },
  { id: "settings", label: "Settings",   icon: Settings },
];

type Props = {
  userId: string;
  displayName: string;
  displayEmail: string;
  profile: Profile | null;
  savedCities: { city: City; budgetMode: BudgetMode }[];
  visitedCities: City[];
  reviews: Review[];
  stats: { savedCount: number; reviewCount: number; visitedCount: number };
};

const TOTAL_COUNTRIES = 195;

export default function DashboardClient({
  userId, displayName, displayEmail, profile,
  savedCities, visitedCities, reviews, stats,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("saved");
  const [showMap, setShowMap] = useState(false);

  const visitedCountryCount = new Set(visitedCities.map((c) => c.countryIso)).size;
  const continents = getContinentsVisited(visitedCities);
  const badge = getTravelerBadge(visitedCountryCount);
  const travelStyles = profile?.travel_styles ?? [];
  const initials = (profile?.display_name ?? displayEmail).slice(0, 2).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Profile header */}
      <div className="flex items-start gap-5 mb-8">
        {/* Avatar */}
        <div className="shrink-0">
          <div className="w-20 h-20 rounded-full bg-rose-100 overflow-hidden flex items-center justify-center">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt={displayName} width={80} height={80} className="object-cover w-full h-full" />
            ) : (
              <span className="text-rose-600 font-bold text-2xl">{initials}</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
            <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", badge.bg, badge.color)}>
              {badge.label}
            </span>
          </div>

          {profile?.home_country && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-base leading-none">{profile.home_country_flag}</span>
              <span className="text-sm text-gray-500">From {profile.home_country}</span>
            </div>
          )}

          {profile?.bio && (
            <p className="text-sm text-gray-500 italic mt-1">{profile.bio}</p>
          )}

          {continents.length > 0 && (
            <p className="text-xs text-gray-400 mt-1.5">
              {continents.length} {continents.length === 1 ? "continent" : "continents"} visited
              {continents.length > 0 && ` · ${continents.join(", ")}`}
            </p>
          )}

          {travelStyles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {travelStyles.map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Edit profile + view public profile */}
        <div className="shrink-0 flex flex-col gap-1 mt-1">
          <button onClick={() => setActiveTab("settings")}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors text-right">
            Edit profile
          </button>
          <Link href={`/u/${userId}`} target="_blank"
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-500 transition-colors">
            <ExternalLink className="w-3 h-3" /> Public profile
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <button onClick={() => setActiveTab("saved")} className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
          <Bookmark className="w-4 h-4 text-rose-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-800">{stats.savedCount}</p>
          <p className="text-xs text-gray-400">Saved</p>
        </button>
        <button onClick={() => setActiveTab("visited")} className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-800">{stats.visitedCount}</p>
          <p className="text-xs text-gray-400">Cities visited</p>
        </button>
        <button onClick={() => setShowMap(true)} className="bg-green-50 rounded-xl p-4 text-center hover:bg-green-100 transition-colors">
          <Globe className="w-4 h-4 text-green-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-green-700">
            {visitedCountryCount}<span className="text-sm text-green-400 font-normal"> / {TOTAL_COUNTRIES}</span>
          </p>
          <p className="text-xs text-green-500 font-medium">Countries · View map</p>
        </button>
        <button onClick={() => setActiveTab("reviews")} className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
          <Star className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-800">{stats.reviewCount}</p>
          <p className="text-xs text-gray-400">Reviews</p>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 mb-6">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                activeTab === id
                  ? id === "visited" ? "border-green-500 text-green-600" : "border-rose-500 text-rose-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "saved"    && <SavedCities cities={savedCities} />}
      {activeTab === "visited"  && <VisitedCities cities={visitedCities} />}
      {activeTab === "reviews"  && <MyReviews reviews={reviews} />}
      {activeTab === "settings" && (
        <ProfileEditor userId={userId} profile={profile} displayEmail={displayEmail} />
      )}

      {showMap && (
        <CountriesModal visitedCities={visitedCities} savedCities={savedCities} onClose={() => setShowMap(false)} />
      )}
    </div>
  );
}
