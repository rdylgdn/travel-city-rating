"use client";

import { useState } from "react";
import { Users, Star, Lock } from "lucide-react";
import AuthModal from "./AuthModal";

type Props = {
  reviewCount: number;
};

export default function ReviewsGate({ reviewCount }: Props) {
  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  function open(m: "signin" | "signup") {
    setMode(m);
    setShowAuth(true);
  }

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden border border-gray-100">
        {/* Blurred preview rows */}
        <div className="blur-sm pointer-events-none select-none p-4 space-y-3">
          {[...Array(Math.min(reviewCount, 2))].map((_, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 bg-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-100" />
                <div className="space-y-1.5">
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                  <div className="h-2.5 w-16 bg-gray-100 rounded" />
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                  <div className="h-3 w-8 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-2.5 w-full bg-gray-100 rounded" />
                <div className="h-2.5 w-4/5 bg-gray-100 rounded" />
                <div className="h-2.5 w-3/5 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Gradient overlay + CTA */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent flex flex-col items-center justify-end pb-6 px-4">
          <div className="text-center max-w-sm">
            <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1">
              {reviewCount} traveler {reviewCount === 1 ? "review" : "reviews"} inside
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Sign in to read real experiences from travelers who've been there.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => open("signin")}
                className="px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors"
              >
                Sign in
              </button>
              <button
                onClick={() => open("signup")}
                className="px-5 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:border-rose-300 hover:text-rose-500 transition-colors"
              >
                Create account
              </button>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <Users className="w-3.5 h-3.5 text-gray-300" />
              <p className="text-xs text-gray-400">Free · No credit card required</p>
            </div>
          </div>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultMode={mode} />}
    </>
  );
}
