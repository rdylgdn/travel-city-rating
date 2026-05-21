"use client";

import { useEffect, useState } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Props = {
  targetUserId: string;
};

export default function ReviewAuthorFollow({ targetUserId }: Props) {
  const supabase = createClient();
  const [state, setState] = useState<"loading" | "follow" | "following" | "own" | "guest">("loading");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id;
      if (!uid) { setState("guest"); return; }
      if (uid === targetUserId) { setState("own"); return; }
      const { data: row } = await supabase.from("follows")
        .select("id").eq("follower_id", uid).eq("following_id", targetUserId).single();
      setState(row ? "following" : "follow");
    });
  }, [targetUserId]);

  async function toggle() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (state === "following") {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetUserId);
      setState("follow");
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: targetUserId });
      setState("following");
    }
  }

  if (state === "loading" || state === "own" || state === "guest") return null;

  return (
    <button onClick={toggle}
      className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-all ${
        state === "following"
          ? "text-gray-400 hover:text-red-400 hover:bg-red-50"
          : "text-rose-500 hover:bg-rose-50"
      }`}>
      {state === "following"
        ? <UserMinus className="w-3 h-3" />
        : <UserPlus className="w-3 h-3" />}
      {state === "following" ? "Following" : "Follow"}
    </button>
  );
}
