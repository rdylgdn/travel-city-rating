"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Loader2, ExternalLink, ToggleLeft, ToggleRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

type AffLink = {
  id: string;
  category: string;
  type: string;
  name: string;
  url: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
};

const CATEGORIES: Record<string, { label: string; types: string[] }> = {
  accommodation: {
    label: "Accommodation",
    types: ["hotel", "airbnb", "hostel", "resort", "apartment"],
  },
  transportation: {
    label: "Transportation",
    types: ["flight", "bus", "train", "car_rental", "taxi", "ferry"],
  },
};

const TYPE_LABELS: Record<string, string> = {
  hotel: "Hotel", airbnb: "Airbnb", hostel: "Hostel", resort: "Resort", apartment: "Apartment",
  flight: "Flight", bus: "Bus", train: "Train", car_rental: "Car Rental", taxi: "Taxi", ferry: "Ferry",
};

const EMPTY_FORM = { category: "accommodation", type: "hotel", name: "", url: "", description: "", logo_url: "" };

export default function AffiliatesClient({ initialLinks }: { initialLinks: AffLink[] }) {
  const supabase = createClient();
  const [links, setLinks] = useState<AffLink[]>(initialLinks);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!form.name || !form.url) { setError("Name and URL are required."); return; }
    setSaving(true);
    setError(null);
    if (editingId) {
      const { data } = await supabase.from("affiliate_links").update({ ...form }).eq("id", editingId).select().single();
      if (data) setLinks((p) => p.map((l) => l.id === editingId ? data : l));
    } else {
      const { data } = await supabase.from("affiliate_links").insert({ ...form, is_active: true }).select().single();
      if (data) setLinks((p) => [...p, data]);
    }
    setSaving(false);
    closeForm();
  }

  async function remove(id: string) {
    if (!confirm("Delete this affiliate link?")) return;
    await supabase.from("affiliate_links").delete().eq("id", id);
    setLinks((p) => p.filter((l) => l.id !== id));
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from("affiliate_links").update({ is_active: !current }).eq("id", id);
    setLinks((p) => p.map((l) => l.id === id ? { ...l, is_active: !current } : l));
  }

  function startEdit(link: AffLink) {
    setForm({ category: link.category, type: link.type, name: link.name, url: link.url, description: link.description ?? "", logo_url: link.logo_url ?? "" });
    setEditingId(link.id);
    setShowForm(true);
  }

  function closeForm() { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); setError(null); }

  const grouped = Object.entries(CATEGORIES).map(([catKey, catVal]) => ({
    catKey, catLabel: catVal.label,
    items: links.filter((l) => l.category === catKey),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Affiliate Links</h1>
          <p className="text-sm text-gray-400 mt-1">AI uses these when generating trip recommendations.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors">
          <Plus className="w-4 h-4" /> Add link
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">{editingId ? "Edit link" : "Add affiliate link"}</h3>
            <button onClick={closeForm}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, type: CATEGORIES[e.target.value].types[0] })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-400">
                {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-400">
                {CATEGORIES[form.category].types.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Booking.com"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Affiliate URL *</label>
              <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Description (shown to AI)</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Best for budget travellers, accepts all currencies..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {editingId ? "Save changes" : "Add link"}
            </button>
            <button onClick={closeForm} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {/* Links grouped by category */}
      {grouped.map(({ catKey, catLabel, items }) => (
        <div key={catKey}>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{catLabel}</h2>
          {items.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No {catLabel.toLowerCase()} links yet.</p>
          ) : (
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Name</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Type</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Description</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Status</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((link) => (
                    <tr key={link.id} className="hover:bg-gray-50 group">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{link.name}</p>
                        <a href={link.url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-rose-400 hover:underline flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                          {link.url.slice(0, 40)}{link.url.length > 40 && "…"} <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">{TYPE_LABELS[link.type] ?? link.type}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-[200px] truncate">{link.description ?? "—"}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(link.id, link.is_active)} className="flex items-center gap-1">
                          {link.is_active
                            ? <ToggleRight className="w-5 h-5 text-green-500" />
                            : <ToggleLeft className="w-5 h-5 text-gray-300" />}
                          <span className={cn("text-xs font-medium", link.is_active ? "text-green-600" : "text-gray-400")}>
                            {link.is_active ? "Active" : "Off"}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(link)} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-3.5 h-3.5 text-gray-400" /></button>
                          <button onClick={() => remove(link.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
