"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Trash2, Search, MapPin, ChevronUp, ChevronDown, Pencil, Check, X, Briefcase, Sparkles, Calendar } from "lucide-react";
import { City, BudgetMode } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn, budgetLabel } from "@/lib/utils";
import BudgetModeSelector from "@/components/BudgetModeSelector";

type TripCity = { id: string; city_slug: string; duration_days: number; position: number };
type Trip = { id: string; name: string; budget_mode: string; trip_cities: TripCity[]; updated_at: string; start_date: string | null; itinerary: unknown | null };

type Props = {
  userId: string;
  allCities: City[];
  initialTrips: Trip[];
};

export default function TripPlannerClient({ userId, allCities, initialTrips }: Props) {
  const supabase = createClient();
  const { format } = useCurrency();
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(trips[0] ?? null);
  const [newTripName, setNewTripName] = useState("");
  const [creatingTrip, setCreatingTrip] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [editNameVal, setEditNameVal] = useState("");

  const cityMap = Object.fromEntries(allCities.map((c) => [c.slug, c]));
  const filteredSearch = citySearch.trim()
    ? allCities.filter((c) =>
        !activeTrip?.trip_cities.find((tc) => tc.city_slug === c.slug) &&
        (c.name.toLowerCase().includes(citySearch.toLowerCase()) || c.country.toLowerCase().includes(citySearch.toLowerCase()))
      ).slice(0, 6)
    : [];

  function tripBudget(trip: Trip): number {
    const mode = (trip.budget_mode || "budget") as BudgetMode;
    return trip.trip_cities.reduce((sum, tc) => {
      const city = cityMap[tc.city_slug];
      return city ? sum + city.dailyBudget[mode] * tc.duration_days : sum;
    }, 0);
  }

  function totalDays(trip: Trip): number {
    return trip.trip_cities.reduce((s, tc) => s + tc.duration_days, 0);
  }

  async function createTrip() {
    if (!newTripName.trim()) return;
    const { data } = await supabase.from("trips").insert({
      user_id: userId, name: newTripName.trim(), budget_mode: "budget",
    }).select("*, trip_cities(*)").single();
    if (data) {
      setTrips((prev) => [data, ...prev]);
      setActiveTrip(data);
      setNewTripName("");
      setCreatingTrip(false);
    }
  }

  async function deleteTrip(tripId: string) {
    await supabase.from("trips").delete().eq("id", tripId);
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    setActiveTrip((prev) => prev?.id === tripId ? trips.find((t) => t.id !== tripId) ?? null : prev);
  }

  async function addCity(slug: string) {
    if (!activeTrip) return;
    const position = activeTrip.trip_cities.length;
    const { data } = await supabase.from("trip_cities")
      .insert({ trip_id: activeTrip.id, city_slug: slug, duration_days: 3, position })
      .select().single();
    if (data) {
      const updated = { ...activeTrip, trip_cities: [...activeTrip.trip_cities, data] };
      updateActive(updated);
    }
    setCitySearch("");
    await touchTrip(activeTrip.id);
  }

  async function removeCity(tcId: string) {
    if (!activeTrip) return;
    await supabase.from("trip_cities").delete().eq("id", tcId);
    const updated = { ...activeTrip, trip_cities: activeTrip.trip_cities.filter((tc) => tc.id !== tcId) };
    updateActive(updated);
  }

  async function updateDays(tcId: string, days: number) {
    if (!activeTrip || days < 1) return;
    await supabase.from("trip_cities").update({ duration_days: days }).eq("id", tcId);
    const updated = { ...activeTrip, trip_cities: activeTrip.trip_cities.map((tc) => tc.id === tcId ? { ...tc, duration_days: days } : tc) };
    updateActive(updated);
  }

  async function updateBudgetMode(mode: BudgetMode) {
    if (!activeTrip) return;
    await supabase.from("trips").update({ budget_mode: mode }).eq("id", activeTrip.id);
    updateActive({ ...activeTrip, budget_mode: mode });
  }

  async function saveName() {
    if (!activeTrip || !editNameVal.trim()) return;
    await supabase.from("trips").update({ name: editNameVal.trim() }).eq("id", activeTrip.id);
    updateActive({ ...activeTrip, name: editNameVal.trim() });
    setEditingName(false);
  }

  async function touchTrip(id: string) {
    await supabase.from("trips").update({ updated_at: new Date().toISOString() }).eq("id", id);
  }

  function updateActive(updated: Trip) {
    setActiveTrip(updated);
    setTrips((prev) => prev.map((t) => t.id === updated.id ? updated : t));
  }

  async function moveCity(tcId: string, dir: -1 | 1) {
    if (!activeTrip) return;
    const idx = activeTrip.trip_cities.findIndex((tc) => tc.id === tcId);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= activeTrip.trip_cities.length) return;
    const reordered = [...activeTrip.trip_cities];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    const updated = { ...activeTrip, trip_cities: reordered.map((tc, i) => ({ ...tc, position: i })) };
    updateActive(updated);
    for (const tc of updated.trip_cities) {
      await supabase.from("trip_cities").update({ position: tc.position }).eq("id", tc.id);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trip Planner</h1>
          <p className="text-sm text-gray-400 mt-1">Build multi-city itineraries and estimate your budget.</p>
        </div>
        {!creatingTrip && (
          <button onClick={() => setCreatingTrip(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors">
            <Plus className="w-4 h-4" /> New trip
          </button>
        )}
      </div>

      {/* New trip form */}
      {creatingTrip && (
        <div className="flex gap-2 mb-6">
          <input autoFocus value={newTripName} onChange={(e) => setNewTripName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createTrip()}
            placeholder="Trip name (e.g. Southeast Asia 2025)"
            className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          <button onClick={createTrip} disabled={!newTripName.trim()}
            className="px-4 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 disabled:opacity-40 transition-colors">
            Create
          </button>
          <button onClick={() => { setCreatingTrip(false); setNewTripName(""); }}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {trips.length === 0 && !creatingTrip ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl">
          <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">No trips yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Create your first trip to start planning.</p>
          <button onClick={() => setCreatingTrip(true)}
            className="px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors">
            Create a trip
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Trip list */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Your trips</p>
            {trips.map((trip) => (
              <button key={trip.id} onClick={() => setActiveTrip(trip)}
                className={cn("w-full text-left p-3 rounded-xl border transition-all",
                  activeTrip?.id === trip.id ? "border-rose-400 bg-rose-50" : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                )}>
                <p className={cn("font-semibold text-sm", activeTrip?.id === trip.id ? "text-rose-700" : "text-gray-800")}>
                  {trip.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {trip.trip_cities.length} {trip.trip_cities.length === 1 ? "city" : "cities"} · {totalDays(trip)} days
                </p>
                <p className="text-xs font-semibold text-rose-500 mt-0.5">
                  ~{format(tripBudget(trip))} total
                </p>
                {!!trip.itinerary && (
                  <Link href={`/trips/${trip.id}`} onClick={(e) => e.stopPropagation()}
                    className="mt-2 flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium">
                    <Sparkles className="w-3 h-3" /> View itinerary →
                  </Link>
                )}
              </button>
            ))}
          </div>

          {/* Active trip editor */}
          {activeTrip && (
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden">
              {/* Trip header — row 1: name + delete */}
              <div className="px-5 pt-4 pb-2 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {editingName ? (
                    <div className="flex gap-2">
                      <input autoFocus value={editNameVal} onChange={(e) => setEditNameVal(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveName()}
                        className="flex-1 px-2 py-1 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                      <button onClick={saveName} className="p-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setEditingName(false)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"><X className="w-3.5 h-3.5 text-gray-400" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-gray-900 text-lg truncate">{activeTrip.name}</h2>
                      <button onClick={() => { setEditingName(true); setEditNameVal(activeTrip.name); }}
                        className="p-1 rounded-lg hover:bg-gray-100 shrink-0"><Pencil className="w-3.5 h-3.5 text-gray-400" /></button>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {totalDays(activeTrip)} days total
                  </p>
                </div>
                <button onClick={() => deleteTrip(activeTrip.id)} className="p-1.5 rounded-lg hover:bg-red-50 shrink-0">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>

              {/* Row 2: start date + budget mode */}
              <div className="px-5 pb-3 border-b border-gray-100 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                  <input type="date" defaultValue={activeTrip.start_date ?? ""}
                    onChange={async (e) => {
                      const val = e.target.value;
                      await supabase.from("trips").update({ start_date: val || null }).eq("id", activeTrip.id);
                      updateActive({ ...activeTrip, start_date: val || null });
                    }}
                    className="outline-none bg-transparent text-sm" />
                </div>
                <BudgetModeSelector value={activeTrip.budget_mode as BudgetMode} onChange={updateBudgetMode} />
              </div>

              {/* Budget summary */}
              <div className="px-5 py-3 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
                <span className="text-sm text-rose-700 font-medium">Estimated total budget</span>
                <span className="text-lg font-bold text-rose-600">{format(tripBudget(activeTrip))}</span>
              </div>

              {/* City list */}
              <div className="divide-y divide-gray-50">
                {activeTrip.trip_cities.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">Add cities below to build your itinerary.</p>
                )}
                {activeTrip.trip_cities.map((tc, idx) => {
                  const city = cityMap[tc.city_slug];
                  if (!city) return null;
                  const mode = activeTrip.budget_mode as BudgetMode;
                  return (
                    <div key={tc.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveCity(tc.id, -1)} disabled={idx === 0}
                          className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-20 transition-colors">
                          <ChevronUp className="w-3 h-3 text-gray-400" />
                        </button>
                        <button onClick={() => moveCity(tc.id, 1)} disabled={idx === activeTrip.trip_cities.length - 1}
                          className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-20 transition-colors">
                          <ChevronDown className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-300 font-bold w-4">{idx + 1}</span>
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0">
                        <Image src={city.imageUrl} alt={city.name} fill className="object-cover" sizes="40px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/cities/${city.slug}`} className="font-semibold text-sm text-gray-800 hover:text-rose-500 transition-colors">
                          {city.name}
                        </Link>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{city.country}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input type="number" min={1} max={30} value={tc.duration_days}
                          onChange={(e) => updateDays(tc.id, parseInt(e.target.value) || 1)}
                          className="w-12 text-center px-1 py-1 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                        <span className="text-xs text-gray-400">days</span>
                        <span className="text-xs font-semibold text-rose-500 w-20 text-right">
                          {format(city.dailyBudget[mode] * tc.duration_days)}
                        </span>
                        <button onClick={() => removeCity(tc.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                          <X className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add city search */}
              <div className="px-4 py-3 border-t border-gray-100 relative">
                <div className="flex items-center gap-2 border border-dashed border-gray-300 rounded-xl px-3 py-2 hover:border-rose-400 transition-colors">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input value={citySearch} onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="Search a city to add…"
                    className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400" />
                </div>
                {filteredSearch.length > 0 && (
                  <div className="absolute bottom-full mb-1 left-4 right-4 bg-white border border-gray-100 rounded-xl shadow-lg z-10 py-1 max-h-48 overflow-y-auto">
                    {filteredSearch.map((city) => (
                      <button key={city.slug} onClick={() => addCity(city.slug)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left">
                        <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0">
                          <Image src={city.imageUrl} alt={city.name} fill className="object-cover" sizes="28px" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{city.name}</p>
                          <p className="text-xs text-gray-400">{city.country}</p>
                        </div>
                        <Plus className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Generate itinerary — bottom right */}
              {activeTrip.trip_cities.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-50 flex justify-end">
                  <Link href={`/trips/${activeTrip.id}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-purple-600 transition-colors shadow-sm">
                    <Sparkles className="w-4 h-4" />
                    {activeTrip.itinerary ? "View itinerary" : "Generate itinerary"}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
