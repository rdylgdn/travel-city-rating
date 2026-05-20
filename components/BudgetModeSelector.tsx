"use client";

import { BudgetMode } from "@/lib/types";
import { cn } from "@/lib/utils";

const modes: { value: BudgetMode; label: string }[] = [
  { value: "budget", label: "Budget" },
  { value: "midRange", label: "Mid-range" },
  { value: "luxury", label: "Luxury" },
];

type Props = {
  value: BudgetMode;
  onChange: (mode: BudgetMode) => void;
};

export default function BudgetModeSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          className={cn(
            "px-3 py-1 rounded-full text-sm font-medium transition-all",
            value === mode.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
