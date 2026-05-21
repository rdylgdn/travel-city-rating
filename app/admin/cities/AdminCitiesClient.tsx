"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, ExternalLink, Archive, ArchiveRestore, Trash2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { City } from "@/lib/types";
import { AdminCityRow, adminCityToCity } from "@/lib/admin-cities";
import { COUNTRY_TO_REGION } from "@/lib/country-region-map";
import { scoreColor } from "@/lib/utils";
import CityFormModal from "./CityFormModal";

function seedToAdminRow(city: City): AdminCityRow {
  return {
    id: city.id,
    slug: city.slug,
    name: city.name,
    country: city.country,
    country_iso: city.countryIso,
    region: city.region,
    image_url: city.imageUrl,
    summary: city.summary ?? "",
    why_visit: city.whyVisit ?? "",
    best_areas: city.bestAreas ?? [],
    best_things_to_do: city.bestThingsToDo ?? [],
    best_for: city.bestFor ?? [],
    common_complaints: city.commonComplaints ?? [],
    score_overall: city.scores.overall,
    score_cost_value: city.scores.costValue,
    score_safety: city.scores.safety,
    score_food: city.scores.food,
    score_culture: city.scores.culture,
    score_nature: city.scores.nature,
    score_nightlife: city.scores.nightlife,
    score_ease_of_travel: city.scores.easeOfTravel,
    budget_budget: city.dailyBudget.budget,
    budget_mid_range: city.dailyBudget.midRange,
    budget_luxury: city.dailyBudget.luxury,
    breakdown_accommodation: city.budgetBreakdown.accommodation,
    breakdown_food: city.budgetBreakdown.food,
    breakdown_transport: city.budgetBreakdown.transport,
    breakdown_activities: city.budgetBreakdown.activities,
    breakdown_extras: city.budgetBreakdown.extras,
    best_season: city.bestSeason ?? "",
    is_published: true,
  };
}

type Props = {
  seedCities: City[];
  adminCities: AdminCityRow[];
  archivedSlugs: string[];
};

export default function AdminCitiesClient({ seedCities, adminCities: initialAdminCities, archivedSlugs: initialArchived }: Props) {
  const supabase = createClient();
  const [adminCities, setAdminCities] = useState<AdminCityRow[]>(initialAdminCities);
  const [archived, setArchived] = useState<Set<string>>(new Set(initialArchived));
  const [showForm, setShowForm] = useState(false);
  const [editingCity, setEditingCity] = useState<AdminCityRow | null>(null);
  const [isSeedEdit, setIsSeedEdit] = useState(false);

  async function toggleArchiveSeed(slug: string) {
    if (archived.has(slug)) {
      await supabase.from("archived_slugs").delete().eq("slug", slug);
      setArchived((prev) => { const s = new Set(prev); s.delete(slug); return s; });
    } else {
      await supabase.from("archived_slugs").insert({ slug });
      setArchived((prev) => new Set([...prev, slug]));
    }
  }

  async function togglePublish(id: string, current: boolean) {
    await supabase.from("admin_cities").update({ is_published: !current }).eq("id", id);
    setAdminCities((prev) => prev.map((c) => c.id === id ? { ...c, is_published: !current } : c));
  }

  async function deleteAdminCity(id: string) {
    if (!confirm("Delete this city permanently?")) return;
    await supabase.from("admin_cities").delete().eq("id", id);
    setAdminCities((prev) => prev.filter((c) => c.id !== id));
  }

  function onSaved(row: AdminCityRow) {
    setAdminCities((prev) => {
      const exists = prev.find((c) => c.id === row.id || c.slug === row.slug);
      return exists ? prev.map((c) => (c.id === row.id || c.slug === row.slug) ? row : c) : [row, ...prev];
    });
    setShowForm(false);
    setEditingCity(null);
    setIsSeedEdit(false);
  }

  function editSeedCity(city: City) {
    // Check if already edited (exists in admin_cities)
    const existing = adminCities.find((c) => c.slug === city.slug);
    setEditingCity(existing ?? seedToAdminRow(city));
    setIsSeedEdit(!existing);
    setShowForm(true);
  }

  const totalVisible = seedCities.filter((c) => !archived.has(c.slug)).length + adminCities.filter((c) => c.is_published).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cities</h1>
          <p className="text-sm text-gray-400 mt-0.5">{totalVisible} published · {archived.size} archived seed · {adminCities.length} admin-added</p>
        </div>
        <button onClick={() => { setEditingCity(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors">
          <Plus className="w-4 h-4" /> Add city
        </button>
      </div>

      {/* Admin-added cities */}
      {adminCities.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Admin-added cities</p>
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">City</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Score</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Budget/day</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Region</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {adminCities.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-gray-800">{row.name}</p>
                      <p className="text-xs text-gray-400">{row.country} · {row.region}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`font-semibold ${scoreColor(row.score_overall)}`}>{row.score_overall?.toFixed(1)}</span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">${row.budget_budget}</td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs">{row.region}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.is_published ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                        {row.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingCity(row); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-gray-100" title="Edit">
                          <Pencil className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button onClick={() => togglePublish(row.id, row.is_published)} className="p-1.5 rounded-lg hover:bg-gray-100" title={row.is_published ? "Unpublish" : "Publish"}>
                          {row.is_published ? <EyeOff className="w-3.5 h-3.5 text-gray-400" /> : <Eye className="w-3.5 h-3.5 text-green-500" />}
                        </button>
                        {row.is_published && (
                          <Link href={`/cities/${row.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-gray-100">
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                          </Link>
                        )}
                        <button onClick={() => deleteAdminCity(row.id)} className="p-1.5 rounded-lg hover:bg-red-50" title="Delete">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Seed cities */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Seed cities</p>
        <div className="border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">City</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Score</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Budget/day</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Region</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {seedCities.map((city) => {
                const isArchived = archived.has(city.slug);
                return (
                  <tr key={city.id} className={`hover:bg-gray-50 transition-colors group ${isArchived ? "opacity-50" : ""}`}>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-gray-800">{city.name}</p>
                      <p className="text-xs text-gray-400">{city.country}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`font-semibold ${scoreColor(city.scores.overall)}`}>{city.scores.overall.toFixed(1)}</span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">${city.dailyBudget.budget}</td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs">{city.region}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isArchived ? "bg-gray-100 text-gray-500" : "bg-green-50 text-green-600"}`}>
                        {isArchived ? "Hidden" : "Published"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => editSeedCity(city)} className="p-1.5 rounded-lg hover:bg-gray-100" title="Edit">
                          <Pencil className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button onClick={() => toggleArchiveSeed(city.slug)} className="p-1.5 rounded-lg hover:bg-gray-100" title={isArchived ? "Restore" : "Hide"}>
                          {isArchived ? <ArchiveRestore className="w-3.5 h-3.5 text-green-500" /> : <Archive className="w-3.5 h-3.5 text-gray-400" />}
                        </button>
                        <Link href={`/cities/${city.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-gray-100">
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <CityFormModal
          existing={editingCity}
          isSeedEdit={isSeedEdit}
          onClose={() => { setShowForm(false); setEditingCity(null); setIsSeedEdit(false); }}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
