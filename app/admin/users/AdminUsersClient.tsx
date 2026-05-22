"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, CheckCircle2, User, ChevronDown } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

type UserRole = "user" | "verified" | "admin";

type UserRow = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  home_country: string | null;
  home_country_flag: string | null;
  role: UserRole;
  reviewCount: number;
  approvedReviewCount: number;
};

const ROLE_STYLES: Record<UserRole, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  admin:    { label: "Admin",    bg: "bg-purple-100", text: "text-purple-700", icon: Shield },
  verified: { label: "Verified", bg: "bg-blue-50",    text: "text-blue-600",  icon: CheckCircle2 },
  user:     { label: "User",     bg: "bg-gray-100",   text: "text-gray-500",  icon: User },
};

type FilterRole = "all" | UserRole;

export default function AdminUsersClient({ users: initial }: { users: UserRow[] }) {
  const supabase = createClient();
  const [users, setUsers] = useState<UserRow[]>(initial);
  const [filter, setFilter] = useState<FilterRole>("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = filter === "all" ? users : users.filter((u) => u.role === filter);
  const counts = {
    all: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    verified: users.filter((u) => u.role === "verified").length,
    user: users.filter((u) => u.role === "user").length,
  };

  async function changeRole(userId: string, newRole: UserRole) {
    setUpdating(userId);
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    setUpdating(null);
  }

  const filterTabs: { id: FilterRole; label: string }[] = [
    { id: "all",      label: `All (${counts.all})` },
    { id: "admin",    label: `Admin (${counts.admin})` },
    { id: "verified", label: `Verified (${counts.verified})` },
    { id: "user",     label: `Users (${counts.user})` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-400 mt-1">Manage user roles. Verified is auto-granted at 10 approved reviews.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-full p-1 w-fit overflow-x-auto">
        {filterTabs.map(({ id, label }) => (
          <button key={id} onClick={() => setFilter(id)}
            className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              filter === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}>
            {label}
          </button>
        ))}
      </div>

      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Reviews</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 text-right">Change role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((user) => {
              const style = ROLE_STYLES[user.role];
              const IconComp = style.icon;
              const displayName = user.display_name ?? user.username ?? user.id.slice(0, 8);
              const profileHref = user.username ? `/u/${user.username}` : `/u/${user.id}`;

              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-3">
                    <Link href={profileHref} target="_blank" className="flex items-center gap-3 hover:opacity-80">
                      <div className="w-8 h-8 rounded-full bg-rose-100 overflow-hidden flex items-center justify-center shrink-0">
                        {user.avatar_url ? (
                          <Image src={user.avatar_url} alt={displayName} width={32} height={32} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-rose-600 font-bold text-xs">{displayName.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{displayName}</p>
                        {user.home_country && (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <span>{user.home_country_flag}</span>{user.home_country}
                          </p>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full", style.bg, style.text)}>
                      <IconComp className="w-3 h-3" />
                      {style.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600">{user.approvedReviewCount} approved</span>
                    {user.approvedReviewCount < user.reviewCount && (
                      <span className="text-gray-400"> / {user.reviewCount} total</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <select
                        value={user.role}
                        disabled={updating === user.id}
                        onChange={(e) => changeRole(user.id, e.target.value as UserRole)}
                        className={cn(
                          "appearance-none pl-3 pr-7 py-1.5 rounded-lg border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-rose-400",
                          user.role === "admin"    && "border-purple-200 bg-purple-50 text-purple-700",
                          user.role === "verified" && "border-blue-200 bg-blue-50 text-blue-600",
                          user.role === "user"     && "border-gray-200 bg-white text-gray-600",
                          updating === user.id     && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <option value="user">User</option>
                        <option value="verified">Verified</option>
                        <option value="admin">Admin</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-center py-8 text-gray-400 text-sm">No users in this category.</p>
        )}
      </div>
    </div>
  );
}
