"use client";

import { useState, useCallback } from "react";
import { X, Loader2, Sparkles, ChevronRight, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { AdminCityRow } from "@/lib/admin-cities";
import { Region, TravelStyle } from "@/lib/types";
import { MonthData } from "@/lib/types";
import { COUNTRIES } from "@/lib/countries";
import { COUNTRY_TO_REGION, COUNTRY_ISO_NUMERIC } from "@/lib/country-region-map";
import { cn } from "@/lib/utils";

const REGIONS: Region[] = ["Southeast Asia","East Asia","South Asia","Europe","Middle East","Africa","North America","South America","Oceania"];
const TRAVEL_STYLES: TravelStyle[] = ["Solo","Couple","Honeymoon","Friends","Family","Backpacking","Adventure","Culture","Nature","Food","Nightlife","Beach","Digital Nomad","Luxury"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const BREAKDOWN_KEYS = ["accommodation","food","transport","activities","extras"] as const;
type BreakdownKey = typeof BREAKDOWN_KEYS[number];
type BudgetTier = "budget" | "midRange" | "luxury";
type Breakdowns = Record<BudgetTier, Record<BreakdownKey, number>>;

const DEFAULT_BREAKDOWNS: Breakdowns = {
  budget:   { accommodation: 15, food: 10, transport: 5,  activities: 8,  extras: 7  },
  midRange: { accommodation: 35, food: 20, transport: 10, activities: 15, extras: 10 },
  luxury:   { accommodation: 80, food: 40, transport: 20, activities: 30, extras: 20 },
};

const SCORE_FIELDS = [
  { key: "score_overall",        label: "Overall" },
  { key: "score_cost_value",     label: "Cost / Value" },
  { key: "score_safety",         label: "Safety" },
  { key: "score_food",           label: "Food" },
  { key: "score_culture",        label: "Culture" },
  { key: "score_nature",         label: "Nature" },
  { key: "score_nightlife",      label: "Nightlife" },
  { key: "score_ease_of_travel", label: "Ease of Travel" },
] as const;

function defaultMonthly(): Record<string, MonthData> {
  return Object.fromEntries(MONTHS.map((m) => [m, { weather: 7, crowds: "Medium" as const, costLevel: "Normal" as const, note: "" }]));
}

function tierSum(bd: Record<BreakdownKey, number>) {
  return BREAKDOWN_KEYS.reduce((s, k) => s + (bd[k] || 0), 0);
}

type Tab = "basic" | "content" | "scores" | "budget" | "seasonal";
const TABS: { id: Tab; label: string }[] = [
  { id: "basic",    label: "Basic info" },
  { id: "content",  label: "Content" },
  { id: "scores",   label: "Scores" },
  { id: "budget",   label: "Budget" },
  { id: "seasonal", label: "Best time" },
];

type Props = {
  existing: AdminCityRow | null;
  isSeedEdit?: boolean;
  onClose: () => void;
  onSaved: (row: AdminCityRow) => void;
};

export default function CityFormModal({ existing, isSeedEdit, onClose, onSaved }: Props) {
  const supabase = createClient();
  const isEdit = !!existing;
  const [tab, setTab] = useState<Tab>("basic");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Basic
  const [name, setName] = useState(existing?.name ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [countrySearch, setCountrySearch] = useState(existing?.country ?? "");
  const [selectedIso2, setSelectedIso2] = useState("");
  const [region, setRegion] = useState<Region>((existing?.region as Region) ?? "Europe");
  const [countryIso, setCountryIso] = useState(existing?.country_iso ?? "");
  const [imageUrl, setImageUrl] = useState(existing?.image_url ?? "");
  const [bestSeason, setBestSeason] = useState(existing?.best_season ?? "");
  const [bestFor, setBestFor] = useState<TravelStyle[]>((existing?.best_for as TravelStyle[]) ?? []);

  // Content
  const [summary, setSummary] = useState(existing?.summary ?? "");
  const [whyVisit, setWhyVisit] = useState(existing?.why_visit ?? "");
  const [bestAreas, setBestAreas] = useState((existing?.best_areas ?? []).join("\n"));
  const [thingsToDo, setThingsToDo] = useState((existing?.best_things_to_do ?? []).join("\n"));
  const [complaints, setComplaints] = useState((existing?.common_complaints ?? []).join("\n"));

  // Scores
  const [scores, setScores] = useState<Record<string, number>>({
    score_overall: existing?.score_overall ?? 7.0,
    score_cost_value: existing?.score_cost_value ?? 7.0,
    score_safety: existing?.score_safety ?? 7.0,
    score_food: existing?.score_food ?? 7.0,
    score_culture: existing?.score_culture ?? 7.0,
    score_nature: existing?.score_nature ?? 7.0,
    score_nightlife: existing?.score_nightlife ?? 7.0,
    score_ease_of_travel: existing?.score_ease_of_travel ?? 7.0,
  });

  // Budget — per-tier breakdowns
  const existingBd = (existing as AdminCityRow & { budget_breakdowns?: Breakdowns })?.budget_breakdowns;
  const [breakdowns, setBreakdowns] = useState<Breakdowns>(existingBd ?? DEFAULT_BREAKDOWNS);

  // Seasonal
  const [monthlyData, setMonthlyData] = useState<Record<string, MonthData>>(
    (existing?.monthly_data as Record<string, MonthData> | null | undefined) ?? defaultMonthly()
  );

  // Country search
  const filteredCountries = countrySearch.trim()
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(countrySearch.toLowerCase())).slice(0, 8)
    : [];
  const showDrop = countrySearch.trim() !== "" && countrySearch !== (COUNTRIES.find((c) => c.iso2 === selectedIso2)?.name ?? "");

  function pickCountry(cname: string, iso2: string) {
    setCountrySearch(cname);
    setSelectedIso2(iso2);
    const r = COUNTRY_TO_REGION[iso2];
    if (r) setRegion(r);
    const num = COUNTRY_ISO_NUMERIC[iso2];
    if (num) setCountryIso(num);
  }

  function setScore(key: string, val: number) {
    setScores((p) => ({ ...p, [key]: Math.min(10, Math.max(0, Math.round(val * 10) / 10)) }));
  }

  function setBreakdown(tier: BudgetTier, key: BreakdownKey, val: number) {
    setBreakdowns((p) => ({ ...p, [tier]: { ...p[tier], [key]: Math.max(0, val) } }));
  }

  function updateMonth(month: string, field: keyof MonthData, value: unknown) {
    setMonthlyData((p) => ({ ...p, [month]: { ...p[month], [field]: value } }));
  }

  // Tab completion indicators
  const completions: Record<Tab, boolean> = {
    basic:    !!(name && countrySearch),
    content:  !!(summary),
    scores:   Object.values(scores).some((v) => v !== 7.0),
    budget:   BREAKDOWN_KEYS.some((k) => breakdowns.budget[k] !== DEFAULT_BREAKDOWNS.budget[k]),
    seasonal: true,
  };

  // AI fill
  async function aiFill(type: string) {
    if (!name || !countrySearch) { setError("Enter city name and country in Basic info first."); setTab("basic"); return; }
    setAiLoading(type);
    setError(null);
    try {
      const res = await fetch("/api/admin/ai-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityName: name, country: countrySearch, type }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }

      if (type === "content") {
        if (data.summary)         setSummary(data.summary);
        if (data.whyVisit)        setWhyVisit(data.whyVisit);
        if (data.bestAreas)       setBestAreas(data.bestAreas.join("\n"));
        if (data.bestThingsToDo)  setThingsToDo(data.bestThingsToDo.join("\n"));
        if (data.commonComplaints) setComplaints(data.commonComplaints.join("\n"));
      } else if (type === "scores") {
        const map: Record<string, string> = {
          overall: "score_overall", costValue: "score_cost_value", safety: "score_safety",
          food: "score_food", culture: "score_culture", nature: "score_nature",
          nightlife: "score_nightlife", easeOfTravel: "score_ease_of_travel",
        };
        setScores((prev) => {
          const next = { ...prev };
          for (const [k, dbKey] of Object.entries(map)) {
            if (data[k] !== undefined) next[dbKey] = Math.min(10, Math.max(0, parseFloat(data[k]) || 7));
          }
          return next;
        });
      } else if (type === "budget") {
        if (data.budget && data.midRange && data.luxury) {
          setBreakdowns({
            budget:   { ...DEFAULT_BREAKDOWNS.budget,   ...data.budget },
            midRange: { ...DEFAULT_BREAKDOWNS.midRange, ...data.midRange },
            luxury:   { ...DEFAULT_BREAKDOWNS.luxury,   ...data.luxury },
          });
        }
      } else if (type === "seasonal") {
        const updated: Record<string, MonthData> = { ...defaultMonthly() };
        for (const m of MONTHS) {
          if (data[m]) updated[m] = { weather: data[m].weather ?? 7, crowds: data[m].crowds ?? "Medium", costLevel: data[m].costLevel ?? "Normal", note: data[m].note ?? "" };
        }
        setMonthlyData(updated);
      } else if (type === "image") {
        if (data.imageUrl) setImageUrl(data.imageUrl);
      }
    } catch (e) { setError(String(e)); }
    finally { setAiLoading(null); }
  }

  async function handleSubmit() {
    setError(null);
    if (!name || !slug || !countrySearch) { setError("Name, slug and country are required."); setTab("basic"); return; }
    setSaving(true);
    const payload = {
      slug, name, country: countrySearch, country_iso: countryIso, region,
      image_url: imageUrl, summary, why_visit: whyVisit, best_season: bestSeason,
      best_for: bestFor,
      best_areas: bestAreas.split("\n").map((s) => s.trim()).filter(Boolean),
      best_things_to_do: thingsToDo.split("\n").map((s) => s.trim()).filter(Boolean),
      common_complaints: complaints.split("\n").map((s) => s.trim()).filter(Boolean),
      ...Object.fromEntries(SCORE_FIELDS.map(({ key }) => [key, scores[key] ?? 7.0])),
      // Keep legacy columns populated with computed totals
      budget_budget:   tierSum(breakdowns.budget),
      budget_mid_range: tierSum(breakdowns.midRange),
      budget_luxury:   tierSum(breakdowns.luxury),
      breakdown_accommodation: breakdowns.budget.accommodation,
      breakdown_food:          breakdowns.budget.food,
      breakdown_transport:     breakdowns.budget.transport,
      breakdown_activities:    breakdowns.budget.activities,
      breakdown_extras:        breakdowns.budget.extras,
      budget_breakdowns: breakdowns,
      monthly_data: monthlyData,
      is_published: true,
      updated_at: new Date().toISOString(),
    };

    let row: AdminCityRow | null = null;
    if (isEdit && !isSeedEdit) {
      const { data, error: err } = await supabase.from("admin_cities").update(payload).eq("id", existing!.id).select().single();
      if (err) { setError(err.message); setSaving(false); return; }
      row = data;
    } else {
      const { data, error: err } = await supabase.from("admin_cities").upsert(payload, { onConflict: "slug" }).select().single();
      if (err) { setError(err.message); setSaving(false); return; }
      row = data;
    }
    setSaving(false);
    if (row) onSaved(row);
  }

  const tabIdx = TABS.findIndex((t) => t.id === tab);
  const hasNext = tabIdx < TABS.length - 1;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-4 sm:inset-10 z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-gray-900">
            {isSeedEdit ? `Edit: ${existing?.name}` : isEdit ? `Edit: ${existing?.name}` : "Add new city"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-400" /></button>
        </div>

        {/* Tabs with completion dots */}
        <div className="flex border-b border-gray-100 shrink-0 overflow-x-auto">
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={cn("flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                tab === id ? "border-rose-500 text-rose-600" : "border-transparent text-gray-500 hover:text-gray-700"
              )}>
              <span className={cn("w-2 h-2 rounded-full shrink-0",
                completions[id] ? "bg-green-400" : "bg-gray-200"
              )} />
              {label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && <div className="mx-5 mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-600 shrink-0">{error}</div>}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── BASIC INFO ── */}
          {tab === "basic" && (
            <div className="space-y-4 max-w-lg">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">City name *</label>
                  <input value={name} onChange={(e) => { setName(e.target.value); if (!isEdit) setSlug(e.target.value.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"")); }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Slug *</label>
                  <input value={slug} onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-semibold text-gray-500 block mb-1">Country *</label>
                <input value={countrySearch} onChange={(e) => { setCountrySearch(e.target.value); setSelectedIso2(""); }}
                  placeholder="Search country…"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                {showDrop && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 max-h-48 overflow-y-auto">
                    {filteredCountries.map((c) => (
                      <button key={c.iso2} type="button" onClick={() => pickCountry(c.name, c.iso2)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left text-sm">
                        <span>{c.flag}</span><span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Region (auto)</label>
                  <select value={region} onChange={(e) => setRegion(e.target.value as Region)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-400">
                    {REGIONS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Best season</label>
                  <input value={bestSeason} onChange={(e) => setBestSeason(e.target.value)} placeholder="e.g. Apr–Jun"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
              </div>

              {/* Image URL with auto-fetch */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Image URL</label>
                <div className="flex gap-2">
                  <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... (or leave empty to auto-fetch)"
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                  <button type="button" onClick={() => aiFill("image")} disabled={aiLoading === "image" || !name}
                    title="Auto-fetch image from internet"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 disabled:opacity-40 transition-colors whitespace-nowrap">
                    {aiLoading === "image" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                    Find image
                  </button>
                </div>
                {imageUrl && (
                  <img src={imageUrl} alt="preview" className="mt-2 h-20 w-full object-cover rounded-xl opacity-80" onError={(e) => (e.currentTarget.style.display = "none")} />
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-2">Best for</label>
                <div className="flex flex-wrap gap-1.5">
                  {TRAVEL_STYLES.map((s) => (
                    <button type="button" key={s} onClick={() => setBestFor((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s])}
                      className={cn("px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                        bestFor.includes(s) ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
                      )}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── CONTENT ── */}
          {tab === "content" && (
            <div className="space-y-4 max-w-lg">
              <AiFillButton onClick={() => aiFill("content")} loading={aiLoading === "content"} disabled={!name || !countrySearch} />
              {[
                { label: "Summary (one sentence)", value: summary, set: setSummary, rows: 2 },
                { label: "Why visit?", value: whyVisit, set: setWhyVisit, rows: 3 },
                { label: "Best areas (one per line)", value: bestAreas, set: setBestAreas, rows: 4 },
                { label: "Top things to do (one per line)", value: thingsToDo, set: setThingsToDo, rows: 5 },
                { label: "Common complaints (one per line)", value: complaints, set: setComplaints, rows: 3 },
              ].map(({ label, value, set, rows }) => (
                <div key={label}>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">{label}</label>
                  <textarea value={value} onChange={(e) => set(e.target.value)} rows={rows}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
                </div>
              ))}
            </div>
          )}

          {/* ── SCORES ── */}
          {tab === "scores" && (
            <div className="space-y-3 max-w-sm">
              <AiFillButton onClick={() => aiFill("scores")} loading={aiLoading === "scores"} disabled={!name || !countrySearch} />
              {SCORE_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="text-sm text-gray-600 w-32 shrink-0">{label}</label>
                  <input type="number" min={0} max={10} step={0.1} value={scores[key] ?? 7.0}
                    onChange={(e) => setScore(key, parseFloat(e.target.value) || 0)}
                    className="w-20 px-3 py-1.5 rounded-xl border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-rose-400" />
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-rose-400 transition-all" style={{ width: `${((scores[key] ?? 7) / 10) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-7 text-right">{(scores[key] ?? 7.0).toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── BUDGET ── */}
          {tab === "budget" && (
            <div className="space-y-4">
              <AiFillButton onClick={() => aiFill("budget")} loading={aiLoading === "budget"} disabled={!name || !countrySearch} />
              <p className="text-xs text-gray-400">Enter the breakdown for each budget tier. Daily totals are calculated automatically.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Category</th>
                      <th className="py-2 px-3 text-center text-xs font-semibold text-green-600">Budget</th>
                      <th className="py-2 px-3 text-center text-xs font-semibold text-blue-600">Mid-range</th>
                      <th className="py-2 px-3 text-center text-xs font-semibold text-purple-600">Luxury</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {BREAKDOWN_KEYS.map((key) => (
                      <tr key={key} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 text-gray-600 capitalize font-medium">{key}</td>
                        {(["budget","midRange","luxury"] as BudgetTier[]).map((tier) => (
                          <td key={tier} className="py-2.5 px-3">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-gray-400 text-xs">$</span>
                              <input type="number" min={0} value={breakdowns[tier][key]}
                                onChange={(e) => setBreakdown(tier, key, parseInt(e.target.value) || 0)}
                                className="w-16 text-center px-2 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-gray-50">
                      <td className="py-2.5 px-3 text-xs font-bold text-gray-700">Daily total</td>
                      {(["budget","midRange","luxury"] as BudgetTier[]).map((tier) => (
                        <td key={tier} className="py-2.5 px-3 text-center">
                          <span className="font-bold text-gray-800">${tierSum(breakdowns[tier])}</span>
                          <span className="text-gray-400 text-xs">/day</span>
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ── BEST TIME / SEASONAL ── */}
          {tab === "seasonal" && (
            <div className="space-y-4">
              <AiFillButton onClick={() => aiFill("seasonal")} loading={aiLoading === "seasonal"} disabled={!name || !countrySearch} />
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-2 text-gray-500 w-12">Month</th>
                      <th className="text-center py-2 px-2 text-gray-500">Weather (0–10)</th>
                      <th className="text-center py-2 px-2 text-gray-500">Crowds</th>
                      <th className="text-center py-2 px-2 text-gray-500">Cost</th>
                      <th className="text-left py-2 px-2 text-gray-500">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {MONTHS.map((month) => {
                      const d = monthlyData[month] ?? { weather: 7, crowds: "Medium", costLevel: "Normal", note: "" };
                      return (
                        <tr key={month} className="hover:bg-gray-50">
                          <td className="py-2 px-2 font-bold text-gray-700">{month}</td>
                          <td className="py-2 px-2">
                            <input type="number" min={0} max={10} value={d.weather}
                              onChange={(e) => updateMonth(month, "weather", Math.min(10, Math.max(0, parseInt(e.target.value)||0)))}
                              className="w-14 px-2 py-1 rounded-lg border border-gray-200 text-xs text-center focus:outline-none focus:ring-1 focus:ring-rose-400 mx-auto block" />
                          </td>
                          <td className="py-2 px-2">
                            <select value={d.crowds} onChange={(e) => updateMonth(month, "crowds", e.target.value)}
                              className="px-2 py-1 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-rose-400">
                              <option>Low</option><option>Medium</option><option>High</option>
                            </select>
                          </td>
                          <td className="py-2 px-2">
                            <select value={d.costLevel} onChange={(e) => updateMonth(month, "costLevel", e.target.value)}
                              className="px-2 py-1 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-rose-400">
                              <option>Cheaper</option><option>Normal</option><option>Pricier</option>
                            </select>
                          </td>
                          <td className="py-2 px-2">
                            <input value={d.note ?? ""} onChange={(e) => updateMonth(month, "note", e.target.value)}
                              placeholder="e.g. Peak season"
                              className="w-full px-2 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-400" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-1.5">
            {TABS.map(({ id }) => (
              <button key={id} onClick={() => setTab(id)}
                className={cn("w-2 h-2 rounded-full transition-all", tab === id ? "bg-rose-500 scale-125" : completions[id] ? "bg-green-400" : "bg-gray-200")} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            {hasNext && (
              <button onClick={() => setTab(TABS[tabIdx + 1].id)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-rose-300 hover:text-rose-500 transition-all">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button onClick={handleSubmit} disabled={saving}
              className="px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 disabled:opacity-50 transition-colors flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit || isSeedEdit ? "Save changes" : "Add city"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function AiFillButton({ onClick, loading, disabled }: { onClick: () => void; loading: boolean; disabled: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={loading || disabled}
      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 text-sm font-medium hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
      {loading ? "AI is filling…" : "AI fill this tab"}
    </button>
  );
}
