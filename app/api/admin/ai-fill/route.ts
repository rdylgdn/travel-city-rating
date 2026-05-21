import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const { cityName, country } = await request.json();
  if (!cityName || !country) return NextResponse.json({ error: "Missing cityName or country" }, { status: 400 });

  const prompt = `You are a travel content writer. Generate accurate, concise travel content for ${cityName}, ${country}.

Return ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "summary": "One engaging sentence describing the city's essence",
  "whyVisit": "2-3 sentence paragraph on why travelers should visit",
  "bestAreas": ["area1", "area2", "area3", "area4", "area5"],
  "bestThingsToDo": ["activity1", "activity2", "activity3", "activity4", "activity5"],
  "commonComplaints": ["complaint1", "complaint2", "complaint3", "complaint4"]
}

Keep each item concise. bestThingsToDo items should be specific activities starting with a verb. commonComplaints should be real, honest issues travelers face.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (message.content[0] as { type: string; text: string }).text.trim();
    // Strip markdown code blocks if present
    const clean = text.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
    const data = JSON.parse(clean);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
