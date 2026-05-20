"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

export function useSavedCities() {
  const supabase = createClient();
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) { setLoading(false); return; }

      supabase
        .from("saved_cities")
        .select("city_slug")
        .eq("user_id", uid)
        .then(({ data: rows }) => {
          setSavedSlugs(new Set((rows ?? []).map((r) => r.city_slug)));
          setLoading(false);
        });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (!uid) { setSavedSlugs(new Set()); setLoading(false); return; }

      supabase
        .from("saved_cities")
        .select("city_slug")
        .eq("user_id", uid)
        .then(({ data: rows }) => {
          setSavedSlugs(new Set((rows ?? []).map((r) => r.city_slug)));
        });
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggle = useCallback(async (citySlug: string): Promise<"saved" | "unsaved" | "unauthenticated"> => {
    if (!userId) return "unauthenticated";

    const isSaved = savedSlugs.has(citySlug);

    // Optimistic update
    setSavedSlugs((prev) => {
      const next = new Set(prev);
      isSaved ? next.delete(citySlug) : next.add(citySlug);
      return next;
    });

    if (isSaved) {
      await supabase
        .from("saved_cities")
        .delete()
        .eq("user_id", userId)
        .eq("city_slug", citySlug);
    } else {
      await supabase
        .from("saved_cities")
        .insert({ user_id: userId, city_slug: citySlug });
    }

    return isSaved ? "unsaved" : "saved";
  }, [userId, savedSlugs]);

  return { savedSlugs, toggle, loading, isLoggedIn: !!userId };
}
