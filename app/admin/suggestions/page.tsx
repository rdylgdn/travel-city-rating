import { mockSuggestions } from "@/lib/mock-admin";
import SuggestionsClient from "./SuggestionsClient";

export const metadata = { title: "Suggestions — Admin — CityRate" };

export default function AdminSuggestionsPage() {
  return <SuggestionsClient suggestions={mockSuggestions} />;
}
