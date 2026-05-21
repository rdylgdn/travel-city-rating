"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, X, Trash2, Star, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

type Status = "pending" | "approved" | "rejected";
type ReviewRow = {
  id: string;
  city_slug: string;
  user_id: string;
  user_email: string | null;
  travel_style: string | null;
  month_visited: string | null;
  overall_rating: number;
  written_review: string | null;
  created_at: string;
  status: Status;
  city?: { name: string; slug: string };
  authorName: string;
  avatarUrl: string | null;
};

type Filter = "all" | Status;

const STATUS_STYLES: Record<Status, string> = {
  pending:  "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-500 border-red-200",
};

export default function AdminReviewsClient({ reviews: initial }: { reviews: ReviewRow[] }) {
  const supabase = createClient();
  const [reviews, setReviews] = useState<ReviewRow[]>(initial);
  const [filter, setFilter] = useState<Filter>("pending");
  const [loading, setLoading] = useState<string | null>(null);

  const counts = {
    all:      reviews.length,
    pending:  reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  async function updateStatus(id: string, status: Status) {
    setLoading(id + status);
    await supabase.from("reviews").update({ status }).eq("id", id);
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    setLoading(null);
  }

  async function deleteReview(id: string) {
    if (!confirm("Permanently delete this review?")) return;
    setLoading(id + "delete");
    await supabase.from("reviews").delete().eq("id", id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setLoading(null);
  }

  const filterTabs: { id: Filter; label: string }[] = [
    { id: "pending",  label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "all",      label: "All" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Review Moderation</h1>
        <p className="text-sm text-gray-400 mt-1">
          Approve or reject reviews before they appear publicly. Verified reviewers (10+ approved) bypass this queue.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-full p-1 w-fit">
        {filterTabs.map(({ id, label }) => (
          <button key={id} onClick={() => setFilter(id)}
            className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
              filter === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}>
            {label}
            {counts[id] > 0 && (
              <span className={cn("text-xs rounded-full px-1.5 py-0.5 font-bold",
                filter === id
                  ? id === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
                  : id === "pending" ? "bg-yellow-200 text-yellow-700" : "bg-gray-200 text-gray-600"
              )}>
                {counts[id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No {filter === "all" ? "" : filter} reviews.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((review) => (
          <div key={review.id}
            className={cn("border rounded-2xl p-4 bg-white", review.status === "pending" && "border-yellow-200 bg-yellow-50/20")}>

            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3 min-w-0">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-rose-100 overflow-hidden flex items-center justify-center shrink-0">
                  {review.avatarUrl ? (
                    <Image src={review.avatarUrl} alt={review.authorName} width={36} height={36} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-rose-600 font-bold text-xs">{review.authorName.slice(0,2).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm">{review.authorName}</p>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", STATUS_STYLES[review.status])}>
                      {review.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5 flex-wrap">
                    {review.city && (
                      <Link href={`/cities/${review.city.slug}`} target="_blank"
                        className="hover:text-rose-500 transition-colors flex items-center gap-1">
                        {review.city.name} <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                    {review.travel_style && <span>· {review.travel_style}</span>}
                    {review.month_visited && <span>· {review.month_visited}</span>}
                    <span>· {review.created_at?.slice(0, 10)}</span>
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center gap-1 shrink-0">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold text-gray-800">{review.overall_rating}/10</span>
              </div>
            </div>

            {/* Content */}
            {review.written_review && (
              <p className="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-3">{review.written_review}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              {review.status !== "approved" && (
                <button onClick={() => updateStatus(review.id, "approved")} disabled={loading === review.id + "approved"}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors">
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
              )}
              {review.status !== "rejected" && (
                <button onClick={() => updateStatus(review.id, "rejected")} disabled={loading === review.id + "rejected"}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors">
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
              )}
              {review.status === "approved" && (
                <button onClick={() => updateStatus(review.id, "pending")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 text-sm font-medium hover:bg-yellow-100 transition-colors">
                  Set pending
                </button>
              )}
              <button onClick={() => deleteReview(review.id)} disabled={loading === review.id + "delete"}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 text-red-400 text-sm transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
