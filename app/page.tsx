import { cities } from "@/lib/seed-data";
import ExploreClient from "@/components/ExploreClient";

export default function HomePage() {
  return (
    <div>
      {/* Hero tagline */}
      <div className="bg-gradient-to-b from-rose-50 to-white px-4 py-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Find cities that match <span className="text-rose-500">your travel style</span>
        </h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Real traveler ratings · Budget-aware · No booking required
        </p>
      </div>
      <ExploreClient cities={cities} />
    </div>
  );
}
