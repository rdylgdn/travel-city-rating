"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import AuthModal from "./AuthModal";

export default function ReviewSignInPrompt() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <div className="border border-gray-100 rounded-xl px-4 py-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">Sign in to leave a review and influence this city's scores.</p>
        <button
          onClick={() => setShowAuth(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors shrink-0 ml-3"
        >
          <LogIn className="w-4 h-4" />
          Sign in
        </button>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultMode="signin" />}
    </>
  );
}
