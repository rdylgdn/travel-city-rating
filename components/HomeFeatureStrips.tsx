import Link from "next/link";
import { BarChart2, Briefcase, Users } from "lucide-react";

const features = [
  {
    icon: BarChart2,
    color: "#60A5FA",
    title: "Compare Cities",
    desc: "See how cities stack up side by side by scores, budget, and vibe.",
    cta: "Start Comparing",
    href: "/compare",
    bg: "#60A5FA11",
    border: "#60A5FA33",
  },
  {
    icon: Briefcase,
    color: "#A78BFA",
    title: "Plan Your Trip",
    desc: "Generate AI itineraries and book accommodation together.",
    cta: "Create a Trip",
    href: "/trips",
    bg: "#A78BFA11",
    border: "#A78BFA33",
  },
  {
    icon: Users,
    color: "#4ADE80",
    title: "Join the Community",
    desc: "Share experiences, get tips, and travel better together.",
    cta: "Explore Community",
    href: "/",
    bg: "#4ADE8011",
    border: "#4ADE8033",
  },
];

export default function HomeFeatureStrips() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {features.map(({ icon: Icon, color, title, desc, cta, href, bg, border }) => (
          <div key={title} className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: bg, border: `1px solid ${border}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: color + "22" }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <h3 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
            </div>
            <Link href={href}
              className="mt-auto w-fit px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: color + "22", color, border: `1px solid ${color}44` }}>
              {cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
