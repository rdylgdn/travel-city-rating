"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Check, Loader2, ToggleLeft, ToggleRight, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

type Placement = {
  id: string;
  title: string;
  subtitle: string | null;
  body_text: string | null;
  cta_label: string | null;
  cta_url: string;
  image_url: string | null;
  video_url: string | null;
  type: string;
  badge_text: string | null;
  grid_position: number;
  is_active: boolean;
  opens_in_new_tab: boolean;
};

const TYPES = [
  { value: "image",   label: "Image card" },
  { value: "video",   label: "Video embed" },
  { value: "text",    label: "Text only" },
];

const EMPTY: Omit<Placement, "id" | "is_active"> = {
  title: "", subtitle: "", body_text: "", cta_label: "Learn more", cta_url: "",
  image_url: "", video_url: "", type: "image", badge_text: "Sponsored",
  grid_position: 0, opens_in_new_tab: true,
};

export default function PlacementsClient({ initialPlacements }: { initialPlacements: Placement[] }) {
  const supabase = createClient();
  const [placements, setPlacements] = useState<Placement[]>(initialPlacements);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(k: string, v: unknown) { setForm((p) => ({ ...p, [k]: v })); }

  async function save() {
    if (!form.title || !form.cta_url) { setError("Title and CTA URL are required."); return; }
    setSaving(true); setError(null);
    const payload = { ...form, grid_position: Number(form.grid_position) || 0 };
    if (editingId) {
      const { data } = await supabase.from("placements").update(payload).eq("id", editingId).select().single();
      if (data) setPlacements((p) => p.map((pl) => pl.id === editingId ? data : pl));
    } else {
      const { data } = await supabase.from("placements").insert({ ...payload, is_active: true }).select().single();
      if (data) setPlacements((p) => [...p, data]);
    }
    setSaving(false); closeForm();
  }

  async function remove(id: string) {
    if (!confirm("Delete this placement?")) return;
    await supabase.from("placements").delete().eq("id", id);
    setPlacements((p) => p.filter((pl) => pl.id !== id));
  }

  async function toggleActive(id: string, cur: boolean) {
    await supabase.from("placements").update({ is_active: !cur }).eq("id", id);
    setPlacements((p) => p.map((pl) => pl.id === id ? { ...pl, is_active: !cur } : pl));
  }

  function startEdit(pl: Placement) {
    setForm({ title: pl.title, subtitle: pl.subtitle ?? "", body_text: pl.body_text ?? "",
      cta_label: pl.cta_label ?? "Learn more", cta_url: pl.cta_url,
      image_url: pl.image_url ?? "", video_url: pl.video_url ?? "",
      type: pl.type, badge_text: pl.badge_text ?? "Sponsored",
      grid_position: pl.grid_position, opens_in_new_tab: pl.opens_in_new_tab });
    setEditingId(pl.id); setShowForm(true);
  }

  function closeForm() { setShowForm(false); setEditingId(null); setForm({ ...EMPTY }); setError(null); }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Placements</h1>
          <p className="text-sm text-gray-400 mt-1">Promotional cards that appear in the city grid on the homepage.</p>
        </div>
        <button onClick={() => { closeForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors">
          <Plus className="w-4 h-4" /> Add placement
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">{editingId ? "Edit placement" : "New placement"}</h3>
            <button onClick={closeForm}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Title *</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Find the best flight deals"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Subtitle</label>
              <input value={form.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} placeholder="e.g. Compare 500+ airlines"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Body text</label>
            <textarea value={form.body_text ?? ""} onChange={(e) => set("body_text", e.target.value)} rows={2}
              placeholder="Supporting description shown on the card…"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">CTA button label</label>
              <input value={form.cta_label ?? ""} onChange={(e) => set("cta_label", e.target.value)} placeholder="Learn more"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Landing page URL *</label>
              <input value={form.cta_url} onChange={(e) => set("cta_url", e.target.value)} placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Card type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-400">
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Badge text</label>
              <input value={form.badge_text ?? ""} onChange={(e) => set("badge_text", e.target.value)} placeholder="Sponsored"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Grid position (0 = auto)</label>
              <input type="number" min={0} value={form.grid_position} onChange={(e) => set("grid_position", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
          </div>

          {(form.type === "image" || form.type === "text") && (
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Image URL</label>
              <input value={form.image_url ?? ""} onChange={(e) => set("image_url", e.target.value)} placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
              {form.image_url && (
                <img src={form.image_url} alt="preview" className="mt-2 h-16 w-full object-cover rounded-xl opacity-80"
                  onError={(e) => (e.currentTarget.style.display = "none")} />
              )}
            </div>
          )}

          {form.type === "video" && (
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Video embed URL (YouTube/Vimeo iframe src)</label>
              <input value={form.video_url ?? ""} onChange={(e) => set("video_url", e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.opens_in_new_tab} onChange={(e) => set("opens_in_new_tab", e.target.checked)}
                className="rounded border-gray-300" />
              <span className="text-sm text-gray-600">Open in new tab</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {editingId ? "Save changes" : "Add placement"}
            </button>
            <button onClick={closeForm} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      {placements.length === 0 && !showForm ? (
        <p className="text-center py-12 text-gray-400 text-sm">No placements yet. Add one to start showing promotional cards on the homepage.</p>
      ) : (
        <div className="space-y-3">
          {placements.map((pl) => (
            <div key={pl.id} className={cn("border rounded-2xl p-4 bg-white flex items-start gap-4 group", pl.is_active ? "border-gray-100" : "border-gray-50 opacity-60")}>
              {/* Preview */}
              <div className="w-20 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                {pl.type === "video" && pl.video_url ? (
                  <div className="text-xs text-gray-400 text-center p-1">🎬 Video</div>
                ) : pl.image_url ? (
                  <Image src={pl.image_url} alt={pl.title} fill className="object-cover"
                    onError={() => {}} sizes="80px" style={{ position: "relative" }} width={80} height={56} />
                ) : (
                  <span className="text-xs text-gray-300">No image</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-800 text-sm">{pl.title}</p>
                  {pl.badge_text && (
                    <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full font-medium">{pl.badge_text}</span>
                  )}
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{pl.type}</span>
                  <span className="text-xs text-gray-400">pos {pl.grid_position || "auto"}</span>
                </div>
                {pl.subtitle && <p className="text-xs text-gray-500 mt-0.5">{pl.subtitle}</p>}
                <a href={pl.cta_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1 mt-1">
                  {pl.cta_label || "Learn more"} → {pl.cta_url.slice(0, 40)}{pl.cta_url.length > 40 && "…"} <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleActive(pl.id, pl.is_active)}>
                  {pl.is_active
                    ? <ToggleRight className="w-5 h-5 text-green-500" />
                    : <ToggleLeft className="w-5 h-5 text-gray-300" />}
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(pl)} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-3.5 h-3.5 text-gray-400" /></button>
                  <button onClick={() => remove(pl.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
