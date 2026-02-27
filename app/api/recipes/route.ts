import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { createRecipe, listRecipes } from "@/lib/data/recipes";
import { isDbNotReadyError } from "@/lib/errors";
import { recipeFilterSchema, recipeSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const { searchParams } = new URL(request.url);
  const parsed = recipeFilterSchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    ingredient: searchParams.get("ingredient") ?? undefined,
    cuisine: searchParams.get("cuisine") ?? undefined,
    maxPrep: searchParams.get("maxPrep") ?? undefined,
    difficulty: searchParams.get("difficulty") ?? undefined,
    diet: searchParams.get("diet") ?? undefined,
    status: searchParams.get("status") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid search filters." }, { status: 400 });
  }

  try {
    const recipes = await listRecipes(user.id, parsed.data);
    return NextResponse.json({ recipes });
  } catch (error) {
    const status = isDbNotReadyError(error) ? 503 : 500;
    return NextResponse.json({ error: "Failed to fetch recipes.", details: String(error) }, { status });
  }
}

export async function POST(request: Request) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const body = await request.json();
  const parsed = recipeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid recipe data." }, { status: 400 });
  }

  try {
    const recipe = await createRecipe(user.id, parsed.data);
    return NextResponse.json({ recipe }, { status: 201 });
  } catch (error) {
    const status = isDbNotReadyError(error) ? 503 : 500;
    return NextResponse.json({ error: "Failed to create recipe.", details: String(error) }, { status });
  }
}
