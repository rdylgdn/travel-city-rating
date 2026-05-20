import { Star } from "lucide-react";
import { Review } from "@/lib/types";

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-white">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-gray-800 text-sm">{review.authorName}</p>
          <p className="text-xs text-gray-400">
            {review.travelStyle} · {review.monthVisited}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-bold text-gray-800">{review.overallRating}/10</span>
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
                  <span className="text-green-500 mt-0.5">+</span> {pro}
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
                  <span className="text-red-400 mt-0.5">−</span> {con}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
