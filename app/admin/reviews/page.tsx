import { reviews } from "@/lib/seed-data";
import { cities } from "@/lib/seed-data";
import { Star, Trash2, Flag } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Reviews — Admin — CityRate" };

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-400 mt-1">{reviews.length} total member reviews</p>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => {
          const city = cities.find((c) => c.id === review.cityId);
          return (
            <div key={review.id} className="border border-gray-100 rounded-xl p-4 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {city && (
                      <Link
                        href={`/cities/${city.slug}`}
                        target="_blank"
                        className="font-semibold text-gray-800 hover:text-rose-500 transition-colors text-sm"
                      >
                        {city.name}, {city.country}
                      </Link>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-gray-700">{review.overallRating}/10</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    {review.authorName} · {review.travelStyle} · {review.monthVisited}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{review.writtenReview}</p>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button className="p-1.5 rounded-lg hover:bg-yellow-50 transition-colors" title="Flag review">
                    <Flag className="w-3.5 h-3.5 text-yellow-500" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete review">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400">Posted {review.createdAt}</span>
                <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">Published</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
