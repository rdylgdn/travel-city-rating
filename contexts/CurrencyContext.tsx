"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { formatPrice } from "@/lib/currencies";

type CurrencyContextValue = {
  currency: string;
  setCurrency: (code: string) => Promise<void>;
  format: (usdAmount: number) => string;
  isLoggedIn: boolean;
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "USD",
  setCurrency: async () => {},
  format: (n) => `$${n}`,
  isLoggedIn: false,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [currency, setCurrencyState] = useState("USD");
  const [userId, setUserId] = useState<string | null>(null);

  async function loadCurrency(uid: string) {
    const { data } = await supabase
      .from("profiles")
      .select("currency")
      .eq("id", uid)
      .single();
    if (data?.currency) setCurrencyState(data.currency);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) loadCurrency(uid);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (!uid) { setCurrencyState("USD"); return; }
      loadCurrency(uid);
    });

    return () => subscription.unsubscribe();
  }, []);

  const setCurrency = useCallback(async (code: string) => {
    if (!userId) return;
    setCurrencyState(code);
    await supabase.from("profiles").upsert({
      id: userId,
      currency: code,
      updated_at: new Date().toISOString(),
    });
  }, [userId]);

  const format = useCallback(
    (usdAmount: number) => formatPrice(usdAmount, currency),
    [currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, isLoggedIn: !!userId }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
