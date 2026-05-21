"use client";

import { useState } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

type Props = {
  targetUserId: string;
  currentUserId: string;
  initialIsFollowing: boolean;
};

export default function FollowButton({ targetUserId, currentUserId, initialIsFollowing }: Props) {
  const supabase = createClient();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    if (isFollowing) {
      await supabase.from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", targetUserId);
    } else {
      await supabase.from("follows")
        .insert({ follower_id: currentUserId, following_id: targetUserId });
    }
    setIsFollowing(!isFollowing);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
        isFollowing
          ? "border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500 bg-white"
          : "bg-rose-500 text-white hover:bg-rose-600",
        loading && "opacity-60 cursor-not-allowed"
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="w-4 h-4" />
      ) : (
        <UserPlus className="w-4 h-4" />
      )}
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
