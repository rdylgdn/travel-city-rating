"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Plus, Minus, X } from "lucide-react";
import Link from "next/link";
import { City } from "@/lib/types";
import { scoreColor, cn } from "@/lib/utils";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type Props = {
  visitedCities: City[];
};

export default function MiniWorldMap({ visitedCities }: Props) {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);

  const visitedByIso = visitedCities.reduce<Record<string, City[]>>((acc, city) => {
    if (!acc[city.countryIso]) acc[city.countryIso] = [];
    acc[city.countryIso].push(city);
    return acc;
  }, {});

  const selectedCities = selectedIso ? (visitedByIso[selectedIso] ?? []) : [];

  return (
    <div className="relative bg-slate-50 rounded-2xl overflow-hidden" style={{ height: 280 }}>
      <ComposableMap projectionConfig={{ scale: 147 }} style={{ width: "100%", height: "100%" }}>
        <ZoomableGroup
          zoom={zoom}
          center={center}
          onMoveEnd={({ zoom: z, coordinates }: { zoom: number; coordinates: [number, number] }) => {
            setZoom(z); setCenter(coordinates);
          }}
          maxZoom={8}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: { rsmKey: string; id: string | number; properties: { name?: string } }[] }) =>
              geographies.map((geo) => {
                const isoId = String(geo.id);
                const isVisited = !!visitedByIso[isoId];
                const isSelected = selectedIso === isoId;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => isVisited ? setSelectedIso(isSelected ? null : isoId) : null}
                    style={{
                      default: { fill: isSelected ? "#15803d" : isVisited ? "#22c55e" : "#cbd5e1", stroke: "#fff", strokeWidth: 0.4, outline: "none" },
                      hover: { fill: isVisited ? "#16a34a" : "#94a3b8", stroke: "#fff", strokeWidth: 0.4, outline: "none", cursor: isVisited ? "pointer" : "default" },
                      pressed: { fill: "#15803d", outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Zoom */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        {[{ icon: Plus, action: () => setZoom((z) => Math.min(z * 1.5, 8)) },
          { icon: Minus, action: () => setZoom((z) => Math.max(z / 1.5, 1)) }]
          .map(({ icon: Icon, action }, i) => (
            <button key={i} onClick={action} className="w-7 h-7 bg-white rounded-lg shadow border border-gray-200 flex items-center justify-center hover:bg-gray-50">
              <Icon className="w-3.5 h-3.5 text-gray-600" />
            </button>
          ))}
      </div>

      {/* Country tooltip */}
      {selectedCities.length > 0 && (
        <div className="absolute top-3 left-3 bg-white/95 rounded-xl shadow-lg border border-gray-100 px-3 py-2 max-w-[200px]">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold text-gray-700">{selectedCities[0].country}</p>
            <button onClick={() => setSelectedIso(null)}>
              <X className="w-3 h-3 text-gray-400" />
            </button>
          </div>
          {selectedCities.map((city) => (
            <Link key={city.id} href={`/cities/${city.slug}`}
              className="flex items-center gap-1.5 py-0.5 hover:text-rose-500 transition-colors group">
              <span className={cn("text-xs font-bold", scoreColor(city.scores.overall))}>{city.scores.overall.toFixed(1)}</span>
              <span className="text-xs text-gray-700 group-hover:text-rose-500">{city.name}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg px-2 py-1 text-xs text-gray-400 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" /> Visited
      </div>
    </div>
  );
}
