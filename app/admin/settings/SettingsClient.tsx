"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

type Row = { key: string; value: string; label: string | null; description: string | null };

const GROUPS: { title: string; keys: string[] }[] = [
  {
    title: "Scoring",
    keys: ["seed_weight_enabled"],
  },
  {
    title: "Ratings & Reviews",
    keys: ["anonymous_ratings_enabled", "guest_review_gate", "review_images_enabled"],
  },
  {
    title: "Discovery & Social",
    keys: ["recommendations_enabled", "compare_feature_enabled"],
  },
  {
    title: "City Page",
    keys: ["best_time_chart_enabled", "gallery_enabled", "budget_mode_selector"],
  },
  {
    title: "Features",
    keys: ["trip_planner_enabled", "suggest_city_enabled"],
  },
];

const NUMBER_KEYS = ["compare_guest_limit"];

export default function SettingsClient({ initialRows }: { initialRows: Row[] }) {
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const map = Object.fromEntries(rows.map((r) => [r.key, r]));

  async function toggle(key: string) {
    const current = map[key]?.value === "true";
    const next = (!current).toString();
    setRows((prev) => prev.map((r) => r.key === key ? { ...r, value: next } : r));
    setSaving(key);
    await supabase.from("platform_settings").update({ value: next, updated_at: new Date().toISOString() }).eq("key", key);
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 1500);
  }

  async function updateNumber(key: string, val: string) {
    setRows((prev) => prev.map((r) => r.key === key ? { ...r, value: val } : r));
    await supabase.from("platform_settings").update({ value: val, updated_at: new Date().toISOString() }).eq("key", key);
    setSaved(key);
    setTimeout(() => setSaved(null), 1500);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Toggle features on and off. Changes apply immediately.</p>
      </div>

      {GROUPS.map((group) => (
        <div key={group.title}>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{group.title}</h2>
          <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50">
            {group.keys.map((key) => {
              const row = map[key];
              if (!row) return null;
              const isNumber = NUMBER_KEYS.includes(key);
              const isOn = row.value === "true";
              const isSaving = saving === key;
              const isSaved = saved === key;

              return (
                <div key={key} className="flex items-center justify-between px-4 py-4 gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{row.label ?? key}</p>
                    {row.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{row.description}</p>
                    )}
                    {key === "seed_weight_enabled" && (
                      <p className={cn("text-xs mt-1 font-medium", isOn ? "text-green-600" : "text-orange-500")}>
                        {isOn
                          ? "ON — scores start with 100-review baseline (new cities look good from day 1)"
                          : "OFF — scores reflect real reviews only (may show 0 for new cities)"}
                      </p>
                    )}
                  </div>

                  {isNumber ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number" min={1} max={10} value={row.value}
                        onChange={(e) => updateNumber(key, e.target.value)}
                        className="w-16 text-center px-2 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                      {isSaved && <span className="text-xs text-green-500">Saved</span>}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      {isSaved && <span className="text-xs text-green-500">Saved</span>}
                      <button
                        onClick={() => toggle(key)}
                        disabled={isSaving}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                          isOn ? "bg-green-500" : "bg-gray-200",
                          isSaving && "opacity-60"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                          isOn ? "translate-x-6" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
