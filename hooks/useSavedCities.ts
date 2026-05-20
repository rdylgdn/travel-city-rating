"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { BudgetMode } from "@/lib/types";

type SavedEntry = { slug: string; budgetMode: BudgetMode };

export function useSavedCities() {
  const supabase = createClient();
  const [saved, setSaved] = useState<Map<string, BudgetMode>>(new Map());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchSaved(uid: string) {
    const { data: rows } = await supabase
      .from("saved_cities")
      .select("city_slug, budget_mode")
      .eq("user_id", uid);
    const map = new Map<string, BudgetMode>();
    (rows ?? []).forEach((r) => map.set(r.city_slug, r.budget_mode as BudgetMode));
    setSaved(map);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) fetchSaved(uid).finally(() => setLoading(false));
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (!uid) { setSaved(new Map()); setLoading(false); return; }
      fetchSaved(uid);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggle = useCallback(async (
    citySlug: string,
    budgetMode: BudgetMode = "budget"
  ): Promise<"saved" | "unsaved" | "unauthenticated"> => {
    if (!userId) return "unauthenticated";

    const isSaved = saved.has(citySlug);

    // Optimistic update
    setSaved((prev) => {
      const next = new Map(prev);
      isSaved ? next.delete(citySlug) : next.set(citySlug, budgetMode);
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
        .insert({ user_id: userId, city_slug: citySlug, budget_mode: budgetMode });
    }

    return isSaved ? "unsaved" : "saved";
  }, [userId, saved]);

  return { saved, toggle, loading, isLoggedIn: !!userId };
}
