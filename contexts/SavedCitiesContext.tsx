"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { BudgetMode } from "@/lib/types";

type SavedCitiesContextValue = {
  saved: Map<string, BudgetMode>;
  visited: Set<string>;
  toggleSaved: (slug: string, budgetMode: BudgetMode) => Promise<"saved" | "unsaved" | "unauthenticated">;
  toggleVisited: (slug: string) => Promise<"visited" | "unvisited" | "unauthenticated">;
  loading: boolean;
  isLoggedIn: boolean;
};

const SavedCitiesContext = createContext<SavedCitiesContextValue>({
  saved: new Map(),
  visited: new Set(),
  toggleSaved: async () => "unauthenticated",
  toggleVisited: async () => "unauthenticated",
  loading: true,
  isLoggedIn: false,
});

export function SavedCitiesProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [saved, setSaved] = useState<Map<string, BudgetMode>>(new Map());
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchAll(uid: string) {
    const [savedRes, visitedRes] = await Promise.all([
      supabase.from("saved_cities").select("city_slug, budget_mode").eq("user_id", uid),
      supabase.from("visited_cities").select("city_slug").eq("user_id", uid),
    ]);
    const savedMap = new Map<string, BudgetMode>();
    (savedRes.data ?? []).forEach((r) => savedMap.set(r.city_slug, r.budget_mode as BudgetMode));
    setSaved(savedMap);
    setVisited(new Set((visitedRes.data ?? []).map((r) => r.city_slug)));
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) fetchAll(uid).finally(() => setLoading(false));
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (!uid) { setSaved(new Map()); setVisited(new Set()); setLoading(false); return; }
      fetchAll(uid);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleSaved = useCallback(async (
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
      await supabase.from("saved_cities").delete().eq("user_id", userId).eq("city_slug", citySlug);
    } else {
      await supabase.from("saved_cities").insert({ user_id: userId, city_slug: citySlug, budget_mode: budgetMode });
    }
    return isSaved ? "unsaved" : "saved";
  }, [userId, saved]);

  const toggleVisited = useCallback(async (
    citySlug: string
  ): Promise<"visited" | "unvisited" | "unauthenticated"> => {
    if (!userId) return "unauthenticated";
    const isVisited = visited.has(citySlug);
    setVisited((prev) => {
      const next = new Set(prev);
      isVisited ? next.delete(citySlug) : next.add(citySlug);
      return next;
    });
    if (isVisited) {
      await supabase.from("visited_cities").delete().eq("user_id", userId).eq("city_slug", citySlug);
    } else {
      await supabase.from("visited_cities").insert({ user_id: userId, city_slug: citySlug });
    }
    return isVisited ? "unvisited" : "visited";
  }, [userId, visited]);

  return (
    <SavedCitiesContext.Provider value={{ saved, visited, toggleSaved, toggleVisited, loading, isLoggedIn: !!userId }}>
      {children}
    </SavedCitiesContext.Provider>
  );
}

export function useSavedCities() {
  return useContext(SavedCitiesContext);
}
