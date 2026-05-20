"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Check } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Profile } from "@/lib/profile";
import { COUNTRIES } from "@/lib/countries";
import { TravelStyle } from "@/lib/types";
import { cn } from "@/lib/utils";

const TRAVEL_STYLES: TravelStyle[] = [
  "Solo", "Couple", "Honeymoon", "Friends", "Family",
  "Backpacking", "Adventure", "Culture", "Nature", "Food",
  "Nightlife", "Beach", "Digital Nomad", "Luxury",
];

type Props = {
  userId: string;
  profile: Profile | null;
  displayEmail: string;
};

export default function ProfileEditor({ userId, profile, displayEmail }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url ?? null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [homeCountry, setHomeCountry] = useState(profile?.home_country ?? "");
  const [homeFlag, setHomeFlag] = useState(profile?.home_country_flag ?? "");
  const [styles, setStyles] = useState<TravelStyle[]>((profile?.travel_styles as TravelStyle[]) ?? []);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countrySearch, setCountrySearch] = useState(profile?.home_country ?? "");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function toggleStyle(s: TravelStyle) {
    setStyles((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  function selectCountry(name: string, flag: string) {
    setHomeCountry(name);
    setHomeFlag(flag);
    setCountrySearch(name);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      let avatarUrl = profile?.avatar_url ?? null;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${userId}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        if (uploadErr) { setError("Avatar upload failed."); return; }
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        avatarUrl = urlData.publicUrl;
      }

      const { error: upsertErr } = await supabase.from("profiles").upsert({
        id: userId,
        display_name: displayName || null,
        bio: bio || null,
        home_country: homeCountry || null,
        home_country_flag: homeFlag || null,
        travel_styles: styles.length ? styles : null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (upsertErr) { setError(upsertErr.message); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    });
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) { setPwSaved(true); setCurrentPassword(""); setNewPassword(""); setTimeout(() => setPwSaved(false), 2500); }
  }

  const filteredCountries = countrySearch.trim()
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(countrySearch.toLowerCase())).slice(0, 8)
    : [];

  const showDropdown = countrySearch.trim() !== "" && countrySearch !== homeCountry && filteredCountries.length > 0;

  return (
    <div className="max-w-lg space-y-8">

      {/* Avatar + name + bio */}
      <form onSubmit={handleSave} className="space-y-5">
        <h3 className="text-sm font-semibold text-gray-700">Profile</h3>

        {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-rose-100 overflow-hidden flex items-center justify-center">
              {avatarPreview ? (
                <Image src={avatarPreview} alt="Avatar" fill className="object-cover" sizes="80px" />
              ) : (
                <span className="text-rose-600 font-bold text-2xl">
                  {(displayName || displayEmail).slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center shadow hover:bg-rose-600 transition-colors">
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Click the camera icon to upload a photo.</p>
            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or WebP · Max 5MB</p>
          </div>
        </div>

        {/* Display name */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Display name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How should we call you?"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
        </div>

        {/* Bio */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Bio</label>
          <input value={bio} onChange={(e) => setBio(e.target.value)}
            placeholder='e.g. "Solo traveler · 12 countries · Based in Istanbul"'
            maxLength={100}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          <p className="text-xs text-gray-400 mt-1">{bio.length}/100</p>
        </div>

        {/* Home country */}
        <div className="relative">
          <label className="text-sm font-medium text-gray-700 block mb-1">Home country</label>
          <div className="relative">
            {homeFlag && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg leading-none">{homeFlag}</span>
            )}
            <input
              value={countrySearch}
              onChange={(e) => { setCountrySearch(e.target.value); if (e.target.value !== homeCountry) { setHomeCountry(""); setHomeFlag(""); } }}
              placeholder="Search your country…"
              className={cn(
                "w-full py-2.5 pr-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400",
                homeFlag ? "pl-10" : "pl-3"
              )}
            />
          </div>
          {showDropdown && (
            <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
              {filteredCountries.map((c) => (
                <button key={c.iso2} type="button" onClick={() => selectCountry(c.name, c.flag)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left transition-colors">
                  <span className="text-lg leading-none">{c.flag}</span>
                  <span className="text-sm text-gray-700">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Travel styles */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Travel styles</label>
          <div className="flex flex-wrap gap-2">
            {TRAVEL_STYLES.map((s) => (
              <button key={s} type="button" onClick={() => toggleStyle(s)}
                className={cn("px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                  styles.includes(s) ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
                )}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={isPending}
          className={cn("px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
            saved ? "bg-green-500 text-white" : "bg-rose-500 text-white hover:bg-rose-600",
            isPending && "opacity-60 cursor-not-allowed"
          )}>
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save profile"}
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={handlePasswordChange} className="space-y-4 pt-6 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Change password</h3>
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">New password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
        </div>
        <button type="submit" disabled={newPassword.length < 6}
          className={cn("px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
            pwSaved ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40"
          )}>
          {pwSaved ? "Updated!" : "Update password"}
        </button>
      </form>

      {/* Danger zone */}
      <div className="border border-red-100 rounded-xl p-4 space-y-2 pt-6">
        <h3 className="text-sm font-semibold text-red-600">Danger zone</h3>
        <p className="text-xs text-gray-400">Deleting your account removes all your data permanently.</p>
        <button className="text-sm text-red-500 font-medium hover:underline">Delete my account</button>
      </div>
    </div>
  );
}
