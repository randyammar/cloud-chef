import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { deleteRecipe, getRecipe, updateRecipe } from "@/lib/data/recipes";
import { isDbNotReadyError } from "@/lib/errors";
import { recipeSchema } from "@/lib/validators";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, context: Context) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const { id } = await context.params;
  try {
    const recipe = await getRecipe(user.id, id);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
    }
    return NextResponse.json({ recipe });
  } catch (error) {
    const status = isDbNotReadyError(error) ? 503 : 500;
    return NextResponse.json({ error: "Failed to fetch recipe.", details: String(error) }, { status });
  }
}

export async function PATCH(request: Request, context: Context) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const body = await request.json();
  const parsed = recipeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid recipe payload." }, { status: 400 });
  }

  const { id } = await context.params;
  try {
    const recipe = await updateRecipe(user.id, id, parsed.data);
    return NextResponse.json({ recipe });
  } catch (error) {
    const status = isDbNotReadyError(error) ? 503 : 500;
    return NextResponse.json({ error: "Failed to update recipe.", details: String(error) }, { status });
  }
}

export async function DELETE(_: Request, context: Context) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const { id } = await context.params;
  try {
    await deleteRecipe(user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = isDbNotReadyError(error) ? 503 : 500;
    return NextResponse.json({ error: "Failed to delete recipe.", details: String(error) }, { status });
  }
}
