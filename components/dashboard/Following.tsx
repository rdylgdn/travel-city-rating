"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { UserMinus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getTravelerBadge } from "@/lib/profile";
import { cn } from "@/lib/utils";

export type FollowingUser = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  home_country: string | null;
  home_country_flag: string | null;
  travel_styles: string[] | null;
  visitedCountryCount: number;
};

export default function Following({ initialUsers }: { initialUsers: FollowingUser[] }) {
  const supabase = createClient();
  const [users, setUsers] = useState(initialUsers);

  async function unfollow(targetId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetId);
    setUsers((prev) => prev.filter((u) => u.id !== targetId));
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">You're not following anyone yet.</p>
        <p className="text-xs text-gray-300 mt-1">Follow travelers from their profile page or review cards.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((u) => {
        const badge = getTravelerBadge(u.visitedCountryCount);
        const displayName = u.display_name ?? u.username ?? "Traveler";
        const initials = displayName.slice(0, 2).toUpperCase();
        const profileHref = u.username ? `/u/${u.username}` : `/u/${u.id}`;

        return (
          <div key={u.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 transition-all">
            <Link href={profileHref} className="shrink-0">
              <div className="w-11 h-11 rounded-full bg-rose-100 overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-rose-300 transition-all">
                {u.avatar_url ? (
                  <Image src={u.avatar_url} alt={displayName} width={44} height={44} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-rose-600 font-bold text-sm">{initials}</span>
                )}
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={profileHref} className="font-semibold text-gray-800 text-sm hover:text-rose-500 transition-colors">
                  {displayName}
                </Link>
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", badge.bg, badge.color)}>
                  {badge.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {u.home_country && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <span>{u.home_country_flag}</span>{u.home_country}
                  </span>
                )}
                {u.visitedCountryCount > 0 && (
                  <span className="text-xs text-gray-400">{u.visitedCountryCount} {u.visitedCountryCount === 1 ? "country" : "countries"}</span>
                )}
              </div>
              {u.travel_styles && u.travel_styles.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {u.travel_styles.slice(0, 3).map((s) => (
                    <span key={s} className="text-[10px] px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href={profileHref} className="text-xs text-rose-500 hover:underline font-medium">
                View
              </Link>
              <button onClick={() => unfollow(u.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Unfollow">
                <UserMinus className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
