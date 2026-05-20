"use client";

import dynamic from "next/dynamic";
import { X, Globe } from "lucide-react";
import { City } from "@/lib/types";

const WorldMapInteractive = dynamic(() => import("./WorldMapInteractive"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Globe className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-pulse" />
        <p className="text-sm text-gray-400">Loading map…</p>
      </div>
    </div>
  ),
});

type Props = {
  visitedCities: City[];
  onClose: () => void;
};

export default function CountriesModal({ visitedCities, onClose }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 sm:inset-8 z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-500" />
            <h2 className="font-bold text-gray-900">My travel map</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <WorldMapInteractive visitedCities={visitedCities} />
        </div>
      </div>
    </>
  );
}
