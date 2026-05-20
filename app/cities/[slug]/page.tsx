import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, Star, Users, Calendar } from "lucide-react";
import { cities } from "@/lib/seed-data";
import { createClient } from "@/utils/supabase/server";
import { blendScores } from "@/lib/scores";
import ScoreBar from "@/components/ScoreBar";
import ReviewCard, { ReviewProfile } from "@/components/ReviewCard";
import AnonymousRatingWidget from "@/components/AnonymousRatingWidget";
import ReviewForm from "@/components/ReviewForm";
import ReviewSignInPrompt from "@/components/ReviewSignInPrompt";
import CityDetailClient from "./CityDetailClient";
import { scoreColor } from "@/lib/utils";
import { BudgetMode } from "@/lib/types";
import { getTravelerBadge } from "@/lib/profile";
import { cities as allCities } from "@/lib/seed-data";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ budget?: string }>;
};

export async function generateStaticParams() {
  return cities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const city = cities.find((c) => c.slug === slug);
  if (!city) return {};
  return { title: `${city.name}, ${city.country} — CityRate` };
}

export default async function CityPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { budget } = await searchParams;
  const city = cities.find((c) => c.slug === slug);
  if (!city) notFound();

  const validModes: BudgetMode[] = ["budget", "midRange", "luxury"];
  const initialBudgetMode: BudgetMode =
    validModes.includes(budget as BudgetMode) ? (budget as BudgetMode) : "budget";

  const supabase = await createClient();

  // Fetch reviews and auth separately — no join since reviews→profiles has no direct FK
  const [{ data: dbReviews }, { data: { user } }] = await Promise.all([
    supabase.from("reviews").select("*").eq("city_slug", slug).order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  const reviews = dbReviews ?? [];
  const blended = blendScores(city, reviews);
  const userReview = user ? reviews.find((r: { user_id: string }) => r.user_id === user.id) : null;

  // Fetch profiles + visited counts for all reviewers in parallel
  const reviewerIds = [...new Set(reviews.map((r: { user_id: string }) => r.user_id))];
  let profilesMap: Record<string, Record<string, unknown>> = {};
  let visitedCountPerUser: Record<string, number> = {};

  if (reviewerIds.length > 0) {
    const [{ data: profileRows }, { data: visitedRows }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, avatar_url, home_country, home_country_flag, travel_styles").in("id", reviewerIds),
      supabase.from("visited_cities").select("user_id, city_slug").in("user_id", reviewerIds),
    ]);

    profilesMap = Object.fromEntries((profileRows ?? []).map((p) => [p.id, p]));

    const countriesPerUser: Record<string, Set<string>> = {};
    for (const row of (visitedRows ?? [])) {
      const c = allCities.find((x) => x.slug === row.city_slug);
      if (!c) continue;
      if (!countriesPerUser[row.user_id]) countriesPerUser[row.user_id] = new Set();
      countriesPerUser[row.user_id].add(c.countryIso);
    }
    visitedCountPerUser = Object.fromEntries(
      Object.entries(countriesPerUser).map(([uid, isos]) => [uid, isos.size])
    );
  }

  // Build review profiles
  const reviewProfiles: Record<string, ReviewProfile> = {};
  for (const r of reviews) {
    const p = profilesMap[r.user_id];
    reviewProfiles[r.id] = {
      displayName: (p?.display_name as string) ?? r.user_email?.split("@")[0] ?? "Traveler",
      avatarUrl: (p?.avatar_url as string) ?? null,
      homeCountry: (p?.home_country as string) ?? null,
      homeFlag: (p?.home_country_flag as string) ?? null,
      travelStyles: (p?.travel_styles as string[]) ?? [],
      badge: getTravelerBadge(visitedCountPerUser[r.user_id] ?? 0),
    };
  }

  const scoreLabels: [keyof typeof city.scores, string][] = [
    ["overall", "Overall"],
    ["costValue", "Cost / Value"],
    ["safety", "Safety"],
    ["food", "Food"],
    ["culture", "Culture"],
    ["nature", "Nature"],
    ["nightlife", "Nightlife"],
    ["easeOfTravel", "Ease of Travel"],
  ];

  return (
    <div className="pb-16">
      {/* Hero */}
      <div className="relative h-72 sm:h-96 w-full">
        <Image src={city.imageUrl} alt={city.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-4 right-4 z-10">
          <CityDetailClient citySlug={city.slug} initialBudgetMode={initialBudgetMode} heroOnly />
        </div>
        <div className="absolute bottom-6 left-4 right-4 max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {city.bestFor.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-rose-500/90 text-white rounded-full font-medium">{tag}</span>
            ))}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">{city.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-sm">{city.country}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className={`text-sm font-bold ${scoreColor(blended.overall)} bg-white/90 px-1.5 py-0.5 rounded`}>
                {blended.overall.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-sm">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-8">
        {/* Snapshot + budget */}
        <CityDetailClient citySlug={city.slug} initialBudgetMode={initialBudgetMode} city={city} />

        {/* Scores — blended from seed + user reviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Scores</h2>
            {reviews.length > 0 && (
              <span className="text-xs text-gray-400">Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"} + editorial</span>
            )}
          </div>
          <div className="space-y-3">
            {scoreLabels.map(([key, label]) => (
              <ScoreBar key={key} label={label} score={blended[key]} />
            ))}
          </div>
        </div>

        {/* Best areas + things to do */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Best areas to stay</h2>
            <ul className="space-y-1.5">
              {city.bestAreas.map((area) => (
                <li key={area} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-rose-400 mt-0.5">•</span> {area}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Top things to do</h2>
            <ul className="space-y-1.5">
              {city.bestThingsToDo.map((thing) => (
                <li key={thing} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-rose-400 mt-0.5">•</span> {thing}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Why visit */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Why visit?</h2>
          <p className="text-gray-600 leading-relaxed">{city.whyVisit}</p>
        </div>

        {/* Common complaints */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Common complaints</h2>
          <ul className="space-y-1.5">
            {city.commonComplaints.map((c) => (
              <li key={c} className="text-sm text-gray-600 flex gap-2">
                <span className="text-yellow-500 mt-0.5">!</span> {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Anonymous rating */}
        <AnonymousRatingWidget cityId={city.id} />

        {/* Reviews section */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Member reviews
            <span className="text-sm text-gray-400 font-normal ml-2">({reviews.length})</span>
          </h2>

          {/* Review form or login prompt */}
          {user ? (
            !userReview ? (
              <div className="mb-6">
                <ReviewForm citySlug={slug} userEmail={user.email ?? ""} userId={user.id} />
              </div>
            ) : (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
                You've already reviewed this city.
              </div>
            )
          ) : (
            <div className="mb-6">
              <ReviewSignInPrompt />
            </div>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <ReviewCard key={r.id} profile={reviewProfiles[r.id]} review={{
                  id: r.id,
                  cityId: city.id,
                  authorName: reviewProfiles[r.id]?.displayName ?? "Traveler",
                  travelStyle: r.travel_style,
                  budgetCategory: r.budget_category,
                  monthVisited: r.month_visited ?? "",
                  overallRating: r.overall_rating,
                  writtenReview: r.written_review ?? "",
                  pros: r.pros ?? [],
                  cons: r.cons ?? [],
                  createdAt: r.created_at?.slice(0, 10) ?? "",
                }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
