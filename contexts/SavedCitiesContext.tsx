"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { BudgetMode } from "@/lib/types";

type SavedCitiesContextValue = {
  saved: Map<string, BudgetMode>;
  toggle: (slug: string, budgetMode: BudgetMode) => Promise<"saved" | "unsaved" | "unauthenticated">;
  loading: boolean;
  isLoggedIn: boolean;
};

const SavedCitiesContext = createContext<SavedCitiesContextValue>({
  saved: new Map(),
  toggle: async () => "unauthenticated",
  loading: true,
  isLoggedIn: false,
});

export function SavedCitiesProvider({ children }: { children: React.ReactNode }) {
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
    budgetMode: BudgetMode
  ): Promise<"saved" | "unsaved" | "unauthenticated"> => {
    if (!userId) return "unauthenticated";

    const isSaved = saved.has(citySlug);

    setSaved((prev) => {
      const next = new Map(prev);
      isSaved ? next.delete(citySlug) : next.set(citySlug, budgetMode);
      return next;
    });

    if (isSaved) {
      await supabase.from("saved_cities").delete()
        .eq("user_id", userId).eq("city_slug", citySlug);
    } else {
      await supabase.from("saved_cities")
        .insert({ user_id: userId, city_slug: citySlug, budget_mode: budgetMode });
    }

    return isSaved ? "unsaved" : "saved";
  }, [userId, saved]);

  return (
    <SavedCitiesContext.Provider value={{ saved, toggle, loading, isLoggedIn: !!userId }}>
      {children}
    </SavedCitiesContext.Provider>
  );
}

export function useSavedCities() {
  return useContext(SavedCitiesContext);
}
