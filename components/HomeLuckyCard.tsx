"use client";

import { useRouter } from "next/navigation";
import { Shuffle, Sparkles } from "lucide-react";

export default function HomeLuckyCard({ citySlugs }: { citySlugs: string[] }) {
  const router = useRouter();

  function pickRandom() {
    if (citySlugs.length === 0) return;
    const slug = citySlugs[Math.floor(Math.random() * citySlugs.length)];
    router.push(`/cities/${slug}`);
  }

  return (
    <div
      className="rounded-3xl p-6 flex flex-col gap-4 transition-all hover:-translate-y-1"
      style={{
        background: "linear-gradient(135deg, #ECFDF5 0%, #DEFAF1 100%)",
        border: "1px solid #4ADE8033",
        boxShadow: "0 4px 16px rgba(74,222,128,0.10)",
      }}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4" style={{ color: "#4ADE80" }} />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#4ADE80" }}>
          Spin the globe
        </span>
      </div>
      <div>
        <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>
          Feeling Lucky?
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Let chance pick your next destination. Discover a random city from our entire collection — your unexpected next trip might be one click away.
        </p>
      </div>
      <button
        onClick={pickRandom}
        className="mt-auto inline-flex items-center gap-2 justify-center w-fit px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
        style={{ background: "#4ADE80", color: "#fff", boxShadow: "0 2px 8px rgba(74,222,128,0.3)" }}
      >
        <Shuffle className="w-4 h-4" />
        Surprise me!
      </button>
    </div>
  );
}
