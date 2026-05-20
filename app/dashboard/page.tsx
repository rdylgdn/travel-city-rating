import DashboardClient from "./DashboardClient";
import { mockUser, mockSavedCities, mockUserReviews, mockStats } from "@/lib/mock-user";

export const metadata = { title: "Dashboard — CityRate" };

export default function DashboardPage() {
  return (
    <DashboardClient
      user={mockUser}
      savedCities={mockSavedCities}
      reviews={mockUserReviews}
      stats={mockStats}
    />
  );
}
