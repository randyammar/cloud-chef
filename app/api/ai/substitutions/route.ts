import { NextResponse } from "next/server";
import { suggestSubstitutions } from "@/lib/ai";
import { requireAiEnabled } from "@/lib/ai-guard";
import { logAiUsage } from "@/lib/data/recipes";
import { aiSubstitutionSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const { user, response } = await requireAiEnabled();
  if (!user) return response;

  const body = await request.json();
  const parsed = aiSubstitutionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid ingredients." }, { status: 400 });
  }

  try {
    const suggestions = await suggestSubstitutions(parsed.data.ingredients);
    await logAiUsage(user.id, "substitute", true);
    return NextResponse.json({ data: { suggestions } });
  } catch (error) {
    await logAiUsage(user.id, "substitute", false);
    return NextResponse.json({ error: "Failed to suggest substitutions.", details: String(error) }, { status: 500 });
  }
}
