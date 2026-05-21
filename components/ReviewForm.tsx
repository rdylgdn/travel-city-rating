"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, CheckCircle2, ChevronDown, ImagePlus } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { TravelStyle } from "@/lib/types";
import { cn } from "@/lib/utils";

const TRAVEL_STYLES: TravelStyle[] = [
  "Solo", "Couple", "Honeymoon", "Friends", "Family",
  "Backpacking", "Adventure", "Culture", "Food", "Nightlife", "Beach",
];

const BUDGET_OPTIONS = [
  { value: "budget", label: "Budget" },
  { value: "midRange", label: "Mid-range" },
  { value: "luxury", label: "Luxury" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CATEGORY_SCORES = [
  { key: "score_cost_value", label: "Cost / Value" },
  { key: "score_safety", label: "Safety" },
  { key: "score_food", label: "Food" },
  { key: "score_culture", label: "Culture" },
  { key: "score_nature", label: "Nature" },
  { key: "score_nightlife", label: "Nightlife" },
  { key: "score_ease_of_travel", label: "Ease of Travel" },
] as const;

export type ExistingReview = {
  travelStyle?: string | null;
  budgetCategory?: string | null;
  monthVisited?: string | null;
  overallRating?: number | null;
  categoryScores?: Partial<Record<ScoreKey, number>>;
  writtenReview?: string | null;
  pros?: string[];
  cons?: string[];
  imageUrls?: string[];
};

type Props = {
  citySlug: string;
  userEmail: string;
  userId: string;
  existingReview?: ExistingReview;
  onSuccess?: () => void;
};

type ScoreKey = typeof CATEGORY_SCORES[number]["key"];

function parseMonthYear(val?: string | null): { month: string; year: string } {
  if (!val) return { month: "", year: String(new Date().getFullYear()) };
  const parts = val.split(" ");
  return { month: parts[0] ?? "", year: parts[1] ?? String(new Date().getFullYear()) };
}

export default function ReviewForm({ citySlug, userEmail, userId, existingReview, onSuccess }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!existingReview;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const { month: initMonth, year: initYear } = parseMonthYear(existingReview?.monthVisited);

  const [expanded, setExpanded] = useState(isEditing);
  const [travelStyle, setTravelStyle] = useState<TravelStyle | null>((existingReview?.travelStyle as TravelStyle) ?? null);
  const [budgetCategory, setBudgetCategory] = useState<string | null>(existingReview?.budgetCategory ?? null);
  const [month, setMonth] = useState(initMonth);
  const [year, setYear] = useState(initYear);
  const [overallRating, setOverallRating] = useState<number | null>(existingReview?.overallRating ?? null);
  const [categoryScores, setCategoryScores] = useState<Partial<Record<ScoreKey, number>>>(existingReview?.categoryScores ?? {});
  const [writtenReview, setWrittenReview] = useState(existingReview?.writtenReview ?? "");
  const [pros, setPros] = useState<string[]>(existingReview?.pros?.length ? existingReview.pros : [""]);
  const [cons, setCons] = useState<string[]>(existingReview?.cons?.length ? existingReview.cons : [""]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(existingReview?.imageUrls ?? []);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(existingReview?.imageUrls ?? []);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = 4 - imagePreviews.length;
    const selected = files.slice(0, remaining);
    setImageFiles((prev) => [...prev, ...selected]);
    selected.forEach((f) => {
      const url = URL.createObjectURL(f);
      setImagePreviews((prev) => [...prev, url]);
    });
    e.target.value = "";
  }

  function removeImage(i: number) {
    const isExisting = i < existingImageUrls.length;
    if (isExisting) {
      setExistingImageUrls((prev) => prev.filter((_, j) => j !== i));
    } else {
      const fileIdx = i - existingImageUrls.length;
      setImageFiles((prev) => prev.filter((_, j) => j !== fileIdx));
    }
    setImagePreviews((prev) => prev.filter((_, j) => j !== i));
  }

  function updatePro(i: number, val: string) { setPros((p) => p.map((x, j) => j === i ? val : x)); }
  function updateCon(i: number, val: string) { setCons((c) => c.map((x, j) => j === i ? val : x)); }
  function removePro(i: number) { setPros((p) => p.filter((_, j) => j !== i)); }
  function removeCon(i: number) { setCons((c) => c.filter((_, j) => j !== i)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!overallRating || !travelStyle) return;
    setLoading(true);
    setError(null);

    const cleanPros = pros.filter((p) => p.trim());
    const cleanCons = cons.filter((c) => c.trim());
    const monthVisited = month && year ? `${month} ${year}` : null;

    // Upload new images to Supabase Storage
    const uploadedUrls: string[] = [...existingImageUrls];
    for (const file of imageFiles) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${citySlug}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("review-images").upload(path, file);
      if (uploadErr) {
        setError(`Image upload failed: ${uploadErr.message}`);
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("review-images").getPublicUrl(path);
      uploadedUrls.push(urlData.publicUrl);
    }

    const { error: err } = await supabase.from("reviews").upsert({
      city_slug: citySlug,
      user_id: userId,
      user_email: userEmail,
      travel_style: travelStyle,
      budget_category: budgetCategory,
      month_visited: monthVisited,
      overall_rating: overallRating,
      ...categoryScores,
      written_review: writtenReview || null,
      pros: cleanPros.length ? cleanPros : null,
      cons: cleanCons.length ? cleanCons : null,
      image_urls: uploadedUrls.length ? uploadedUrls : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,city_slug" });

    setLoading(false);
    if (err) { setError(err.message); return; }

    if (onSuccess) {
      onSuccess();
    } else {
      setSubmitted(true);
    }
    router.refresh();
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="font-semibold text-green-700">{isEditing ? "Review updated!" : "Review submitted!"}</p>
        <p className="text-sm text-green-600 mt-1">Thanks — your ratings influence this city's scores.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-100 rounded-2xl overflow-hidden">
      {/* Header — always visible */}
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 text-base">{isEditing ? "Edit your review" : "Submit a review"}</h3>
        <p className="text-xs text-gray-400 mt-0.5">Your ratings directly influence this city's scores.</p>
      </div>

      <div className="p-5 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      {/* Overall rating — always shown first */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">Overall rating *</label>
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button" onClick={() => { setOverallRating(n); setExpanded(true); }}
              className={cn("w-10 h-10 rounded-xl text-sm font-semibold border transition-all",
                overallRating === n ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
              )}>
              {n}
            </button>
          ))}
        </div>
        {!expanded && (
          <p className="text-xs text-gray-400 mt-2">Pick a score to continue filling out your review.</p>
        )}
      </div>

      {/* Expanded form — shown after overall rating is picked */}
      {expanded && <>

      {/* Travel style */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">Travel style *</label>
        <div className="flex flex-wrap gap-2">
          {TRAVEL_STYLES.map((s) => (
            <button key={s} type="button" onClick={() => setTravelStyle(s)}
              className={cn("px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                travelStyle === s ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
              )}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Budget + month */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Budget category</label>
          <div className="flex flex-col gap-1.5">
            {BUDGET_OPTIONS.map((b) => (
              <button key={b.value} type="button" onClick={() => setBudgetCategory(b.value)}
                className={cn("px-3 py-1.5 rounded-xl text-sm font-medium border transition-all text-left",
                  budgetCategory === b.value ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
                )}>
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-gray-700 block mb-2">When did you visit?</label>
          <div className="flex gap-2">
            <select value={month} onChange={(e) => setMonth(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white">
              <option value="">Month</option>
              {MONTHS.map((m) => <option key={m}>{m}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)}
              className="w-24 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white">
              {years.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Category scores */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-3">Category scores <span className="text-gray-400 font-normal">(optional but helpful)</span></label>
        <div className="space-y-3">
          {CATEGORY_SCORES.map(({ key, label }) => {
            const val = categoryScores[key] ?? null;
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32 shrink-0">{label}</span>
                <div className="flex gap-1 flex-wrap">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button key={n} type="button"
                      onClick={() => setCategoryScores((prev) => ({ ...prev, [key]: val === n ? undefined : n }))}
                      className={cn("w-7 h-7 rounded-lg text-xs font-semibold border transition-all",
                        val === n ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-500 border-gray-200 hover:border-rose-300"
                      )}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Written review */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">Your review <span className="text-gray-400 font-normal">(optional)</span></label>
        <textarea value={writtenReview} onChange={(e) => setWrittenReview(e.target.value)} rows={4}
          placeholder="Share your experience…"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
      </div>

      {/* Pros */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-green-600 block mb-2">Pros</label>
          <div className="space-y-2">
            {pros.map((pro, i) => (
              <div key={i} className="flex gap-2">
                <input value={pro} onChange={(e) => updatePro(i, e.target.value)} placeholder={`Pro ${i + 1}`}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                {pros.length > 1 && (
                  <button type="button" onClick={() => removePro(i)} className="p-2 rounded-xl hover:bg-red-50">
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </button>
                )}
              </div>
            ))}
            {pros.length < 4 && (
              <button type="button" onClick={() => setPros((p) => [...p, ""])}
                className="flex items-center gap-1 text-xs text-green-600 hover:underline">
                <Plus className="w-3 h-3" /> Add pro
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-red-500 block mb-2">Cons</label>
          <div className="space-y-2">
            {cons.map((con, i) => (
              <div key={i} className="flex gap-2">
                <input value={con} onChange={(e) => updateCon(i, e.target.value)} placeholder={`Con ${i + 1}`}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                {cons.length > 1 && (
                  <button type="button" onClick={() => removeCon(i)} className="p-2 rounded-xl hover:bg-red-50">
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </button>
                )}
              </div>
            ))}
            {cons.length < 4 && (
              <button type="button" onClick={() => setCons((c) => [...c, ""])}
                className="flex items-center gap-1 text-xs text-red-500 hover:underline">
                <Plus className="w-3 h-3" /> Add con
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Photo upload */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">
          Add photos <span className="text-gray-400 font-normal">(up to 4)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {imagePreviews.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
              <Image src={src} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="80px" />
              <button type="button" onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {imagePreviews.length < 4 && (
            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-rose-300 hover:bg-rose-50 transition-all">
              <ImagePlus className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] text-gray-400 mt-1">Add photo</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
            </label>
          )}
        </div>
      </div>

      <button type="submit" disabled={loading || !overallRating || !travelStyle}
        className="w-full py-3 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isEditing ? "Update review" : "Submit review"}
      </button>

      </>}
      </div>
    </form>
  );
}
