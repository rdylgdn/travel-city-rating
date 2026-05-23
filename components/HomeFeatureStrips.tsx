import Link from "next/link";
import Image from "next/image";
import { cities as seedCities } from "@/lib/seed-data";

const compareDuo = [
  seedCities.find((c) => c.slug === "tokyo"),
  seedCities.find((c) => c.slug === "lisbon"),
];
const tripChain = [
  seedCities.find((c) => c.slug === "tokyo"),
  seedCities.find((c) => c.slug === "bali") ?? seedCities[1],
  seedCities.find((c) => c.slug === "bangkok") ?? seedCities[2],
];

export default function HomeFeatureStrips() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <CompareCard />
        <PlanTripCard />
        <CommunityCard />
      </div>
    </section>
  );
}

/* ─────────────────────────────── Compare Cities ─────── */
function CompareCard() {
  const [a, b] = compareDuo;
  if (!a || !b) return null;
  return (
    <div className="rounded-3xl overflow-hidden flex flex-col transition-all hover:-translate-y-1"
      style={{
        background: "linear-gradient(135deg, #EBF4FF 0%, #F5F0FF 100%)",
        border: "1px solid #60A5FA33",
        boxShadow: "0 4px 16px rgba(96,165,250,0.10)",
      }}>
      <div className="p-5 pb-3">
        {/* Two cities with VS badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 flex flex-col items-center">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden mb-1.5 ring-2 ring-white shadow-md">
              <Image src={a.imageUrl} alt={a.name} fill className="object-cover" sizes="56px" />
            </div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{a.name}</p>
            <span className="text-[10px] font-bold text-blue-600">{a.scores.overall.toFixed(1)}</span>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs text-white shadow-lg shrink-0"
            style={{ background: "linear-gradient(135deg, #60A5FA, #818CF8)" }}>
            VS
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden mb-1.5 ring-2 ring-white shadow-md">
              <Image src={b.imageUrl} alt={b.name} fill className="object-cover" sizes="56px" />
            </div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{b.name}</p>
            <span className="text-[10px] font-bold text-blue-600">{b.scores.overall.toFixed(1)}</span>
          </div>
        </div>

        {/* Stat bars */}
        <div className="mt-4 space-y-1.5">
          {[
            { label: "Food", aV: a.scores.food, bV: b.scores.food },
            { label: "Safety", aV: a.scores.safety, bV: b.scores.safety },
            { label: "Budget", aV: a.scores.costValue, bV: b.scores.costValue },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-2">
              <span className="text-[9px] font-medium w-10 text-right" style={{ color: "var(--text-muted)" }}>{row.label}</span>
              <div className="flex-1 flex items-center gap-0.5">
                <div className="flex-1 h-1 rounded-full bg-white/60 overflow-hidden flex justify-end">
                  <div className="h-full rounded-full bg-blue-400" style={{ width: `${row.aV * 10}%` }} />
                </div>
                <div className="flex-1 h-1 rounded-full bg-white/60 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-400" style={{ width: `${row.bV * 10}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 pt-3 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>Compare Cities</h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Compare destinations side by side to find the city that fits your lifestyle.
          </p>
        </div>
        <Link href="/" className="mt-auto inline-flex items-center justify-center w-fit px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "#60A5FA", color: "#fff", boxShadow: "0 2px 8px rgba(96,165,250,0.3)" }}>
          Start Comparing →
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Plan Your Perfect Trip ─────── */
function PlanTripCard() {
  const [a, b, c] = tripChain;
  return (
    <div className="rounded-3xl overflow-hidden flex flex-col transition-all hover:-translate-y-1"
      style={{
        background: "linear-gradient(135deg, #FFF1EC 0%, #FFE9DD 100%)",
        border: "1px solid #FF7A5933",
        boxShadow: "0 4px 16px rgba(255,122,89,0.10)",
      }}>
      <div className="p-5 pb-3">
        {/* Destination chain */}
        <div className="flex items-center gap-2">
          {[a, b, c].filter(Boolean).map((city, i, arr) => (
            <div key={city!.slug} className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-white shadow-md shrink-0">
                <Image src={city!.imageUrl} alt={city!.name} fill className="object-cover" sizes="48px" />
              </div>
              {i < arr.length - 1 && (
                <div className="flex flex-col gap-0.5 shrink-0">
                  <div className="w-1 h-1 rounded-full bg-orange-300" />
                  <div className="w-1 h-1 rounded-full bg-orange-400" />
                  <div className="w-1 h-1 rounded-full bg-orange-500" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold" style={{ color: "var(--brand-dark)" }}>
          {[a, b, c].filter(Boolean).map((city, i, arr) => (
            <span key={city!.slug} className="truncate">
              {city!.name}{i < arr.length - 1 && " → "}
            </span>
          ))}
        </div>

        {/* Timeline bar */}
        <div className="mt-4 flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-white/50">
          <div className="flex gap-0.5 flex-1">
            {[0, 1, 2, 3, 4, 5].map((d) => (
              <div key={d} className="flex-1 h-1.5 rounded-full"
                style={{ background: d < 4 ? "#FF7A59" : "#FF7A5933" }} />
            ))}
          </div>
          <span className="text-[10px] font-bold" style={{ color: "var(--brand)" }}>4–6 days</span>
        </div>
      </div>

      <div className="p-5 pt-3 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>Plan Your Perfect Trip</h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Build personalized itineraries, discover hidden gems, and organize your journey in minutes.
          </p>
        </div>
        <Link href="/trips" className="mt-auto inline-flex items-center justify-center w-fit px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "var(--brand)", color: "#fff", boxShadow: "0 2px 8px rgba(255,122,89,0.3)" }}>
          Create a Trip →
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Join the Community ─────── */
function CommunityCard() {
  const avatars = [
    { initials: "TK", color: "#4ADE80" },
    { initials: "AY", color: "#3DD9C5" },
    { initials: "MR", color: "#A78BFA" },
    { initials: "JS", color: "#F4C95D" },
  ];

  return (
    <div className="rounded-3xl overflow-hidden flex flex-col transition-all hover:-translate-y-1"
      style={{
        background: "linear-gradient(135deg, #ECFDF5 0%, #DEFAF1 100%)",
        border: "1px solid #4ADE8033",
        boxShadow: "0 4px 16px rgba(74,222,128,0.10)",
      }}>
      <div className="p-5 pb-3">
        {/* Avatars stacked */}
        <div className="flex items-center mb-3">
          <div className="flex -space-x-2">
            {avatars.map((a) => (
              <div key={a.initials} className="w-10 h-10 rounded-full ring-2 ring-white flex items-center justify-center font-bold text-xs text-white shadow-sm"
                style={{ background: a.color }}>
                {a.initials}
              </div>
            ))}
            <div className="w-10 h-10 rounded-full ring-2 ring-white flex items-center justify-center font-bold text-[10px] shadow-sm"
              style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
              +2.4k
            </div>
          </div>
        </div>

        {/* Activity badges */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/60">
            <span className="text-base">🏅</span>
            <div className="flex flex-col">
              <span className="text-[9px] font-medium" style={{ color: "var(--text-muted)" }}>Explorer</span>
              <span className="text-[10px] font-bold" style={{ color: "var(--text-primary)" }}>15 badges</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/60">
            <span className="text-base">🌎</span>
            <div className="flex flex-col">
              <span className="text-[9px] font-medium" style={{ color: "var(--text-muted)" }}>Active now</span>
              <span className="text-[10px] font-bold" style={{ color: "var(--text-primary)" }}>1,287 online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-3 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>Join the Community</h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Build your travel identity, save dream destinations, and discover cities through real travelers.
          </p>
        </div>
        <Link href="/?auth=signup" className="mt-auto inline-flex items-center justify-center w-fit px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "#4ADE80", color: "#fff", boxShadow: "0 2px 8px rgba(74,222,128,0.3)" }}>
          Sign Up Free →
        </Link>
      </div>
    </div>
  );
}
