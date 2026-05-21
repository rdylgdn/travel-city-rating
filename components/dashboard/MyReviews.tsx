"use client";

import Link from "next/link";
import { Review } from "@/lib/types";
import { cities } from "@/lib/seed-data";
import ReviewWithActions from "@/components/ReviewWithActions";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function MyReviews({ reviews }: { reviews: Review[] }) {
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? "");
      setUserEmail(data.user?.email ?? "");
    });
  }, []);

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
          <div key={review.id}>
            {city && (
              <Link href={`/cities/${city.slug}`} className="inline-block text-sm font-semibold text-gray-500 hover:text-rose-500 transition-colors mb-2">
                {city.name}, {city.country} →
              </Link>
            )}
            <ReviewWithActions
              review={review}
              citySlug={city?.slug ?? ""}
              userId={userId}
              userEmail={userEmail}
            />
          </div>
        );
      })}
    </div>
  );
}
