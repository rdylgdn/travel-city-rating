import SuggestCityForm from "@/components/SuggestCityForm";

export const metadata = {
  title: "Suggest a city — CityRate",
};

export default function SuggestPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Suggest a city</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Know a great destination that&apos;s missing? Tell us about it.
        </p>
      </div>
      <SuggestCityForm />
      <p className="text-xs text-gray-400 text-center mt-6">
        Suggestions are reviewed before publishing to keep quality high.
      </p>
    </div>
  );
}
