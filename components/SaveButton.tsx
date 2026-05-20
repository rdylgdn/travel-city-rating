"use client";

import { Bookmark } from "lucide-react";
import { useSavedCities } from "@/hooks/useSavedCities";
import { BudgetMode } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  citySlug: string;
  budgetMode?: BudgetMode;
  onNeedAuth?: () => void;
  className?: string;
};

export default function SaveButton({ citySlug, budgetMode = "budget", onNeedAuth, className }: Props) {
  const { saved, toggle, loading } = useSavedCities();
  const isSaved = saved.has(citySlug);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggle(citySlug, budgetMode);
    if (result === "unauthenticated") onNeedAuth?.();
  }

  return (
    <button
      onClick={handleClick}
      title={isSaved ? "Remove from saved" : "Save city"}
      className={cn(
        "p-2 rounded-full transition-all",
        loading && "opacity-0 pointer-events-none",
        isSaved
          ? "bg-rose-500 text-white hover:bg-rose-600 shadow-sm"
          : "bg-white/90 text-gray-400 hover:text-rose-500 hover:bg-white shadow-sm",
        className
      )}
    >
      <Bookmark className={cn("w-4 h-4", isSaved && "fill-white")} />
    </button>
  );
}
