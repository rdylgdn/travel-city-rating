"use client";

import dynamic from "next/dynamic";
import { City } from "@/lib/types";

const MiniWorldMap = dynamic(() => import("@/components/MiniWorldMap"), {
  ssr: false,
  loading: () => <div className="h-[280px] bg-slate-50 rounded-2xl animate-pulse" />,
});

export default function ProfileMapWrapper({ visitedCities }: { visitedCities: City[] }) {
  return <MiniWorldMap visitedCities={visitedCities} />;
}
