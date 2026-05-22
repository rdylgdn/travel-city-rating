import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cities as allCities } from "@/lib/seed-data";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const { tripCities, startDate } = await request.json();
  // tripCities: [{ slug, name, country, duration_days }]
  // startDate: "2025-06-01"

  const supabase = await createClient();

  // Fetch active affiliate links
  const { data: affiliates } = await supabase
    .from("affiliate_links")
    .select("category, type, name, url, description")
    .eq("is_active", true);

  // Fetch recent approved reviews for each city (up to 2 per city)
  const slugs = tripCities.map((c: { slug: string }) => c.slug);
  const { data: reviews } = await supabase
    .from("reviews")
    .select("city_slug, travel_style, overall_rating, written_review")
    .in("city_slug", slugs)
    .eq("status", "approved")
    .order("overall_rating", { ascending: false })
    .limit(tripCities.length * 2);

  // Get monthly data for weather context
  const weatherContext = tripCities.map((tc: { slug: string; duration_days: number; name: string }) => {
    const city = allCities.find((c) => c.slug === tc.slug);
    const md = city?.monthlyData;
    if (!md || !startDate) return null;
    const start = new Date(startDate);
    const months: string[] = [];
    for (let i = 0; i < tc.duration_days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const monthName = d.toLocaleString("en-US", { month: "short" });
      if (!months.includes(monthName)) months.push(monthName);
    }
    return { city: tc.name, months, data: months.map((m) => md[m]).filter(Boolean) };
  }).filter(Boolean);

  // Build prompt
  const affiliateText = affiliates?.length
    ? affiliates.map((a) => `- ${a.name} (${a.category}/${a.type}): ${a.url} — ${a.description ?? ""}`).join("\n")
    : "No affiliate links available.";

  const reviewText = reviews?.length
    ? reviews.map((r) => `${r.city_slug}: "${r.written_review?.slice(0, 150)}" (${r.overall_rating}/10, ${r.travel_style})`).join("\n")
    : "";

  const weatherText = weatherContext.map((w: { city: string; months: string[]; data: { weather: number; crowds: string; costLevel: string; note?: string }[] }) =>
    `${w.city} (${w.months.join(", ")}): weather ${w.data[0]?.weather ?? 7}/10, ${w.data[0]?.crowds ?? "Medium"} crowds, ${w.data[0]?.note ?? ""}`
  ).join("\n");

  const totalDays = tripCities.reduce((s: number, tc: { duration_days: number }) => s + tc.duration_days, 0);

  // Build explicit day breakdown so AI knows exactly what to generate
  let dayCounter = 0;
  const dayBreakdown = tripCities.map((tc: { name: string; country: string; duration_days: number; slug: string }) => {
    const lines = [];
    for (let d = 1; d <= tc.duration_days; d++) {
      dayCounter++;
      const date = startDate
        ? new Date(new Date(startDate).getTime() + (dayCounter - 1) * 86400000).toISOString().slice(0, 10)
        : `Day ${dayCounter}`;
      lines.push(`  - Overall day ${dayCounter}, day ${d} in ${tc.name}: date=${date}, citySlug=${tc.slug}`);
    }
    return `${tc.name}, ${tc.country} (${tc.duration_days} days):\n${lines.join("\n")}`;
  }).join("\n");

  const prompt = `Create a complete day-by-day travel itinerary for ALL ${totalDays} days of this trip.

IMPORTANT: You MUST generate exactly ${totalDays} day objects in the "days" array — one for every single day listed below. Do not skip any days.

Full day schedule:
${dayBreakdown}

Weather context:
${weatherText || "No weather data available."}

Traveler reviews for context:
${reviewText || "No reviews available."}

Available affiliate partners:
${affiliateText}

Return ONLY valid compact JSON (no markdown, no newlines inside strings):
{"days":[{"date":"2025-06-01","citySlug":"barcelona","cityName":"Barcelona","country":"Spain","overallDay":1,"dayInCity":1,"weather":{"score":8,"note":"Warm and sunny","crowds":"Medium"},"area":"Gothic Quarter","activities":["Visit Sagrada Familia (book tickets in advance)","Explore El Born neighbourhood and tapas bars","Sunset walk on Las Ramblas"],"accommodation":{"content":"Stay in Eixample — central, safe, great transport links","affiliateName":null,"affiliateUrl":null},"notes":"Start early to beat the crowds at major sites"}],"intercityTransport":[{"from":"Barcelona","to":"New York City","content":"Fly Barcelona (BCN) to New York (JFK) — ~9 hours","affiliateName":null,"affiliateUrl":null}]}

Rules:
- Generate ALL ${totalDays} days — every day in dayBreakdown must appear
- 3-4 specific actionable activities per day as an array of strings
- One accommodation object per day
- intercityTransport entries only when the city changes between consecutive days
- If no matching affiliate link available, use null for affiliateName and affiliateUrl
- Keep all string values concise (max 120 chars each)`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (message.content[0] as { type: string; text: string }).text.trim()
      .replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
    const itinerary = JSON.parse(text);

    // Add IDs and visibility flags to each item
    const processed = {
      ...itinerary,
      days: itinerary.days.map((day: Record<string, unknown>) => ({
        ...day,
        activities: (day.activities as string[]).map((a: string, i: number) => ({
          id: `act-${day.date}-${i}`,
          content: a,
          visible: true,
          isCustom: false,
        })),
        accommodation: day.accommodation ? {
          ...(day.accommodation as Record<string, unknown>),
          id: `acc-${day.date}`,
          visible: true,
        } : null,
      })),
      intercityTransport: (itinerary.intercityTransport ?? []).map((t: Record<string, unknown>, i: number) => ({
        ...t,
        id: `transport-${i}`,
        visible: true,
      })),
    };

    return NextResponse.json(processed);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
