import { NextResponse } from "next/server";
import { getRecipeByShareToken } from "@/lib/data/recipes";
import { isDbNotReadyError } from "@/lib/errors";

interface Context {
  params: Promise<{ token: string }>;
}

export async function GET(_: Request, context: Context) {
  const { token } = await context.params;

  try {
    const recipe = await getRecipeByShareToken(token);
    if (!recipe) {
      return NextResponse.json({ error: "Shared recipe not found." }, { status: 404 });
    }
    return NextResponse.json({ recipe });
  } catch (error) {
    const status = isDbNotReadyError(error) ? 503 : 500;
    return NextResponse.json({ error: "Failed to fetch shared recipe.", details: String(error) }, { status });
  }
}
