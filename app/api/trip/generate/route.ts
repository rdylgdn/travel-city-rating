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

  const prompt = `Create a travel itinerary for ALL ${totalDays} days. Generate EVERY day listed — no skipping.

Days:
${dayBreakdown}

Affiliates: ${affiliateText}

Return ONLY compact JSON. Every string max 80 chars. No markdown:
{"days":[{"date":"2025-06-01","citySlug":"bangkok","cityName":"Bangkok","overallDay":1,"dayInCity":1,"weather":{"score":8,"crowds":"Medium"},"area":"Sukhumvit","activities":["Visit Grand Palace early morning","Explore Chatuchak market","Chao Phraya boat tour","Evening street food on Khao San Road"],"accommodation":{"content":"Stay in Sukhumvit - central, safe, BTS access","affiliateName":null,"affiliateUrl":null},"notes":"Wear light clothing, stay hydrated"}],"intercityTransport":[{"from":"Bangkok","to":"Tokyo","content":"Fly BKK to NRT ~6h","affiliateName":null,"affiliateUrl":null}]}

STRICT RULES:
- MUST have exactly ${totalDays} objects in "days" array
- 3 activities per day maximum, each under 60 chars
- accommodation.content under 70 chars
- notes under 60 chars
- intercityTransport only when city changes
- null for missing affiliate values`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    let text = (message.content[0] as { type: string; text: string }).text.trim()
      .replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();

    // Attempt to recover truncated JSON by closing open structures
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let itinerary: any;
    try {
      itinerary = JSON.parse(text);
    } catch {
      // Try to repair truncated JSON: close any open arrays/objects
      let depth = 0;
      const stack: string[] = [];
      for (const ch of text) {
        if (ch === "{") stack.push("}");
        else if (ch === "[") stack.push("]");
        else if (ch === "}" || ch === "]") stack.pop();
      }
      // Remove trailing incomplete element (find last complete comma-separated item)
      const lastComma = text.lastIndexOf(',"');
      const lastBrace = text.lastIndexOf('}');
      const lastBracket = text.lastIndexOf(']');
      const cutAt = Math.max(lastBrace, lastBracket);
      if (cutAt > 0 && cutAt > lastComma) {
        text = text.slice(0, cutAt + 1) + stack.reverse().join("");
      } else if (lastComma > 0) {
        text = text.slice(0, lastComma) + stack.reverse().join("");
      }
      itinerary = JSON.parse(text);
    }

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
