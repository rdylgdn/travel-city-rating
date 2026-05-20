import Link from "next/link";
import { Star, Pencil, Trash2 } from "lucide-react";
import { Review } from "@/lib/types";
import { cities } from "@/lib/seed-data";

export default function MyReviews({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">You haven&apos;t written any reviews yet.</p>
        <Link href="/" className="mt-3 inline-block text-rose-500 text-sm font-medium hover:underline">
          Find a city to review
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const city = cities.find((c) => c.id === review.cityId);
        return (
          <div key={review.id} className="border border-gray-100 rounded-xl p-4 bg-white">
            <div className="flex items-start justify-between mb-2">
              <div>
                {city && (
                  <Link href={`/cities/${city.slug}`} className="font-semibold text-gray-800 hover:text-rose-500 transition-colors">
                    {city.name}, {city.country}
                  </Link>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  {review.travelStyle} · {review.monthVisited}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-bold text-gray-800">{review.overallRating}/10</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <Pencil className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.writtenReview}</p>
            <div className="grid grid-cols-2 gap-3">
              {review.pros.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-green-600 mb-1">Pros</p>
                  <ul className="space-y-0.5">
                    {review.pros.map((pro) => (
                      <li key={pro} className="text-xs text-gray-600 flex gap-1">
                        <span className="text-green-500">+</span> {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {review.cons.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-500 mb-1">Cons</p>
                  <ul className="space-y-0.5">
                    {review.cons.map((con) => (
                      <li key={con} className="text-xs text-gray-600 flex gap-1">
                        <span className="text-red-400">−</span> {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
