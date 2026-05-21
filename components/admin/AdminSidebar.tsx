"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Globe, Inbox, MessageSquare, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/cities", label: "Cities", icon: Globe, exact: false },
  { href: "/admin/suggestions", label: "Suggestions", icon: Inbox, exact: false },
  { href: "/admin/reviews",   label: "Reviews",   icon: MessageSquare,     exact: false },
  { href: "/admin/settings",  label: "Settings",  icon: SlidersHorizontal, exact: false },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-gray-100 min-h-[calc(100vh-56px)] bg-gray-50">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6 px-2">
          <ShieldCheck className="w-4 h-4 text-rose-500" />
          <span className="text-sm font-semibold text-gray-700">Admin</span>
        </div>
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-rose-50 text-rose-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
