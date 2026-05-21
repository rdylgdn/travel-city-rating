"use client";

import { useState } from "react";
import { MonthData } from "@/lib/types";
import { cn } from "@/lib/utils";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function weatherColor(score: number) {
  if (score >= 8) return "bg-green-400";
  if (score >= 6) return "bg-yellow-400";
  if (score >= 4) return "bg-orange-400";
  return "bg-blue-400";
}

function crowdColor(level: MonthData["crowds"]) {
  if (level === "Low") return "text-green-600 bg-green-50";
  if (level === "Medium") return "text-yellow-600 bg-yellow-50";
  return "text-red-500 bg-red-50";
}

function costColor(level: MonthData["costLevel"]) {
  if (level === "Cheaper") return "text-green-600";
  if (level === "Normal") return "text-gray-500";
  return "text-orange-500";
}

type Props = {
  monthlyData: Record<string, MonthData>;
};

export default function BestTimeChart({ monthlyData }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const hoveredData = hovered ? monthlyData[hovered] : null;

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">Best time to visit</h2>

      {/* Month grid */}
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 mb-3">
        {MONTHS.map((month) => {
          const data = monthlyData[month];
          if (!data) return null;
          return (
            <button
              key={month}
              onMouseEnter={() => setHovered(month)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setHovered(hovered === month ? null : month)}
              className={cn(
                "flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all cursor-pointer",
                hovered === month
                  ? "border-rose-400 bg-rose-50 shadow-sm"
                  : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
              )}
            >
              <span className="text-[10px] font-semibold text-gray-500">{month}</span>
              {/* Weather bar */}
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={cn("h-1.5 rounded-full", weatherColor(data.weather))}
                  style={{ width: `${data.weather * 10}%` }}
                />
              </div>
              {/* Crowd dot */}
              <div className={cn(
                "w-2 h-2 rounded-full",
                data.crowds === "Low" ? "bg-green-400" :
                data.crowds === "Medium" ? "bg-yellow-400" : "bg-red-400"
              )} />
            </button>
          );
        })}
      </div>

      {/* Detail card on hover/click */}
      {hoveredData && hovered && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-wrap gap-4 items-start">
          <div>
            <p className="font-bold text-gray-800">{hovered}</p>
            {hoveredData.note && <p className="text-sm text-gray-500 mt-0.5">{hoveredData.note}</p>}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className={cn("w-2.5 h-2.5 rounded-full", weatherColor(hoveredData.weather))} />
              <span className="text-sm text-gray-600">Weather {hoveredData.weather}/10</span>
            </div>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", crowdColor(hoveredData.crowds))}>
              {hoveredData.crowds} crowds
            </span>
            <span className={cn("text-sm font-medium", costColor(hoveredData.costLevel))}>
              {hoveredData.costLevel === "Cheaper" ? "↓ Cheaper" :
               hoveredData.costLevel === "Pricier" ? "↑ Pricier" : "Normal prices"}
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        <span className="text-xs text-gray-400">Weather:</span>
        {[["bg-green-400","Great"],["bg-yellow-400","Good"],["bg-orange-400","Fair"],["bg-blue-400","Cold/Wet"]].map(([color, label]) => (
          <span key={label} className="flex items-center gap-1 text-xs text-gray-400">
            <span className={cn("w-2.5 h-2.5 rounded-full", color)} />{label}
          </span>
        ))}
        <span className="text-xs text-gray-400 ml-2">Crowd dot:</span>
        {[["bg-green-400","Low"],["bg-yellow-400","Medium"],["bg-red-400","High"]].map(([color, label]) => (
          <span key={label} className="flex items-center gap-1 text-xs text-gray-400">
            <span className={cn("w-2 h-2 rounded-full", color)} />{label}
          </span>
        ))}
      </div>
    </div>
  );
}
