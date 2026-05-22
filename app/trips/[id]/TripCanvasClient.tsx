"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Sparkles, Loader2, Calendar, MapPin, Eye, EyeOff,
  Trash2, Plus, ExternalLink, Sun, Cloud, CloudRain, ChevronDown, ChevronUp
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { City } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

type TripCity = { id: string; city_slug: string; duration_days: number; position: number; city: City | null };
type AffLink = { id: string; content: string; affiliateName: string | null; affiliateUrl: string | null; visible: boolean };
type Activity = { id: string; content: string; visible: boolean; isCustom: boolean };
type ItineraryDay = {
  date: string; citySlug: string; cityName: string; country: string;
  overallDay: number; dayInCity: number;
  weather: { score: number; note: string; crowds: string } | null;
  area: string; activities: Activity[];
  accommodation: AffLink | null; notes: string;
};
type Itinerary = { days: ItineraryDay[]; intercityTransport: (AffLink & { from: string; to: string })[]; };

type Trip = { id: string; name: string; budget_mode: string; start_date: string | null; itinerary: Itinerary | null };

function weatherIcon(score: number) {
  if (score >= 8) return <Sun className="w-4 h-4 text-yellow-500" />;
  if (score >= 5) return <Cloud className="w-4 h-4 text-gray-400" />;
  return <CloudRain className="w-4 h-4 text-blue-400" />;
}

