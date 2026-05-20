"use client";

import { useState, useCallback } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Plus, Minus, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { City } from "@/lib/types";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const TOTAL_COUNTRIES = 195;

type Props = {
  visitedCities: City[];
};

type SelectedCountry = {
  isoId: string;
  name: string;
  cities: City[];
};

export default function WorldMapInteractive({ visitedCities }: Props) {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [selected, setSelected] = useState<SelectedCountry | null>(null);

  // Build a map of countryIso → cities for quick lookup
  const visitedByIso = visitedCities.reduce<Record<string, City[]>>((acc, city) => {
    if (!acc[city.countryIso]) acc[city.countryIso] = [];
    acc[city.countryIso].push(city);
    return acc;
  }, {});

  const visitedCountryCount = Object.keys(visitedByIso).length;

  const handleCountryClick = useCallback((geoId: string, geoName: string) => {
    const cities = visitedByIso[geoId];
    if (!cities) return;
    setSelected({ isoId: geoId, name: geoName, cities });
  }, [visitedByIso]);

  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-2xl font-bold text-gray-900">{visitedCountryCount}</span>
            <span className="text-gray-400 text-sm"> / {TOTAL_COUNTRIES} countries</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-900">{visitedCities.length}</span>
            <span className="text-gray-400 text-sm"> cities visited</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="hidden sm:flex items-center gap-3 flex-1 max-w-xs ml-8">
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-green-500 transition-all"
              style={{ width: `${(visitedCountryCount / TOTAL_COUNTRIES) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 shrink-0">
            {((visitedCountryCount / TOTAL_COUNTRIES) * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Map + panel */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Map */}
        <div className="flex-1 bg-slate-50 relative">
          <ComposableMap
            projectionConfig={{ scale: 147 }}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup
              zoom={zoom}
              center={center}
              onMoveEnd={({ zoom: z, coordinates }) => {
                setZoom(z);
                setCenter(coordinates as [number, number]);
              }}
              maxZoom={12}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const isoId = String(geo.id);
                    const isVisited = !!visitedByIso[isoId];
                    const isSelected = selected?.isoId === isoId;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => handleCountryClick(isoId, geo.properties.name ?? isoId)}
                        style={{
                          default: {
                            fill: isSelected ? "#16a34a" : isVisited ? "#22c55e" : "#cbd5e1",
                            stroke: "#fff",
                            strokeWidth: 0.4,
                            outline: "none",
                          },
                          hover: {
                            fill: isVisited ? "#16a34a" : "#94a3b8",
                            stroke: "#fff",
                            strokeWidth: 0.4,
                            outline: "none",
                            cursor: isVisited ? "pointer" : "default",
                          },
                          pressed: {
                            fill: "#15803d",
                            outline: "none",
                          },
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
            <button
              onClick={() => setZoom((z) => Math.min(z * 1.5, 12))}
              className="w-8 h-8 bg-white rounded-lg shadow border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z / 1.5, 1))}
              className="w-8 h-8 bg-white rounded-lg shadow border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => { setZoom(1); setCenter([0, 20]); }}
              className="w-8 h-8 bg-white rounded-lg shadow border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              title="Reset view"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 rounded-xl px-3 py-2 text-xs text-gray-500 flex items-center gap-3 shadow border border-gray-100">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Visited
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-300 inline-block" /> Not visited
            </span>
          </div>
        </div>

        {/* Country detail panel */}
        {selected && (
          <div className="w-64 border-l border-gray-100 bg-white flex flex-col overflow-hidden shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 text-sm">{selected.name}</h3>
              <button
                onClick={() => setSelected(null)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto">
              <p className="text-xs text-gray-400 mb-3">
                {selected.cities.length} {selected.cities.length === 1 ? "city" : "cities"} visited
              </p>
              {selected.cities.map((city) => (
                <Link
                  key={city.id}
                  href={`/cities/${city.slug}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-green-600 text-xs font-bold">
                      {city.scores.overall.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                      {city.name}
                    </p>
                    <p className="text-xs text-gray-400">{city.bestSeason}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
