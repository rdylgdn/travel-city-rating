import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPTS: Record<string, (city: string, country: string) => string> = {
  content: (city, country) => `You are a travel content writer. Generate accurate, concise travel content for ${city}, ${country}.
Return ONLY this JSON (no markdown):
{
  "summary": "One engaging sentence describing the city's essence",
  "whyVisit": "2-3 sentence paragraph on why travelers should visit",
  "bestAreas": ["area1","area2","area3","area4","area5"],
  "bestThingsToDo": ["Verb-led activity 1","activity2","activity3","activity4","activity5"],
  "commonComplaints": ["honest issue1","issue2","issue3","issue4"]
}`,

  scores: (city, country) => `Estimate realistic travel scores (0.0–10.0) for ${city}, ${country} based on your knowledge.
Return ONLY this JSON (no markdown):
{
  "overall": 8.2,
  "costValue": 7.5,
  "safety": 8.0,
  "food": 8.8,
  "culture": 9.0,
  "nature": 6.5,
  "nightlife": 7.0,
  "easeOfTravel": 8.5
}
All values must be between 0.0 and 10.0.`,

  budget: (city, country) => `Estimate realistic travel budget breakdowns (USD per person per day) for ${city}, ${country}.
Return ONLY this JSON (no markdown):
{
  "budget": { "accommodation": 0, "food": 0, "transport": 0, "activities": 0, "extras": 0 },
  "midRange": { "accommodation": 0, "food": 0, "transport": 0, "activities": 0, "extras": 0 },
  "luxury": { "accommodation": 0, "food": 0, "transport": 0, "activities": 0, "extras": 0 }
}
budget = backpacker/hostel level, midRange = 3-star hotel + local restaurants, luxury = 5-star. All values are positive integers.`,

  seasonal: (city, country) => `Generate monthly travel conditions for ${city}, ${country}.
Return ONLY this JSON (no markdown) with keys Jan through Dec:
{
  "Jan": { "weather": 7, "crowds": "Medium", "costLevel": "Normal", "note": "Brief note" },
  "Feb": { "weather": 6, "crowds": "Low", "costLevel": "Cheaper", "note": "..." }
}
weather: 1-10 (10=perfect). crowds: "Low"|"Medium"|"High". costLevel: "Cheaper"|"Normal"|"Pricier". note: max 5 words.`,
};

async function fetchUnsplashImage(cityName: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${cityName} city travel`);
    const res = await fetch(`https://source.unsplash.com/featured/800x600?${query}`, {
      redirect: "follow",
      headers: { "User-Agent": "CityRateApp/1.0" },
    });
    // Get the final URL after redirect — it's the stable Unsplash image URL
    const url = res.url;
    if (url && url.includes("images.unsplash.com")) {
      // Clean to w=800&q=80 format
      const base = url.split("?")[0];
      return `${base}?w=800&q=80`;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const { cityName, country, type = "content" } = await request.json();
  if (!cityName || !country) return NextResponse.json({ error: "Missing cityName or country" }, { status: 400 });

  // Image fetch doesn't need the AI key
  if (type === "image") {
    const url = await fetchUnsplashImage(cityName);
    if (url) return NextResponse.json({ imageUrl: url });
    return NextResponse.json({ error: "Could not find image" }, { status: 404 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured in Vercel environment variables." }, { status: 500 });
  }

  const promptFn = PROMPTS[type];
  if (!promptFn) return NextResponse.json({ error: "Unknown fill type" }, { status: 400 });

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: promptFn(cityName, country) }],
    });
    const text = (message.content[0] as { type: string; text: string }).text.trim()
      .replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
    return NextResponse.json(JSON.parse(text));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
