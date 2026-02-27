import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { revokeShareLink } from "@/lib/data/recipes";
import { isDbNotReadyError } from "@/lib/errors";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(_: Request, context: Context) {
  const { user, response } = await requireApiUser();
  if (!user) return response;
  const { id } = await context.params;

  try {
    await revokeShareLink(user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = isDbNotReadyError(error) ? 503 : 500;
    return NextResponse.json({ error: "Failed to revoke link.", details: String(error) }, { status });
  }
}
