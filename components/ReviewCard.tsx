import Image from "next/image";
import Link from "next/link";
import { Star, Pencil, Trash2 } from "lucide-react";
import { Review } from "@/lib/types";
import { TravelerBadge } from "@/lib/profile";
import { cn } from "@/lib/utils";
import ReviewAuthorFollow from "./ReviewAuthorFollow";

export type ReviewProfile = {
  displayName: string;
  avatarUrl: string | null;
  homeCountry: string | null;
  homeFlag: string | null;
  travelStyles: string[];
  badge: TravelerBadge;
  role?: "user" | "verified" | "admin";
};

function ConditionalLink({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return <>{children}</>;
  return <Link href={href}>{children}</Link>;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

type Props = {
  review: Review & { updatedAt?: string };
  profile?: ReviewProfile;
  reviewUserId?: string;
  isOwn?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onImageClick?: (index: number) => void;
};

export default function ReviewCard({ review, profile, reviewUserId, isOwn, onEdit, onDelete, onImageClick }: Props) {
  const initials = (profile?.displayName ?? review.authorName).slice(0, 2).toUpperCase();
  const profileHref = reviewUserId ? `/u/${reviewUserId}` : undefined;
  const wasEdited = review.updatedAt && review.createdAt &&
    new Date(review.updatedAt).getTime() - new Date(review.createdAt).getTime() > 5000;

  return (
    <div className={cn("border rounded-2xl p-4 bg-white", isOwn ? "border-rose-200 bg-rose-50/30" : "border-gray-100")}>
      {/* Author header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Avatar */}
          <ConditionalLink href={profileHref}>
            <div className="w-10 h-10 rounded-full bg-rose-100 overflow-hidden flex items-center justify-center shrink-0 hover:ring-2 hover:ring-rose-300 transition-all">
              {profile?.avatarUrl ? (
                <Image src={profile.avatarUrl} alt={profile.displayName} width={40} height={40} className="object-cover w-full h-full" />
              ) : (
                <span className="text-rose-600 font-bold text-sm">{initials}</span>
              )}
            </div>
          </ConditionalLink>

          {/* Name + meta */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <ConditionalLink href={profileHref}>
                <p className="font-semibold text-gray-800 text-sm hover:text-rose-500 transition-colors">
                  {profile?.displayName ?? review.authorName}
                </p>
              </ConditionalLink>
              {isOwn && <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full font-medium">You</span>}
              {profile?.badge && (
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", profile.badge.bg, profile.badge.color)}>
                  {profile.badge.label}
                </span>
              )}
              {profile?.role === "admin" && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  Admin
                </span>
              )}
              {profile?.role === "verified" && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  ✓ Verified
                </span>
              )}
              {!isOwn && reviewUserId && <ReviewAuthorFollow targetUserId={reviewUserId} />}
            </div>

            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              {profile?.homeCountry && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <span>{profile.homeFlag}</span>{profile.homeCountry}
                </span>
              )}
              {profile?.homeCountry && review.monthVisited && <span className="text-gray-300 text-xs">·</span>}
              {review.monthVisited && <span className="text-xs text-gray-400">{review.monthVisited}</span>}
            </div>

            {review.travelStyle && (
              <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium">
                {review.travelStyle}
              </span>
            )}
          </div>
        </div>

        {/* Score + actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-bold text-gray-800">{review.overallRating}/10</span>
          </div>
          {isOwn && (
            <div className="flex items-center gap-1 ml-1">
              {onEdit && (
                <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-rose-100 transition-colors" title="Edit review">
                  <Pencil className="w-3.5 h-3.5 text-rose-400" />
                </button>
              )}
              {onDelete && (
                <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete review">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Written review */}
      {review.writtenReview && (
        <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.writtenReview}</p>
      )}

      {/* Pros / Cons */}
      {(review.pros.length > 0 || review.cons.length > 0) && (
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
          {review.pros.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-600 mb-1">Pros</p>
              <ul className="space-y-0.5">
                {review.pros.map((pro) => (
                  <li key={pro} className="text-xs text-gray-600 flex gap-1"><span className="text-green-500 mt-0.5">+</span> {pro}</li>
                ))}
              </ul>
            </div>
          )}
          {review.cons.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-500 mb-1">Cons</p>
              <ul className="space-y-0.5">
                {review.cons.map((con) => (
                  <li key={con} className="text-xs text-gray-600 flex gap-1"><span className="text-red-400 mt-0.5">−</span> {con}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Review images */}
      {review.imageUrls && review.imageUrls.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-gray-50">
          {review.imageUrls.map((url, i) => (
            <button key={i} onClick={() => onImageClick?.(i)} className="relative w-16 h-16 rounded-xl overflow-hidden group border border-gray-100">
              <Image src={url} alt="Review photo" fill className="object-cover group-hover:scale-105 transition-transform duration-200" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      {/* Dates */}
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-50">
        {review.createdAt && (
          <span className="text-xs text-gray-400">Posted {formatDate(review.createdAt)}</span>
        )}
        {wasEdited && review.updatedAt && (
          <span className="text-xs text-gray-400">· Edited {formatDate(review.updatedAt)}</span>
        )}
      </div>
    </div>
  );
}
