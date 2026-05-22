"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Check, Loader2, ToggleLeft, ToggleRight, ExternalLink, Upload, ImageIcon } from "lucide-react";
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
  { value: "image", label: "Image card" },
  { value: "video", label: "Video embed" },
  { value: "text",  label: "Text only" },
];

const EMPTY = {
  title: "", subtitle: "", body_text: "", cta_label: "Learn more", cta_url: "",
  image_url: "", video_url: "", type: "image", badge_text: "Sponsored",
  grid_position: 0, opens_in_new_tab: true,
};

// Convert any YouTube/Vimeo watch URL to embed URL
function normalizeVideoUrl(url: string): string {
  if (!url.trim()) return url;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url; // already an embed URL
}

function posToRowCol(pos: number, cols = 4): { row: number; col: number } {
  if (pos <= 0) return { row: 0, col: 0 };
  return { row: Math.ceil(pos / cols), col: ((pos - 1) % cols) + 1 };
}

function rowColToPos(row: number, col: number, cols = 4): number {
  if (row <= 0) return 0;
  return (row - 1) * cols + col;
}

type Props = { initialPlacements: Placement[]; cityCount: number };

export default function PlacementsClient({ initialPlacements, cityCount }: Props) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [placements, setPlacements] = useState<Placement[]>(initialPlacements);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posRow, setPosRow] = useState(0);
  const [posCol, setPosCol] = useState(1);

  const maxRows = Math.ceil(cityCount / 4) + 2; // allow a couple rows beyond existing cities
  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  function applyRowCol(row: number, col: number) {
    setPosRow(row); setPosCol(col);
    set("grid_position", rowColToPos(row, col));
  }

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { setError("Only JPG, PNG, or WebP images are supported."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB."); return; }
    setError(null); setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("placement-images").upload(path, file);
    if (upErr) { setError(`Upload failed: ${upErr.message}`); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("placement-images").getPublicUrl(path);
    set("image_url", urlData.publicUrl);
    setUploading(false);
    e.target.value = "";
  }

  async function save() {
    if (!form.title || !form.cta_url) { setError("Title and CTA URL are required."); return; }
    setSaving(true); setError(null);
    const normalizedVideo = form.type === "video" ? normalizeVideoUrl(form.video_url) : form.video_url;
    const payload = { ...form, video_url: normalizedVideo, grid_position: Number(form.grid_position) || 0 };
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
    const { row, col } = posToRowCol(pl.grid_position);
    setPosRow(row); setPosCol(col);
    setForm({ title: pl.title, subtitle: pl.subtitle ?? "", body_text: pl.body_text ?? "",
      cta_label: pl.cta_label ?? "Learn more", cta_url: pl.cta_url,
      image_url: pl.image_url ?? "", video_url: pl.video_url ?? "",
      type: pl.type, badge_text: pl.badge_text ?? "Sponsored",
      grid_position: pl.grid_position, opens_in_new_tab: pl.opens_in_new_tab });
    setEditingId(pl.id); setShowForm(true);
  }

  function closeForm() { setShowForm(false); setEditingId(null); setForm({ ...EMPTY }); setPosRow(0); setPosCol(1); setError(null); }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Placements</h1>
          <p className="text-sm text-gray-400 mt-1">Promotional cards injected into the city grid on the homepage.</p>
        </div>
        <button onClick={() => { closeForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors">
          <Plus className="w-4 h-4" /> Add placement
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">{editingId ? "Edit placement" : "New placement"}</h3>
            <button onClick={closeForm}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

          {/* Type */}
          <div className="flex gap-2">
            {TYPES.map((t) => (
              <button key={t.value} type="button" onClick={() => set("type", t.value)}
                className={cn("px-3 py-1.5 rounded-xl text-sm font-medium border transition-all",
                  form.type === t.value ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
                )}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Title *</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Subtitle</label>
              <input value={form.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Body text</label>
            <textarea value={form.body_text ?? ""} onChange={(e) => set("body_text", e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">CTA label</label>
              <input value={form.cta_label ?? ""} onChange={(e) => set("cta_label", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Landing page URL *</label>
              <input value={form.cta_url} onChange={(e) => set("cta_url", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
          </div>

          {/* Image */}
          {(form.type === "image" || form.type === "text") && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 block">Image</label>
              <p className="text-xs text-gray-400">
                Recommended: <strong>800×600px</strong> (4:3 ratio) · Max <strong>5MB</strong> · JPG, PNG, WebP
              </p>

              {/* Upload or paste URL */}
              <div className="flex gap-2">
                <input value={form.image_url} onChange={(e) => set("image_url", e.target.value)}
                  placeholder="Paste image URL, or upload below…"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-rose-300 hover:text-rose-500 disabled:opacity-50 transition-colors whitespace-nowrap">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Uploading…" : "Upload file"}
                </button>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageFile} />
              </div>

              {form.image_url && (
                <div className="relative h-24 w-full rounded-xl overflow-hidden bg-gray-100">
                  <Image src={form.image_url} alt="preview" fill className="object-cover"
                    sizes="400px" onError={() => {}} />
                  <button type="button" onClick={() => set("image_url", "")}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Video */}
          {form.type === "video" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 block">Video URL</label>
              <p className="text-xs text-gray-400">
                Paste a <strong>YouTube</strong> or <strong>Vimeo</strong> link — any format works (watch URL, share link, or embed URL). Auto-converted on save.
              </p>
              <input value={form.video_url ?? ""} onChange={(e) => set("video_url", e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
              {form.video_url && (
                <p className="text-xs text-green-600">
                  Will embed as: <code className="bg-green-50 px-1 rounded">{normalizeVideoUrl(form.video_url)}</code>
                </p>
              )}
            </div>
          )}

          {/* Badge */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Badge label</label>
            <input value={form.badge_text ?? ""} onChange={(e) => set("badge_text", e.target.value)} placeholder="Sponsored"
              className="w-36 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>

          {/* Position picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 block">Grid position</label>
            <p className="text-xs text-gray-400">
              {cityCount} cities published → {Math.ceil(cityCount / 4)} rows of 4. Choose where this card appears, or leave as Auto.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={posRow === 0} onChange={() => { setPosRow(0); set("grid_position", 0); }} />
                <span className="text-sm text-gray-600">Auto (every 4th card)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={posRow > 0} onChange={() => applyRowCol(1, 1)} />
                <span className="text-sm text-gray-600">Fixed position</span>
              </label>
            </div>

            {posRow > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Row</label>
                  <select value={posRow} onChange={(e) => applyRowCol(parseInt(e.target.value), posCol)}
                    className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-400">
                    {Array.from({ length: maxRows }, (_, i) => i + 1).map((r) => (
                      <option key={r} value={r}>Row {r}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Column</label>
                  <select value={posCol} onChange={(e) => applyRowCol(posRow, parseInt(e.target.value))}
                    className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-400">
                    {[1,2,3,4].map((c) => <option key={c} value={c}>Col {c}</option>)}
                  </select>
                </div>
                <span className="text-xs text-gray-400">
                  → slot {form.grid_position} in the grid
                </span>
              </div>
            )}

            {/* Visual grid preview */}
            {posRow > 0 && (
              <div className="grid grid-cols-4 gap-1 max-w-xs mt-1">
                {Array.from({ length: Math.max(posRow * 4, 8) }, (_, i) => {
                  const slot = i + 1;
                  const isSelected = slot === form.grid_position;
                  return (
                    <button key={slot} type="button" onClick={() => {
                      const r = Math.ceil(slot / 4);
                      const c = ((slot - 1) % 4) + 1;
                      applyRowCol(r, c);
                    }}
                      className={cn("h-7 rounded text-xs font-medium transition-all border",
                        isSelected ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-400 border-gray-200 hover:border-rose-300"
                      )}>
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
              <input type="checkbox" checked={form.opens_in_new_tab} onChange={(e) => set("opens_in_new_tab", e.target.checked)} className="rounded" />
              Open in new tab
            </label>
          </div>

          <div className="flex gap-2 pt-2 border-t border-gray-100">
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
        <p className="text-center py-12 text-gray-400 text-sm">No placements yet.</p>
      ) : (
        <div className="space-y-3">
          {placements.map((pl) => {
            const { row, col } = posToRowCol(pl.grid_position);
            return (
              <div key={pl.id} className={cn("border rounded-2xl p-4 bg-white flex items-start gap-4 group", pl.is_active ? "border-gray-100" : "border-gray-50 opacity-60")}>
                <div className="w-20 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                  {pl.type === "video" ? (
                    <div className="text-center text-xs text-gray-400">🎬 Video</div>
                  ) : pl.image_url ? (
                    <Image src={pl.image_url} alt={pl.title} width={80} height={56} className="object-cover w-full h-full" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm">{pl.title}</p>
                    {pl.badge_text && <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full font-medium">{pl.badge_text}</span>}
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{pl.type}</span>
                    <span className="text-xs text-gray-400">
                      {pl.grid_position > 0 ? `Row ${row}, Col ${col}` : "Auto"}
                    </span>
                  </div>
                  {pl.subtitle && <p className="text-xs text-gray-500 mt-0.5">{pl.subtitle}</p>}
                  <a href={pl.cta_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-rose-400 hover:underline flex items-center gap-1 mt-1">
                    {pl.cta_label ?? "Learn more"} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActive(pl.id, pl.is_active)}>
                    {pl.is_active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-300" />}
                  </button>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(pl)} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-3.5 h-3.5 text-gray-400" /></button>
                    <button onClick={() => remove(pl.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
