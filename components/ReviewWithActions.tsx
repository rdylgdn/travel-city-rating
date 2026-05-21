"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import ReviewCard, { ReviewProfile } from "./ReviewCard";
import ReviewForm, { ExistingReview } from "./ReviewForm";
import { Review } from "@/lib/types";

type RawReview = Review & {
  updatedAt?: string;
  rawData?: Record<string, unknown>;
};

type Props = {
  review: RawReview;
  profile?: ReviewProfile;
  citySlug: string;
  userId: string;
  userEmail: string;
};

export default function ReviewWithActions({ review, profile, citySlug, userId, userEmail }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"view" | "edit" | "confirmDelete">("view");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await supabase.from("reviews").delete().eq("id", review.id).eq("user_id", userId);
    setDeleting(false);
    router.refresh();
  }

  if (mode === "edit") {
    const existing: ExistingReview = {
      travelStyle: review.travelStyle,
      budgetCategory: review.budgetCategory,
      monthVisited: review.monthVisited,
      overallRating: review.overallRating,
      writtenReview: review.writtenReview,
      pros: review.pros,
      cons: review.cons,
      imageUrls: review.imageUrls ?? [],
      categoryScores: review.rawData ? {
        score_cost_value: review.rawData.score_cost_value as number,
        score_safety: review.rawData.score_safety as number,
        score_food: review.rawData.score_food as number,
        score_culture: review.rawData.score_culture as number,
        score_nature: review.rawData.score_nature as number,
        score_nightlife: review.rawData.score_nightlife as number,
        score_ease_of_travel: review.rawData.score_ease_of_travel as number,
      } : {},
    };

    return (
      <div>
        <ReviewForm
          citySlug={citySlug}
          userEmail={userEmail}
          userId={userId}
          existingReview={existing}
          onSuccess={() => { setMode("view"); router.refresh(); }}
        />
        <button onClick={() => setMode("view")} className="mt-2 text-xs text-gray-400 hover:text-gray-600">
          Cancel edit
        </button>
      </div>
    );
  }

  if (mode === "confirmDelete") {
    return (
      <div className="border border-red-200 bg-red-50 rounded-2xl p-4">
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700 text-sm">Delete this review?</p>
            <p className="text-xs text-red-500 mt-0.5">This can't be undone. Your scores will be removed from this city's ratings.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDelete} disabled={deleting}
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors">
            {deleting ? "Deleting…" : "Yes, delete"}
          </button>
          <button onClick={() => setMode("view")}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <ReviewCard
      review={review}
      profile={profile}
      isOwn
      onEdit={() => setMode("edit")}
      onDelete={() => setMode("confirmDelete")}
    />
  );
}
