"use client";

import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  isSaved: boolean;
  loading?: boolean;
  onToggle: (e: React.MouseEvent) => void;
  className?: string;
};

export default function SaveButton({ isSaved, loading, onToggle, className }: Props) {
  return (
    <button
      onClick={onToggle}
      title={isSaved ? "Remove from saved" : "Save city"}
      className={cn(
        "p-2 rounded-full transition-all shadow-sm",
        loading && "opacity-0 pointer-events-none",
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
