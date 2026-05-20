import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, Calendar, Star, Users } from "lucide-react";
import { cities, reviews } from "@/lib/seed-data";
import ScoreBar from "@/components/ScoreBar";
import ReviewCard from "@/components/ReviewCard";
import AnonymousRatingWidget from "@/components/AnonymousRatingWidget";
import SaveButton from "@/components/SaveButton";
import { scoreColor } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return cities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const city = cities.find((c) => c.slug === slug);
  if (!city) return {};
  return { title: `${city.name}, ${city.country} — CityRate` };
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const city = cities.find((c) => c.slug === slug);
  if (!city) notFound();

  const cityReviews = reviews.filter((r) => r.cityId === city.id);

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
        <Image
          src={city.imageUrl}
          alt={city.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-4 right-4">
          <SaveButton citySlug={city.slug} />
        </div>
        <div className="absolute bottom-6 left-4 right-4 max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {city.bestFor.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-rose-500/90 text-white rounded-full font-medium">
                {tag}
              </span>
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
              <span className={`text-sm font-bold ${scoreColor(city.scores.overall)} bg-white/90 px-1.5 py-0.5 rounded`}>
                {city.scores.overall.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-8">
        {/* Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Overall score", value: `${city.scores.overall.toFixed(1)}/10`, icon: Star },
            { label: "Budget/day", value: `$${city.dailyBudget.budget}`, icon: null },
            { label: "Best season", value: city.bestSeason, icon: Calendar },
            { label: "Reviews", value: String(city.reviewCount), icon: Users },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="font-bold text-gray-800">{value}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Why visit?</h2>
          <p className="text-gray-600 leading-relaxed">{city.whyVisit}</p>
        </div>

        {/* Scores */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Scores</h2>
          <div className="space-y-3">
            {scoreLabels.map(([key, label]) => (
              <ScoreBar key={key} label={label} score={city.scores[key]} />
            ))}
          </div>
        </div>

        {/* Budget breakdown */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Budget breakdown <span className="text-sm text-gray-400 font-normal">(budget traveler · USD/day)</span></h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(city.budgetBreakdown).map(([key, val]) => (
              <div key={key} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 capitalize mb-1">{key}</p>
                <p className="font-semibold text-gray-800">${val}/day</p>
              </div>
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

        {/* Member reviews */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Member reviews <span className="text-sm text-gray-400 font-normal">({cityReviews.length})</span>
          </h2>
          {cityReviews.length === 0 ? (
            <p className="text-gray-400 text-sm">No reviews yet. Sign in to leave the first one.</p>
          ) : (
            <div className="space-y-3">
              {cityReviews.map((r) => <ReviewCard key={r.id} review={r} />)}
            </div>
          )}
          <button className="mt-4 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-rose-400 hover:text-rose-500 transition-all">
            Sign in to write a review
          </button>
        </div>
      </div>
    </div>
  );
}
