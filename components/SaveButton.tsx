"use client";

import { Bookmark } from "lucide-react";
import { useSavedCities } from "@/hooks/useSavedCities";
import { cn } from "@/lib/utils";

type Props = {
  citySlug: string;
  onNeedAuth?: () => void;
  className?: string;
};

export default function SaveButton({ citySlug, onNeedAuth, className }: Props) {
  const { savedSlugs, toggle, loading } = useSavedCities();
  const isSaved = savedSlugs.has(citySlug);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggle(citySlug);
    if (result === "unauthenticated") onNeedAuth?.();
  }

  if (loading) return null;

  return (
    <button
      onClick={handleClick}
      title={isSaved ? "Remove from saved" : "Save city"}
      className={cn(
        "p-2 rounded-full transition-all",
        isSaved
          ? "bg-rose-500 text-white hover:bg-rose-600"
          : "bg-white/90 text-gray-400 hover:text-rose-500 hover:bg-white",
        className
      )}
    >
      <Bookmark className={cn("w-4 h-4", isSaved && "fill-white")} />
    </button>
  );
}
