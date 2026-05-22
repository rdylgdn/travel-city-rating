"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, ExternalLink, Archive, ArchiveRestore, Trash2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { City } from "@/lib/types";
import { AdminCityRow, adminCityToCity } from "@/lib/admin-cities";
import { scoreColor } from "@/lib/utils";
import CityFormModal from "./CityFormModal";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

type UnifiedCity = {
  key: string;
  name: string;
  country: string;
  region: string;
  score: number;
  budget: number;
  slug: string;
  source: "seed" | "admin";
  isArchived: boolean;
  isPublished: boolean;
  createdAt: string | null;
  adminRow?: AdminCityRow;
  seedCity?: City;
};

type Props = {
  seedCities: City[];
  adminCities: AdminCityRow[];
  archivedSlugs: string[];
};

function seedToAdminRow(city: City): AdminCityRow {
  return {
    id: city.id, slug: city.slug, name: city.name, country: city.country,
    country_iso: city.countryIso, region: city.region, image_url: city.imageUrl,
    summary: city.summary ?? "", why_visit: city.whyVisit ?? "",
    best_areas: city.bestAreas ?? [], best_things_to_do: city.bestThingsToDo ?? [],
    best_for: city.bestFor ?? [], common_complaints: city.commonComplaints ?? [],
    score_overall: city.scores.overall, score_cost_value: city.scores.costValue,
    score_safety: city.scores.safety, score_food: city.scores.food,
    score_culture: city.scores.culture, score_nature: city.scores.nature,
    score_nightlife: city.scores.nightlife, score_ease_of_travel: city.scores.easeOfTravel,
    budget_budget: city.dailyBudget.budget, budget_mid_range: city.dailyBudget.midRange,
    budget_luxury: city.dailyBudget.luxury,
    breakdown_accommodation: city.budgetBreakdown.accommodation,
    breakdown_food: city.budgetBreakdown.food, breakdown_transport: city.budgetBreakdown.transport,
    breakdown_activities: city.budgetBreakdown.activities, breakdown_extras: city.budgetBreakdown.extras,
    best_season: city.bestSeason ?? "", is_published: true,
  };
}

export default function AdminCitiesClient({ seedCities, adminCities: initialAdminCities, archivedSlugs: initialArchived }: Props) {
  const supabase = createClient();
  const [adminCities, setAdminCities] = useState<AdminCityRow[]>(initialAdminCities);
  const [archived, setArchived] = useState<Set<string>>(new Set(initialArchived));
  const [showForm, setShowForm] = useState(false);
  const [editingCity, setEditingCity] = useState<AdminCityRow | null>(null);
  const [isSeedEdit, setIsSeedEdit] = useState(false);

  // Build unified list
  const adminSlugMap = Object.fromEntries(adminCities.map((c) => [c.slug, c]));
  const unified: UnifiedCity[] = [];

  // Seed cities (possibly overridden by admin edit)
  for (const city of seedCities) {
    const override = adminSlugMap[city.slug];
    if (override) {
      // Admin-edited seed city — show as admin source with timestamp
      unified.push({
        key: `admin-${city.slug}`,
        name: override.name, country: override.country, region: override.region,
        score: override.score_overall, budget: override.budget_budget,
        slug: override.slug, source: "admin", isArchived: false,
        isPublished: override.is_published, createdAt: override.updated_at ?? null,
        adminRow: override,
      });
    } else {
      unified.push({
        key: `seed-${city.slug}`,
        name: city.name, country: city.country, region: city.region,
        score: city.scores.overall, budget: city.dailyBudget.budget,
        slug: city.slug, source: "seed", isArchived: archived.has(city.slug),
        isPublished: !archived.has(city.slug), createdAt: null,
        seedCity: city,
      });
    }
  }

  // Admin-only cities (no seed counterpart)
  for (const ac of adminCities) {
    if (!seedCities.find((s) => s.slug === ac.slug)) {
      unified.push({
        key: `admin-only-${ac.slug}`,
        name: ac.name, country: ac.country, region: ac.region,
        score: ac.score_overall, budget: ac.budget_budget,
        slug: ac.slug, source: "admin", isArchived: false,
        isPublished: ac.is_published, createdAt: ac.created_at ?? null,
        adminRow: ac,
      });
    }
  }

  // Sort alphabetically
  unified.sort((a, b) => a.name.localeCompare(b.name));

  const publishedCount = unified.filter((c) => c.isPublished && !c.isArchived).length;

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

  async function deleteAdminCity(id: string, slug: string) {
    if (!confirm("Delete this city permanently?")) return;
    await supabase.from("admin_cities").delete().eq("id", id);
    setAdminCities((prev) => prev.filter((c) => c.id !== id && c.slug !== slug));
  }

  function editCity(city: UnifiedCity) {
    if (city.adminRow) {
      setEditingCity(city.adminRow);
      setIsSeedEdit(!!city.seedCity || !adminCities.find((c) => c.slug === city.slug && !seedCities.find((s) => s.slug === city.slug)));
    } else if (city.seedCity) {
      setEditingCity(seedToAdminRow(city.seedCity));
      setIsSeedEdit(true);
    }
    setShowForm(true);
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cities</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {publishedCount} published · {archived.size} hidden · {adminCities.filter((c) => !seedCities.find((s) => s.slug === c.slug)).length} admin-added
          </p>
        </div>
        <button onClick={() => { setEditingCity(null); setIsSeedEdit(false); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors">
          <Plus className="w-4 h-4" /> Add city
        </button>
      </div>

      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">City</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Score</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Budget/day</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Region</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Added</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {unified.map((city) => (
              <tr key={city.key} className={`hover:bg-gray-50 transition-colors group ${city.isArchived ? "opacity-50" : ""}`}>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{city.name}</p>
                  <p className="text-xs text-gray-400">{city.country}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${scoreColor(city.score)}`}>{city.score.toFixed(1)}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">${city.budget}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{city.region}</td>
                <td className="px-4 py-3">
                  {city.createdAt ? (
                    <span className="text-xs text-gray-500">{formatDate(city.createdAt)}</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full">Built-in</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    city.isArchived ? "bg-gray-100 text-gray-500" :
                    city.isPublished ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    {city.isArchived ? "Hidden" : city.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => editCity(city)} className="p-1.5 rounded-lg hover:bg-gray-100" title="Edit">
                      <Pencil className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    {city.source === "seed" && !city.adminRow && (
                      <button onClick={() => toggleArchiveSeed(city.slug)} className="p-1.5 rounded-lg hover:bg-gray-100"
                        title={city.isArchived ? "Restore" : "Hide"}>
                        {city.isArchived ? <ArchiveRestore className="w-3.5 h-3.5 text-green-500" /> : <Archive className="w-3.5 h-3.5 text-gray-400" />}
                      </button>
                    )}

                    {city.adminRow && (
                      <>
                        <button onClick={() => togglePublish(city.adminRow!.id, city.adminRow!.is_published)}
                          className="p-1.5 rounded-lg hover:bg-gray-100"
                          title={city.isPublished ? "Unpublish" : "Publish"}>
                          {city.isPublished ? <EyeOff className="w-3.5 h-3.5 text-gray-400" /> : <Eye className="w-3.5 h-3.5 text-green-500" />}
                        </button>
                        {!city.seedCity && (
                          <button onClick={() => deleteAdminCity(city.adminRow!.id, city.slug)}
                            className="p-1.5 rounded-lg hover:bg-red-50" title="Delete">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        )}
                      </>
                    )}

                    <Link href={`/cities/${city.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-gray-100">
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
