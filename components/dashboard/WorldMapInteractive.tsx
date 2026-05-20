"use client";

import { useState, useCallback, useEffect } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Plus, Minus, RotateCcw, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { City, BudgetMode } from "@/lib/types";
import { cn } from "@/lib/utils";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const TOTAL_COUNTRIES = 195;

type FilterMode = "visited" | "saved";

type Props = {
  visitedCities: City[];
  savedCities: { city: City; budgetMode: BudgetMode }[];
};

type CountryInfo = {
  name: string;
  flag: string;
  capital: string;
  languages: string;
  currency: string;
};

type SelectedCountry = {
  isoId: string;
  name: string;
  visited: City[];
  saved: City[];
};

export default function WorldMapInteractive({ visitedCities, savedCities }: Props) {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [selected, setSelected] = useState<SelectedCountry | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>("visited");
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  const visitedByIso = visitedCities.reduce<Record<string, City[]>>((acc, city) => {
    if (!acc[city.countryIso]) acc[city.countryIso] = [];
    acc[city.countryIso].push(city);
    return acc;
  }, {});

  const savedByIso = savedCities.reduce<Record<string, City[]>>((acc, { city }) => {
    if (!acc[city.countryIso]) acc[city.countryIso] = [];
    acc[city.countryIso].push(city);
    return acc;
  }, {});

  const visitedCountryCount = Object.keys(visitedByIso).length;
  const savedCountryCount = Object.keys(savedByIso).length;

  // Fetch country info for every clicked country
  useEffect(() => {
    if (!selected) return;
    setLoadingInfo(true);
    setCountryInfo(null);
    // Zero-pad to 3 digits — RestCountries API requires it (e.g. 8 → 008)
    const paddedIso = selected.isoId.padStart(3, "0");
    fetch(`https://restcountries.com/v3.1/numericcode/${paddedIso}`)
      .then((r) => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then((data) => {
        const c = Array.isArray(data) ? data[0] : null;
        if (!c) throw new Error("empty");
        const langs = c.languages
          ? (Object.values(c.languages) as string[]).slice(0, 2).join(", ")
          : "—";
        const currencies = c.currencies ? Object.values(c.currencies) as { name: string; symbol?: string }[] : [];
        const currObj = currencies[0];
        const currency = currObj
          ? `${currObj.name}${currObj.symbol ? ` (${currObj.symbol})` : ""}`
          : "—";
        setCountryInfo({
          name: c.name?.common ?? selected.name,
          flag: c.flag ?? "",
          capital: Array.isArray(c.capital) && c.capital.length > 0 ? c.capital[0] : "—",
          languages: langs || "—",
          currency,
        });
      })
      .catch(() => setCountryInfo(null))
      .finally(() => setLoadingInfo(false));
  }, [selected?.isoId]);

  const handleCountryClick = useCallback((isoId: string, name: string) => {
    const visited = visitedByIso[isoId] ?? [];
    // Show saved cities independently — a city can appear in both sections if both saved and visited
    const saved = savedByIso[isoId] ?? [];
    setSelected({ isoId, name, visited, saved });
  }, [visitedByIso, savedByIso]);

  function getFill(isoId: string): string {
    const isSelected = selected?.isoId === isoId;
    if (filterMode === "visited") {
      if (!visitedByIso[isoId]) return "#cbd5e1";
      return isSelected ? "#15803d" : "#22c55e";
    } else {
      if (!savedByIso[isoId]) return "#cbd5e1";
      return isSelected ? "#be123c" : "#f43f5e";
    }
  }

  function getHoverFill(isoId: string): string {
    if (filterMode === "visited") return visitedByIso[isoId] ? "#16a34a" : "#94a3b8";
    return savedByIso[isoId] ? "#e11d48" : "#94a3b8";
  }

  const activeCount = filterMode === "visited" ? visitedCountryCount : savedCountryCount;
  const accentColor = filterMode === "visited" ? "bg-green-500" : "bg-rose-500";

  return (
    <div className="flex flex-col h-full">
      {/* Stats + filter bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-wrap gap-3">
        <div className="flex items-center gap-5">
          <div>
            <span className="text-xl font-bold text-gray-900">{visitedCountryCount}</span>
            <span className="text-gray-400 text-xs"> / {TOTAL_COUNTRIES} visited</span>
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900">{savedCountryCount}</span>
            <span className="text-gray-400 text-xs"> saved</span>
          </div>
        </div>

        {/* Visited / Saved filter */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setFilterMode("visited")}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              filterMode === "visited" ? "bg-green-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Visited
          </button>
          <button
            onClick={() => setFilterMode("saved")}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              filterMode === "saved" ? "bg-rose-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Saved
          </button>
        </div>

        {/* Progress bar */}
        <div className="hidden lg:flex items-center gap-3 w-44">
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div
              className={cn("h-2 rounded-full transition-all", accentColor)}
              style={{ width: `${(activeCount / TOTAL_COUNTRIES) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 shrink-0">
            {((activeCount / TOTAL_COUNTRIES) * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Map + side panel */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 bg-slate-50 relative">
          <ComposableMap
            projectionConfig={{ scale: 147 }}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup
              zoom={zoom}
              center={center}
              onMoveEnd={({ zoom: z, coordinates }: { zoom: number; coordinates: [number, number] }) => {
                setZoom(z);
                setCenter(coordinates);
              }}
              maxZoom={12}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }: { geographies: { rsmKey: string; id: string | number; properties: { name?: string }; [k: string]: unknown }[] }) =>
                  geographies.map((geo) => {
                    const isoId = String(geo.id);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => handleCountryClick(isoId, geo.properties.name ?? isoId)}
                        style={{
                          default: { fill: getFill(isoId), stroke: "#fff", strokeWidth: 0.4, outline: "none" },
                          hover: { fill: getHoverFill(isoId), stroke: "#fff", strokeWidth: 0.4, outline: "none", cursor: "pointer" },
                          pressed: { fill: filterMode === "visited" ? "#15803d" : "#be123c", outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-1">
            {[
              { icon: Plus, action: () => setZoom((z) => Math.min(z * 1.5, 12)) },
              { icon: Minus, action: () => setZoom((z) => Math.max(z / 1.5, 1)) },
              { icon: RotateCcw, action: () => { setZoom(1); setCenter([0, 20]); } },
            ].map(({ icon: Icon, action }, i) => (
              <button key={i} onClick={action} className="w-8 h-8 bg-white rounded-lg shadow border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <Icon className="w-4 h-4 text-gray-600" />
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 rounded-xl px-3 py-2 text-xs text-gray-500 flex items-center gap-3 shadow border border-gray-100">
            <span className="flex items-center gap-1.5">
              <span className={cn("w-3 h-3 rounded-sm inline-block", filterMode === "visited" ? "bg-green-500" : "bg-rose-500")} />
              {filterMode === "visited" ? "Visited" : "Saved"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-300 inline-block" /> Other
            </span>
          </div>
        </div>

        {/* Country side panel */}
        {selected && (
          <div className="w-64 border-l border-gray-100 bg-white flex flex-col shrink-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 text-sm truncate">
                {countryInfo?.name ?? selected.name}
              </h3>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">

              {/* Country info — always shown for every country */}
              {loadingInfo ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 text-gray-300 animate-spin" />
                </div>
              ) : countryInfo ? (
                <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                  <span className="text-3xl leading-none mt-0.5">{countryInfo.flag}</span>
                  <div className="space-y-1.5 min-w-0">
                    {[
                      { label: "Capital", value: countryInfo.capital },
                      { label: "Language", value: countryInfo.languages },
                      { label: "Currency", value: countryInfo.currency },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex gap-1.5">
                        <span className="text-xs text-gray-400 shrink-0">{label}:</span>
                        <span className="text-xs text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Visited cities — only if any */}
              {selected.visited.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
                    Visited · {selected.visited.length} {selected.visited.length === 1 ? "city" : "cities"}
                  </p>
                  <div className="space-y-1.5">
                    {selected.visited.map((city) => (
                      <Link key={city.id} href={`/cities/${city.slug}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                          <span className="text-green-600 text-xs font-bold">{city.scores.overall.toFixed(1)}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-800 group-hover:text-green-600 transition-colors">{city.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved cities — only if any (excluding already-visited) */}
              {selected.saved.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide mb-2">
                    Saved · {selected.saved.length} {selected.saved.length === 1 ? "city" : "cities"}
                  </p>
                  <div className="space-y-1.5">
                    {selected.saved.map((city) => (
                      <Link key={city.id} href={`/cities/${city.slug}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                          <span className="text-rose-500 text-xs font-bold">{city.scores.overall.toFixed(1)}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-800 group-hover:text-rose-500 transition-colors">{city.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
