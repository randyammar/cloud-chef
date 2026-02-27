import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api-auth";
import { setAiOptIn } from "@/lib/data/recipes";
import { isDbNotReadyError } from "@/lib/errors";

const schema = z.object({
  enabled: z.boolean()
});

export async function POST(request: Request) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  try {
    const enabled = await setAiOptIn(user.id, parsed.data.enabled);
    return NextResponse.json({ ok: true, enabled });
  } catch (error) {
    const status = isDbNotReadyError(error) ? 503 : 500;
    return NextResponse.json({ error: "Failed to update preference.", details: String(error) }, { status });
  }
}
