"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogIn } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CURRENCY_LIST } from "@/lib/currencies";
import AuthModal from "./AuthModal";
import { cn } from "@/lib/utils";

export default function CurrencySelector() {
  const { currency, setCurrency, isLoggedIn } = useCurrency();
  const [open, setOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowAuthPrompt(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleOpen() {
    if (!isLoggedIn) {
      setShowAuthPrompt(!showAuthPrompt);
      setOpen(false);
    } else {
      setOpen(!open);
      setShowAuthPrompt(false);
    }
  }

  async function handleSelect(code: string) {
    await setCurrency(code);
    setOpen(false);
  }

  const currentInfo = CURRENCY_LIST.find((c) => c.code === currency);

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={handleOpen}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
        >
          <span>{currentInfo?.symbol.trim()}</span>
          <span>{currency}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {/* Guest prompt */}
        {showAuthPrompt && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg p-4 z-50 text-center">
            <p className="text-sm font-semibold text-gray-800 mb-1">Sign in to change currency</p>
            <p className="text-xs text-gray-400 mb-3">Your preference will be saved for future visits.</p>
            <button
              onClick={() => { setShowAuthPrompt(false); setShowAuth(true); }}
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign in
            </button>
          </div>
        )}

        {/* Currency dropdown for signed-in users */}
        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="max-h-72 overflow-y-auto py-1">
              {CURRENCY_LIST.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleSelect(c.code)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors",
                    currency === c.code ? "text-rose-600 font-semibold bg-rose-50" : "text-gray-700"
                  )}
                >
                  <span>{c.code} — {c.name}</span>
                  <span className="text-gray-400 font-medium">{c.symbol.trim()}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultMode="signin" />}
    </>
  );
}
