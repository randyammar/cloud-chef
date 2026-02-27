import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api-auth";
import { setRecipeStatus } from "@/lib/data/recipes";
import { isDbNotReadyError } from "@/lib/errors";

const schema = z.object({
  favorite: z.boolean()
});

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: Context) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid favorite payload." }, { status: 400 });
  }

  const { id } = await context.params;

  try {
    const recipe = await setRecipeStatus(
      user.id,
      id,
      parsed.data.favorite ? "favorite" : "to_try"
    );
    return NextResponse.json({ recipe });
  } catch (error) {
    const status = isDbNotReadyError(error) ? 503 : 500;
    return NextResponse.json({ error: "Failed to update favorite status.", details: String(error) }, { status });
  }
}
