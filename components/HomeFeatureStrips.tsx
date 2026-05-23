import Link from "next/link";
import { City } from "@/lib/types";
import { Profile } from "@/lib/profile";
import HomeLuckyCard from "./HomeLuckyCard";
import HomeMobileProfileCard from "./HomeMobileProfileCard";

type StaticCard = {
  title: string;
  desc: string;
  cta: string;
  href: string;
  bg: string;
  border: string;
  buttonColor: string;
  buttonShadow: string;
};

const compareCard: StaticCard = {
  title: "Compare Cities",
  desc: "Compare destinations side by side to find the city that fits your lifestyle.",
  cta: "Start Comparing →",
  href: "/compare",
  bg: "linear-gradient(135deg, #EBF4FF 0%, #F5F0FF 100%)",
  border: "#60A5FA33",
  buttonColor: "#60A5FA",
  buttonShadow: "rgba(96,165,250,0.3)",
};

const tripCard: StaticCard = {
  title: "Plan Your Perfect Trip",
  desc: "Build personalized itineraries, discover hidden gems, and organize your journey in minutes.",
  cta: "Create a Trip →",
  href: "/trips",
  bg: "linear-gradient(135deg, #FFF1EC 0%, #FFE9DD 100%)",
  border: "#FF7A5933",
  buttonColor: "#FF7A59",
  buttonShadow: "rgba(255,122,89,0.3)",
};

const communityCard: StaticCard = {
  title: "Join the Community",
  desc: "Build your travel identity, save dream destinations, and discover cities through real travelers.",
  cta: "Sign Up Free →",
  href: "/?auth=signup",
  bg: "linear-gradient(135deg, #ECFDF5 0%, #DEFAF1 100%)",
  border: "#4ADE8033",
  buttonColor: "#4ADE80",
  buttonShadow: "rgba(74,222,128,0.3)",
};

function CardShell({ card }: { card: StaticCard }) {
  return (
    <div className="rounded-3xl p-6 flex flex-col gap-4 transition-all hover:-translate-y-1"
      style={{
        background: card.bg,
        border: `1px solid ${card.border}`,
        boxShadow: `0 4px 16px ${card.buttonShadow.replace("0.3", "0.10")}`,
      }}>
      <div>
        <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>{card.title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{card.desc}</p>
      </div>
      <Link href={card.href}
        className="mt-auto inline-flex items-center justify-center w-fit px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
        style={{ background: card.buttonColor, color: "#fff", boxShadow: `0 2px 8px ${card.buttonShadow}` }}>
        {card.cta}
      </Link>
    </div>
  );
}

type Props = {
  isLoggedIn: boolean;
  profile?: Profile | null;
  userId?: string;
  displayName?: string;
  visitedCities?: City[];
  visitedCountryCount?: number;
  allCitySlugs?: string[];
};

export default function HomeFeatureStrips({
  isLoggedIn,
  profile,
  userId = "",
  displayName = "",
  visitedCities = [],
  visitedCountryCount = 0,
  allCitySlugs = [],
}: Props) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Compare — same for everyone */}
        <CardShell card={compareCard} />

        {/* Card 2: Plan trip — same for everyone */}
        <CardShell card={tripCard} />

        {/* Card 3: depends on auth + viewport */}
        {!isLoggedIn ? (
          /* Guest — original community card on all viewports */
          <CardShell card={communityCard} />
        ) : (
          <>
            {/* Logged-in mobile: merged Travel DNA + Where You've Been */}
            <div className="md:hidden">
              <HomeMobileProfileCard
                profile={profile ?? null}
                userId={userId}
                displayName={displayName}
                visitedCities={visitedCities}
                visitedCountryCount={visitedCountryCount}
              />
            </div>
            {/* Logged-in desktop: I Feel Lucky random city picker */}
            <div className="hidden md:block">
              <HomeLuckyCard citySlugs={allCitySlugs} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
