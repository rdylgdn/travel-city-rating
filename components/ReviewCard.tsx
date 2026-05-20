import Image from "next/image";
import { Star } from "lucide-react";
import { Review } from "@/lib/types";
import { TravelerBadge } from "@/lib/profile";
import { cn } from "@/lib/utils";

export type ReviewProfile = {
  displayName: string;
  avatarUrl: string | null;
  homeCountry: string | null;
  homeFlag: string | null;
  travelStyles: string[];
  badge: TravelerBadge;
};

type Props = {
  review: Review;
  profile?: ReviewProfile;
};

export default function ReviewCard({ review, profile }: Props) {
  const initials = (profile?.displayName ?? review.authorName).slice(0, 2).toUpperCase();

  return (
    <div className="border border-gray-100 rounded-2xl p-4 bg-white">
      {/* Author header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-rose-100 overflow-hidden flex items-center justify-center shrink-0">
            {profile?.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.displayName}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-rose-600 font-bold text-sm">{initials}</span>
            )}
          </div>

          {/* Name + meta */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-800 text-sm">
                {profile?.displayName ?? review.authorName}
              </p>
              {profile?.badge && (
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", profile.badge.bg, profile.badge.color)}>
                  {profile.badge.label}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              {profile?.homeCountry && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <span>{profile.homeFlag}</span>
                  {profile.homeCountry}
                </span>
              )}
              {profile?.homeCountry && review.monthVisited && (
                <span className="text-gray-300 text-xs">·</span>
              )}
              {review.monthVisited && (
                <span className="text-xs text-gray-400">{review.monthVisited}</span>
              )}
            </div>

            {/* Travel style tag */}
            {review.travelStyle && (
              <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium">
                {review.travelStyle}
              </span>
            )}
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-1 shrink-0">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-bold text-gray-800">{review.overallRating}/10</span>
        </div>
      </div>

      {/* Written review */}
      {review.writtenReview && (
        <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.writtenReview}</p>
      )}

      {/* Pros / Cons */}
      {(review.pros.length > 0 || review.cons.length > 0) && (
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50">
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
      )}
    </div>
  );
}
