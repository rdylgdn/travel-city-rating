"use client";

import { useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
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
const SCORE_FIELDS: { key: keyof AdminCityRow; label: string }[] = [
  { key: "score_overall",       label: "Overall" },
  { key: "score_cost_value",    label: "Cost / Value" },
  { key: "score_safety",        label: "Safety" },
  { key: "score_food",          label: "Food" },
  { key: "score_culture",       label: "Culture" },
  { key: "score_nature",        label: "Nature" },
  { key: "score_nightlife",     label: "Nightlife" },
  { key: "score_ease_of_travel",label: "Ease of Travel" },
];

function defaultMonthly(): Record<string, MonthData> {
  return Object.fromEntries(MONTHS.map((m) => [m, { weather: 7, crowds: "Medium" as const, costLevel: "Normal" as const }]));
}

type Props = {
  existing: AdminCityRow | null;
  isSeedEdit?: boolean;
  onClose: () => void;
  onSaved: (row: AdminCityRow) => void;
};

type Tab = "basic" | "content" | "scores" | "budget" | "seasonal";

export default function CityFormModal({ existing, isSeedEdit, onClose, onSaved }: Props) {
  const supabase = createClient();
  const isEdit = !!existing;
  const [tab, setTab] = useState<Tab>("basic");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(existing?.name ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [countrySearch, setCountrySearch] = useState(existing?.country ?? "");
  const [selectedCountryIso2, setSelectedCountryIso2] = useState("");
  const [region, setRegion] = useState<Region>((existing?.region as Region) ?? "Europe");
  const [countryIso, setCountryIso] = useState(existing?.country_iso ?? "");
  const [imageUrl, setImageUrl] = useState(existing?.image_url ?? "");
  const [summary, setSummary] = useState(existing?.summary ?? "");
  const [whyVisit, setWhyVisit] = useState(existing?.why_visit ?? "");
  const [bestSeason, setBestSeason] = useState(existing?.best_season ?? "");
  const [bestFor, setBestFor] = useState<TravelStyle[]>((existing?.best_for as TravelStyle[]) ?? []);
  const [bestAreas, setBestAreas] = useState((existing?.best_areas ?? []).join("\n"));
  const [thingsToDo, setThingsToDo] = useState((existing?.best_things_to_do ?? []).join("\n"));
  const [complaints, setComplaints] = useState((existing?.common_complaints ?? []).join("\n"));
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
  const [budgetBudget, setBudgetBudget] = useState(existing?.budget_budget ?? 50);
  const [budgetMid, setBudgetMid] = useState(existing?.budget_mid_range ?? 100);
  const [budgetLuxury, setBudgetLuxury] = useState(existing?.budget_luxury ?? 200);
  const [bAccommodation, setBAccommodation] = useState(existing?.breakdown_accommodation ?? 20);
  const [bFood, setBFood] = useState(existing?.breakdown_food ?? 15);
  const [bTransport, setBTransport] = useState(existing?.breakdown_transport ?? 10);
  const [bActivities, setBActivities] = useState(existing?.breakdown_activities ?? 10);
  const [bExtras, setBExtras] = useState(existing?.breakdown_extras ?? 5);
  const [monthlyData, setMonthlyData] = useState<Record<string, MonthData>>(defaultMonthly());

  const filteredCountries = countrySearch.trim()
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(countrySearch.toLowerCase())).slice(0, 8)
    : [];
  const showCountryDropdown = countrySearch.trim() !== "" && countrySearch !== (COUNTRIES.find((c) => c.iso2 === selectedCountryIso2)?.name ?? "");

  function selectCountry(name: string, iso2: string) {
    setCountrySearch(name);
    setSelectedCountryIso2(iso2);
    const r = COUNTRY_TO_REGION[iso2];
    if (r) setRegion(r);
    const num = COUNTRY_ISO_NUMERIC[iso2];
    if (num) setCountryIso(num);
  }

  function setScore(key: string, val: number) {
    const clamped = Math.min(10, Math.max(0, val));
    setScores((prev) => ({ ...prev, [key]: clamped }));
  }

  function updateMonth(month: string, field: keyof MonthData, value: unknown) {
    setMonthlyData((prev) => ({ ...prev, [month]: { ...prev[month], [field]: value } }));
  }

  async function handleAiFill() {
    if (!name || !countrySearch) { setError("Enter city name and country first."); setTab("basic"); return; }
    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/ai-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityName: name, country: countrySearch }),
      });
      const data = await res.json();
      if (data.error) { setError(`AI fill failed: ${data.error}`); return; }
      if (data.summary) setSummary(data.summary);
      if (data.whyVisit) setWhyVisit(data.whyVisit);
      if (data.bestAreas) setBestAreas(data.bestAreas.join("\n"));
      if (data.bestThingsToDo) setThingsToDo(data.bestThingsToDo.join("\n"));
      if (data.commonComplaints) setComplaints(data.commonComplaints.join("\n"));
    } catch (e) {
      setError(`AI fill error: ${String(e)}`);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit() {
    setError(null);
    if (!name || !slug || !countrySearch) { setError("Name, slug and country are required."); setTab("basic"); return; }
    setLoading(true);

    const payload = {
      slug, name, country: countrySearch, country_iso: countryIso, region,
      image_url: imageUrl, summary, why_visit: whyVisit, best_season: bestSeason,
      best_for: bestFor,
      best_areas: bestAreas.split("\n").map((s) => s.trim()).filter(Boolean),
      best_things_to_do: thingsToDo.split("\n").map((s) => s.trim()).filter(Boolean),
      common_complaints: complaints.split("\n").map((s) => s.trim()).filter(Boolean),
      ...scores,
      budget_budget: budgetBudget, budget_mid_range: budgetMid, budget_luxury: budgetLuxury,
      breakdown_accommodation: bAccommodation, breakdown_food: bFood,
      breakdown_transport: bTransport, breakdown_activities: bActivities, breakdown_extras: bExtras,
      is_published: true,
      monthly_data: monthlyData,
      updated_at: new Date().toISOString(),
    };

    let row: AdminCityRow | null = null;
    if (isEdit && !isSeedEdit) {
      const { data, error: err } = await supabase.from("admin_cities").update(payload).eq("id", existing!.id).select().single();
      if (err) { setError(err.message); setLoading(false); return; }
      row = data;
    } else {
      // Insert or upsert (handles seed city edits by slug)
      const { data, error: err } = await supabase.from("admin_cities").upsert(payload, { onConflict: "slug" }).select().single();
      if (err) { setError(err.message); setLoading(false); return; }
      row = data;
    }

    setLoading(false);
    if (row) onSaved(row);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "basic",    label: "Basic info" },
    { id: "content",  label: "Content" },
    { id: "scores",   label: "Scores" },
    { id: "budget",   label: "Budget" },
    { id: "seasonal", label: "Best time" },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-4 sm:inset-10 z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-gray-900">
            {isSeedEdit ? `Edit seed city: ${existing?.name}` : isEdit ? `Edit: ${existing?.name}` : "Add new city"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-400" /></button>
        </div>

        {/* Tabs — top only */}
        <div className="flex border-b border-gray-100 shrink-0 overflow-x-auto">
          {tabs.map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={cn("px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                tab === id ? "border-rose-500 text-rose-600" : "border-transparent text-gray-500 hover:text-gray-700"
              )}>
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-600 mb-4">{error}</div>}

          {/* ── BASIC INFO ── */}
          {tab === "basic" && (
            <div className="space-y-4 max-w-lg">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">City name *</label>
                  <input value={name} onChange={(e) => { setName(e.target.value); if (!isEdit) setSlug(e.target.value.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"")); }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Slug *</label>
                  <input value={slug} onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" required />
                </div>
              </div>

              {/* Country dropdown */}
              <div className="relative">
                <label className="text-xs font-semibold text-gray-500 block mb-1">Country *</label>
                <input value={countrySearch}
                  onChange={(e) => { setCountrySearch(e.target.value); setSelectedCountryIso2(""); }}
                  placeholder="Search country…"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                {showCountryDropdown && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 max-h-48 overflow-y-auto">
                    {filteredCountries.map((c) => (
                      <button key={c.iso2} type="button" onClick={() => selectCountry(c.name, c.iso2)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left text-sm">
                        <span>{c.flag}</span><span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Region (auto-filled)</label>
                  <select value={region} onChange={(e) => setRegion(e.target.value as Region)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white">
                    {REGIONS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">ISO numeric (auto-filled)</label>
                  <input value={countryIso} onChange={(e) => setCountryIso(e.target.value)} placeholder="e.g. 792"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Best season</label>
                  <input value={bestSeason} onChange={(e) => setBestSeason(e.target.value)} placeholder="e.g. Apr–Jun"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Image URL</label>
                  <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-2">Best for</label>
                <div className="flex flex-wrap gap-2">
                  {TRAVEL_STYLES.map((s) => (
                    <button type="button" key={s} onClick={() => setBestFor((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                      className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-all",
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
              <button onClick={handleAiFill} disabled={aiLoading || !name || !countrySearch}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-purple-600 disabled:opacity-40 transition-colors">
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {aiLoading ? "AI is filling content…" : "AI fill content"}
              </button>
              {!name || !countrySearch ? <p className="text-xs text-gray-400">Enter city name and country in Basic info first.</p> : null}

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Summary (one sentence)</label>
                <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Why visit?</label>
                <textarea value={whyVisit} onChange={(e) => setWhyVisit(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Best areas (one per line)</label>
                <textarea value={bestAreas} onChange={(e) => setBestAreas(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Top things to do (one per line)</label>
                <textarea value={thingsToDo} onChange={(e) => setThingsToDo(e.target.value)} rows={5} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Common complaints (one per line)</label>
                <textarea value={complaints} onChange={(e) => setComplaints(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
              </div>
            </div>
          )}

          {/* ── SCORES ── */}
          {tab === "scores" && (
            <div className="space-y-3 max-w-sm">
              <p className="text-xs text-gray-400">Scores must be between 0 and 10.</p>
              {SCORE_FIELDS.map(({ key, label }) => (
                <div key={key as string} className="flex items-center gap-3">
                  <label className="text-sm text-gray-600 w-32 shrink-0">{label}</label>
                  <input type="number" min={0} max={10} step={0.1} value={scores[key as string] ?? 7.0}
                    onChange={(e) => setScore(key as string, parseFloat(e.target.value) || 0)}
                    className="w-20 px-3 py-1.5 rounded-xl border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-rose-400" />
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-rose-400 transition-all" style={{ width: `${((scores[key as string] ?? 7) / 10) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right">{(scores[key as string] ?? 7).toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── BUDGET ── */}
          {tab === "budget" && (
            <div className="space-y-5 max-w-sm">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Daily budget tiers (USD)</p>
                <div className="space-y-2">
                  {([["Budget", budgetBudget, setBudgetBudget],["Mid-range", budgetMid, setBudgetMid],["Luxury", budgetLuxury, setBudgetLuxury]] as [string, number, (v: number) => void][]).map(([label, val, setter]) => (
                    <div key={label} className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 w-24 shrink-0">{label}</label>
                      <span className="text-gray-400 text-sm">$</span>
                      <input type="number" min={1} value={val} onChange={(e) => setter(parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-1.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                      <span className="text-xs text-gray-400">/day</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Budget breakdown (USD/day)</p>
                <div className="space-y-2">
                  {([["Accommodation",bAccommodation,setBAccommodation],["Food",bFood,setBFood],["Transport",bTransport,setBTransport],["Activities",bActivities,setBActivities],["Extras",bExtras,setBExtras]] as [string, number, (v: number) => void][]).map(([label, val, setter]) => (
                    <div key={label} className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 w-24 shrink-0">{label}</label>
                      <span className="text-gray-400 text-sm">$</span>
                      <input type="number" min={0} value={val} onChange={(e) => setter(parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-1.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── BEST TIME / SEASONAL ── */}
          {tab === "seasonal" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400 max-w-lg">Set weather, crowd level, and cost for each month. This powers the interactive chart on the city page.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-2 text-gray-500">Month</th>
                      <th className="text-left py-2 px-2 text-gray-500">Weather (0–10)</th>
                      <th className="text-left py-2 px-2 text-gray-500">Crowds</th>
                      <th className="text-left py-2 px-2 text-gray-500">Cost</th>
                      <th className="text-left py-2 px-2 text-gray-500">Note (optional)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {MONTHS.map((month) => {
                      const d = monthlyData[month] ?? { weather: 7, crowds: "Medium", costLevel: "Normal" };
                      return (
                        <tr key={month} className="hover:bg-gray-50">
                          <td className="py-2 px-2 font-semibold text-gray-700 w-12">{month}</td>
                          <td className="py-2 px-2">
                            <input type="number" min={0} max={10} value={d.weather}
                              onChange={(e) => updateMonth(month, "weather", Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
                              className="w-14 px-2 py-1 rounded-lg border border-gray-200 text-xs text-center focus:outline-none focus:ring-1 focus:ring-rose-400" />
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

        {/* Footer — Save/Cancel only, no duplicate tabs */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 disabled:opacity-50 transition-colors flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit || isSeedEdit ? "Save changes" : "Add city"}
          </button>
        </div>
      </div>
    </>
  );
}
