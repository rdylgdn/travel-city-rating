import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, Star, Users, Calendar } from "lucide-react";
import { cities } from "@/lib/seed-data";
import { createClient } from "@/utils/supabase/server";
import { blendScores } from "@/lib/scores";
import { getPlatformSettings } from "@/lib/platform-settings";
import { adminCityToCity } from "@/lib/admin-cities";
import ScoreBar from "@/components/ScoreBar";
import ReviewCard, { ReviewProfile } from "@/components/ReviewCard";
import ReviewWithActions from "@/components/ReviewWithActions";
import ReviewGalleryWrapper from "@/components/ReviewGalleryWrapper";
import type { GalleryImage } from "@/components/ReviewGallery";

const allCities = cities;
import BestTimeChart from "@/components/BestTimeChart";
import AnonymousRatingWidget from "@/components/AnonymousRatingWidget";
import ReviewsGate from "@/components/ReviewsGate";
import ReviewForm from "@/components/ReviewForm";
import ReviewSignInPrompt from "@/components/ReviewSignInPrompt";
import CityDetailClient from "./CityDetailClient";
import { scoreColor } from "@/lib/utils";
import { BudgetMode } from "@/lib/types";
import { getTravelerBadge } from "@/lib/profile";

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

  // Single client for the entire page — avoids multiple cookies() calls on Vercel
  const supabase = await createClient();

  // Fetch everything in parallel with one client
  const [
    settings,
    { data: adminRows },
    { data: archivedRows },
    { data: dbReviews },
    { data: anonData },
    { count: savedCount },
    { count: visitedCount },
    { data: { user } },
  ] = await Promise.all([
    getPlatformSettings(supabase),
    supabase.from("admin_cities").select("*").eq("is_published", true),
    supabase.from("archived_slugs").select("slug"),
    supabase.from("reviews").select("*").eq("city_slug", slug).eq("status", "approved").order("created_at", { ascending: false }),
    supabase.from("anonymous_ratings").select("overall_score").eq("city_slug", slug),
    supabase.from("saved_cities").select("*", { count: "exact", head: true }).eq("city_slug", slug),
    supabase.from("visited_cities").select("*", { count: "exact", head: true }).eq("city_slug", slug),
    supabase.auth.getUser(),
  ]);

  // Resolve city from seed + admin cities
  const archived = new Set((archivedRows ?? []).map((r: { slug: string }) => r.slug));
  const adminCities = (adminRows ?? []).map(adminCityToCity);
  const allCitiesCombined = [...cities.filter((c) => !archived.has(c.slug)), ...adminCities];
  const city = allCitiesCombined.find((c) => c.slug === slug);
  if (!city) notFound();

  const validModes: BudgetMode[] = ["budget", "midRange", "luxury"];
  const initialBudgetMode: BudgetMode =
    validModes.includes(budget as BudgetMode) ? (budget as BudgetMode) : "budget";

  const seedWeight = settings.seed_weight_enabled ? 100 : 0;

  const reviews = dbReviews ?? [];
  const anonScores = (anonData ?? []).map((r) => Number(r.overall_score));
  const blended = blendScores(city, reviews, anonScores, seedWeight);
  const userReview = user ? reviews.find((r: { user_id: string }) => r.user_id === user.id) : null;

  // Check if current user has a pending review not yet visible
  let userPendingReview: { id: string } | null = null;
  if (user && !userReview) {
    const { data: pr } = await supabase
      .from("reviews").select("id").eq("city_slug", slug).eq("user_id", user.id).eq("status", "pending").maybeSingle();
    userPendingReview = pr;
  }

  // Fetch profiles + visited counts for all reviewers in parallel
  const reviewerIds = [...new Set(reviews.map((r: { user_id: string }) => r.user_id))];
  let profilesMap: Record<string, Record<string, unknown>> = {};
  let visitedCountPerUser: Record<string, number> = {};

  if (reviewerIds.length > 0) {
    const [{ data: profileRows }, { data: visitedRows }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, avatar_url, home_country, home_country_flag, travel_styles, role").in("id", reviewerIds),
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

  // Build review profiles using role from DB
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
      role: ((p?.role as string) ?? "user") as "user" | "verified" | "admin",
    };
  }

  // Build gallery from all reviews with images
  const galleryImages: GalleryImage[] = (() => {
    try {
      return reviews.flatMap((r) => {
        const raw = r.image_urls;
        // image_urls can be null, undefined, or a string array
        const urls: string[] = Array.isArray(raw) ? raw.filter((u: unknown) => typeof u === "string") : [];
        const profile = reviewProfiles[r.id];
        return urls.map((url) => ({
          url,
          authorName: profile?.displayName ?? (r.user_email as string | undefined)?.split("@")[0] ?? "Traveler",
          travelStyle: r.travel_style ?? undefined,
          monthVisited: r.month_visited ?? undefined,
        }));
      });
    } catch {
      return [];
    }
  })();

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
              <span className="text-white/80 text-sm">
                {reviews.length + anonScores.length} {(reviews.length + anonScores.length) === 1 ? "rating" : "ratings"}
              </span>
            </div>
            {reviews.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-white/60 text-sm">·</span>
                <span className="text-white/80 text-sm">
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}
            {(savedCount ?? 0) > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-white/60 text-sm">·</span>
                <span className="text-white/80 text-sm">{savedCount} saved</span>
              </div>
            )}
            {(visitedCount ?? 0) > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-white/60 text-sm">·</span>
                <span className="text-white/80 text-sm">{visitedCount} visited</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-8">
        {/* Snapshot + budget */}
        <CityDetailClient
          citySlug={city.slug}
          initialBudgetMode={initialBudgetMode}
          city={city}
          totalRatings={reviews.length + anonScores.length}
          memberReviews={reviews.length}
          savedCount={savedCount ?? 0}
          visitedCount={visitedCount ?? 0}
        />

        {/* Scores — blended from seed + member reviews + anonymous ratings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Scores</h2>
            {(reviews.length > 0 || anonScores.length > 0) && (
              <span className="text-xs text-gray-400">
                {reviews.length > 0 && `${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`}
                {reviews.length > 0 && anonScores.length > 0 && " · "}
                {anonScores.length > 0 && `${anonScores.length} anonymous`}
              </span>
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

        {/* Best time to visit */}
        {settings.best_time_chart_enabled && city.monthlyData && <BestTimeChart monthlyData={city.monthlyData} />}

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

        {/* Anonymous rating — guests only, when feature enabled */}
        {!user && settings.anonymous_ratings_enabled && <AnonymousRatingWidget citySlug={city.slug} />}

        {/* Photo gallery */}
        {settings.gallery_enabled && galleryImages.length > 0 && <ReviewGalleryWrapper images={galleryImages} />}

        {/* Reviews section */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Member reviews
            <span className="text-sm text-gray-400 font-normal ml-2">({reviews.length})</span>
          </h2>

          {user ? (
            <>
              {/* Review form, pending notice, or already-reviewed note */}
              {userPendingReview ? (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-700 flex items-start gap-2">
                  <span className="mt-0.5">⏳</span>
                  <div>
                    <p className="font-semibold">Your review is pending admin approval.</p>
                    <p className="text-yellow-600 mt-0.5">It will appear here once approved. You can still edit it below.</p>
                  </div>
                </div>
              ) : !userReview ? (
                <div className="mb-6">
                  <ReviewForm citySlug={slug} userEmail={user.email ?? ""} userId={user.id} showImages={settings.review_images_enabled} />
                </div>
              ) : (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
                  You&apos;ve already reviewed this city.
                </div>
              )}

              {/* Reviews list */}
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => {
                    const isOwn = user?.id === r.user_id;
                    const reviewData = {
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
                      createdAt: r.created_at ?? "",
                      updatedAt: r.updated_at ?? "",
                      imageUrls: r.image_urls ?? [],
                    };
                    return isOwn ? (
                      <ReviewWithActions
                        key={r.id}
                        review={{ ...reviewData, rawData: r }}
                        profile={reviewProfiles[r.id]}
                        citySlug={slug}
                        userId={user!.id}
                        userEmail={user!.email ?? ""}
                      />
                    ) : (
                      <ReviewCard key={r.id} profile={reviewProfiles[r.id]} reviewUserId={r.user_id} review={reviewData} />
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Guest — blurred gate (if setting is ON) or open reviews (if OFF) */
            settings.guest_review_gate ? (
              reviews.length === 0 ? (
                <ReviewSignInPrompt />
              ) : (
                <ReviewsGate reviewCount={reviews.length} />
              )
            ) : (
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <p className="text-gray-400 text-sm">No reviews yet. Sign in to be the first!</p>
                ) : (
                  reviews.map((r) => (
                    <ReviewCard key={r.id} profile={reviewProfiles[r.id]} reviewUserId={r.user_id} review={{
                      id: r.id, cityId: city.id,
                      authorName: reviewProfiles[r.id]?.displayName ?? "Traveler",
                      travelStyle: r.travel_style, budgetCategory: r.budget_category,
                      monthVisited: r.month_visited ?? "", overallRating: r.overall_rating,
                      writtenReview: r.written_review ?? "",
                      pros: r.pros ?? [], cons: r.cons ?? [],
                      createdAt: r.created_at ?? "", updatedAt: r.updated_at ?? "",
                      imageUrls: r.image_urls ?? [],
                    }} />
                  ))
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