export default function TripCanvasClient({
  trip: initialTrip, tripCities, userId,
}: { trip: Trip; tripCities: TripCity[]; userId: string }) {
  const supabase = createClient();
  const { format } = useCurrency();
  const [trip, setTrip] = useState<Trip>(initialTrip);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(initialTrip.start_date ?? "");
  const [collapsedDays, setCollapsedDays] = useState<Set<number>>(new Set());

  const itinerary = trip.itinerary;

  // Auto-generate on first visit if no itinerary exists
  useEffect(() => {
    if (!trip.itinerary && tripCities.length > 0 && !generating) {
      generate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveItinerary(it: Itinerary) {
    await supabase.from("trips").update({ itinerary: it }).eq("id", trip.id);
    setTrip((prev) => ({ ...prev, itinerary: it }));
  }

  async function saveStartDate(date: string) {
    setStartDate(date);
    await supabase.from("trips").update({ start_date: date || null }).eq("id", trip.id);
    setTrip((prev) => ({ ...prev, start_date: date || null }));
  }

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const tripCityData = tripCities.map((tc) => ({
        slug: tc.city_slug,
        name: tc.city?.name ?? tc.city_slug,
        country: tc.city?.country ?? "",
        duration_days: tc.duration_days,
      }));
      const res = await fetch("/api/trip/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripCities: tripCityData, startDate: startDate || null }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      await saveItinerary(data);
    } catch (e) { setError(String(e)); }
    finally { setGenerating(false); }
  }

  function toggleDay(dayNum: number) {
    setCollapsedDays((prev) => {
      const next = new Set(prev);
      next.has(dayNum) ? next.delete(dayNum) : next.add(dayNum);
      return next;
    });
  }

  function toggleActivity(dayIdx: number, actId: string) {
    if (!itinerary) return;
    const updated = { ...itinerary, days: itinerary.days.map((d, i) => i === dayIdx ? {
      ...d, activities: d.activities.map((a) => a.id === actId ? { ...a, visible: !a.visible } : a),
    } : d) };
    saveItinerary(updated);
  }

  function deleteActivity(dayIdx: number, actId: string) {
    if (!itinerary) return;
    const updated = { ...itinerary, days: itinerary.days.map((d, i) => i === dayIdx ? {
      ...d, activities: d.activities.filter((a) => a.id !== actId),
    } : d) };
    saveItinerary(updated);
  }

  function addActivity(dayIdx: number, content: string) {
    if (!itinerary || !content.trim()) return;
    const newAct: Activity = { id: `custom-${Date.now()}`, content: content.trim(), visible: true, isCustom: true };
    const updated = { ...itinerary, days: itinerary.days.map((d, i) => i === dayIdx ? {
      ...d, activities: [...d.activities, newAct],
    } : d) };
    saveItinerary(updated);
  }

  function toggleAccommodation(dayIdx: number) {
    if (!itinerary) return;
    const updated = { ...itinerary, days: itinerary.days.map((d, i) => i === dayIdx && d.accommodation ? {
      ...d, accommodation: { ...d.accommodation, visible: !d.accommodation.visible },
    } : d) };
    saveItinerary(updated);
  }

  function toggleTransport(tIdx: number) {
    if (!itinerary) return;
    const updated = { ...itinerary, intercityTransport: itinerary.intercityTransport.map((t, i) =>
      i === tIdx ? { ...t, visible: !t.visible } : t
    )};
    saveItinerary(updated);
  }

  const totalDays = tripCities.reduce((s, tc) => s + tc.duration_days, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-start gap-3">
          <Link href="/trips" className="p-2 rounded-xl hover:bg-gray-100 transition-colors mt-1">
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{trip.name}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {tripCities.map((tc, i) => (
                <span key={tc.id} className="flex items-center gap-1 text-sm text-gray-500">
                  {i > 0 && <span className="text-gray-300">→</span>}
                  <MapPin className="w-3 h-3" />{tc.city?.name ?? tc.city_slug} ({tc.duration_days}d)
                </span>
              ))}
              <span className="text-xs text-gray-400">· {totalDays} days total</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input type="date" value={startDate}
              onChange={(e) => saveStartDate(e.target.value)}
              className="text-sm text-gray-600 outline-none bg-transparent" />
          </div>
          <button onClick={generate} disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 disabled:opacity-50 transition-colors">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {itinerary ? "Regenerate" : "Generate itinerary"}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-4">{error}</div>}

      {/* Empty state */}
      {!itinerary && !generating && (
        <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl">
          <Sparkles className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">No itinerary yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            {startDate ? "Click Generate to create your day-by-day plan." : "Set a start date, then click Generate."}
          </p>
        </div>
      )}

      {generating && (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 text-rose-400 animate-spin mx-auto mb-3" />
          <p className="font-semibold text-gray-600">AI is crafting your itinerary…</p>
          <p className="text-sm text-gray-400 mt-1">This takes about 15–20 seconds.</p>
        </div>
      )}

      {/* Canvas */}
      {itinerary && !generating && (
        <div className="space-y-4">
          {itinerary.days.map((day, dayIdx) => {
            const city = tripCities.find((tc) => tc.city_slug === day.citySlug);
            const isCollapsed = collapsedDays.has(day.overallDay);
            const visibleActivities = day.activities.filter((a) => a.visible);
            return (
              <DayCard key={day.date} day={day} dayIdx={dayIdx} city={city?.city ?? null}
                isCollapsed={isCollapsed} onToggleCollapse={() => toggleDay(day.overallDay)}
                onToggleActivity={toggleActivity} onDeleteActivity={deleteActivity}
                onAddActivity={addActivity} onToggleAccommodation={toggleAccommodation}
                format={format}
              />
            );
          })}

          {/* Intercity transport */}
          {itinerary.intercityTransport.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Transport between cities</p>
              {itinerary.intercityTransport.map((t, i) => (
                <div key={t.id} className={cn("border rounded-xl p-3 flex items-start justify-between gap-3", t.visible ? "border-gray-100 bg-white" : "border-gray-50 bg-gray-50 opacity-50")}>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{t.from} → {t.to}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{t.content}</p>
                    {t.affiliateUrl && t.visible && (
                      <a href={t.affiliateUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-rose-500 hover:underline flex items-center gap-1 mt-1">
                        Book via {t.affiliateName} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <button onClick={() => toggleTransport(i)} className="p-1.5 rounded-lg hover:bg-gray-100">
                    {t.visible ? <Eye className="w-3.5 h-3.5 text-gray-400" /> : <EyeOff className="w-3.5 h-3.5 text-gray-300" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DayCard({ day, dayIdx, city, isCollapsed, onToggleCollapse, onToggleActivity, onDeleteActivity, onAddActivity, onToggleAccommodation, format }: {
  day: ItineraryDay; dayIdx: number; city: City | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onToggleActivity: (dayIdx: number, actId: string) => void;
  onDeleteActivity: (dayIdx: number, actId: string) => void;
  onAddActivity: (dayIdx: number, content: string) => void;
  onToggleAccommodation: (dayIdx: number) => void;
  format: (n: number) => string;
}) {
  const [newActivity, setNewActivity] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);

  const dateLabel = day.date ? new Date(day.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "";

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Day header */}
      <button onClick={onToggleCollapse} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left">
        <div className="flex items-center gap-3">
          {city?.imageUrl && (
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0">
              <Image src={city.imageUrl} alt={day.cityName} fill className="object-cover" sizes="40px" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-900">Day {day.overallDay}</span>
              <span className="text-sm text-gray-500">{day.cityName}{day.dayInCity > 1 ? ` (day ${day.dayInCity})` : ""}</span>
              {dateLabel && <span className="text-xs text-gray-400">{dateLabel}</span>}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {day.weather && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  {day.weather.score >= 8 ? "☀️" : day.weather.score >= 5 ? "⛅" : "🌧️"}
                  {day.weather.score}/10 · {day.weather.crowds} crowds
                </span>
              )}
              {day.area && <span className="text-xs text-gray-400">· {day.area}</span>}
            </div>
          </div>
        </div>
        {isCollapsed
          ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          : <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>

      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
          {/* Weather note */}
          {day.weather?.note && (
            <p className="text-xs text-gray-400 italic pt-2">{day.weather.note}</p>
          )}

          {/* Activities */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Activities</p>
            {day.activities.map((act) => (
              <div key={act.id} className={cn("flex items-start gap-2 group rounded-lg px-2 py-1.5 hover:bg-gray-50",
                !act.visible && "opacity-40")}>
                <span className="text-rose-400 mt-0.5 shrink-0">•</span>
                <span className={cn("text-sm text-gray-700 flex-1", !act.visible && "line-through")}>{act.content}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => onToggleActivity(dayIdx, act.id)} className="p-1 rounded hover:bg-gray-200">
                    {act.visible ? <Eye className="w-3 h-3 text-gray-400" /> : <EyeOff className="w-3 h-3 text-gray-300" />}
                  </button>
                  <button onClick={() => onDeleteActivity(dayIdx, act.id)} className="p-1 rounded hover:bg-red-50">
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
            {!showAddInput ? (
              <button onClick={() => setShowAddInput(true)}
                className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 mt-1 px-2">
                <Plus className="w-3 h-3" /> Add activity
              </button>
            ) : (
              <div className="flex gap-2 mt-1">
                <input autoFocus value={newActivity} onChange={(e) => setNewActivity(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { onAddActivity(dayIdx, newActivity); setNewActivity(""); setShowAddInput(false); } if (e.key === "Escape") setShowAddInput(false); }}
                  placeholder="Add your own activity…"
                  className="flex-1 px-2 py-1 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-400" />
                <button onClick={() => { onAddActivity(dayIdx, newActivity); setNewActivity(""); setShowAddInput(false); }}
                  className="px-3 py-1 rounded-lg bg-rose-500 text-white text-xs font-semibold">Add</button>
                <button onClick={() => setShowAddInput(false)} className="px-2 py-1 rounded-lg border border-gray-200 text-xs text-gray-500">✕</button>
              </div>
            )}
          </div>

          {/* Accommodation */}
          {day.accommodation && (
            <div className={cn("border rounded-xl p-3", day.accommodation.visible ? "border-orange-100 bg-orange-50/40" : "border-gray-50 bg-gray-50 opacity-40")}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-orange-600 mb-1">Where to stay</p>
                  <p className="text-sm text-gray-700">{day.accommodation.content}</p>
                  {day.accommodation.affiliateUrl && day.accommodation.visible && (
                    <a href={day.accommodation.affiliateUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-rose-500 hover:underline flex items-center gap-1 mt-1.5">
                      Book via {day.accommodation.affiliateName} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <button onClick={() => onToggleAccommodation(dayIdx)} className="p-1.5 rounded-lg hover:bg-orange-100 shrink-0">
                  {day.accommodation.visible ? <Eye className="w-3.5 h-3.5 text-gray-400" /> : <EyeOff className="w-3.5 h-3.5 text-gray-300" />}
                </button>
              </div>
            </div>
          )}

          {/* Day notes */}
          {day.notes && (
            <p className="text-xs text-gray-400 border-t border-gray-50 pt-2 italic">{day.notes}</p>
          )}

          {/* Budget hint */}
          {city && (
            <p className="text-xs text-gray-400">
              Est. daily budget: {format(city.dailyBudget.budget)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
