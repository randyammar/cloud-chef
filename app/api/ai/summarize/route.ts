import { NextResponse } from "next/server";
import { summarizeInstructions } from "@/lib/ai";
import { requireAiEnabled } from "@/lib/ai-guard";
import { logAiUsage } from "@/lib/data/recipes";
import { aiSummarizeSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const { user, response } = await requireAiEnabled();
  if (!user) return response;

  const body = await request.json();
  const parsed = aiSummarizeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid instructions." }, { status: 400 });
  }

  try {
    const summary = await summarizeInstructions(parsed.data.instructions);
    await logAiUsage(user.id, "summarize", true);
    return NextResponse.json({ data: { summary } });
  } catch (error) {
    await logAiUsage(user.id, "summarize", false);
    return NextResponse.json({ error: "Failed to summarize instructions.", details: String(error) }, { status: 500 });
  }
}
