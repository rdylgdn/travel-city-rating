"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, ExternalLink, Archive, ArchiveRestore, Trash2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { City } from "@/lib/types";
import { AdminCityRow, adminCityToCity } from "@/lib/admin-cities";
import { scoreColor } from "@/lib/utils";
import CityFormModal from "./CityFormModal";

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
      const exists = prev.find((c) => c.id === row.id);
      return exists ? prev.map((c) => c.id === row.id ? row : c) : [row, ...prev];
    });
    setShowForm(false);
    setEditingCity(null);
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
          onClose={() => { setShowForm(false); setEditingCity(null); }}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
