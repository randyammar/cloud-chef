import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getRecipe } from "@/lib/data/recipes";
import { isDbNotReadyError } from "@/lib/errors";
import type { RecipeRecord } from "@/lib/types";
import { DatabaseSetupAlert } from "@/components/database-setup-alert";
import { RecipeForm } from "@/components/recipe-form";
import { ShareLinkControls } from "@/components/share-link-controls";
import { DeleteRecipeButton } from "@/components/delete-recipe-button";
import { CookModeDialog } from "@/components/cook-mode-dialog";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;

  let recipe: RecipeRecord | null = null;
  let setupError: string | null = null;

  try {
    recipe = await getRecipe(user.id, id);
  } catch (error) {
    if (isDbNotReadyError(error)) {
      setupError = error instanceof Error ? error.message : String(error);
    } else {
      throw error;
    }
  }

  if (setupError) {
    return (
      <section className="space-y-6">
        <DatabaseSetupAlert message={setupError} />
      </section>
    );
  }
  if (!recipe) notFound();
  const typedRecipe = recipe;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{typedRecipe.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={typedRecipe.status} />
            {typedRecipe.cuisine ? <Badge variant="outline">{typedRecipe.cuisine}</Badge> : null}
            {typedRecipe.prep_time_minutes ? <Badge variant="outline">{typedRecipe.prep_time_minutes} min</Badge> : null}
            {typedRecipe.difficulty ? <Badge variant="outline">{typedRecipe.difficulty}</Badge> : null}
          </div>
        </div>
        <div className="flex gap-2">
          <CookModeDialog instructions={typedRecipe.instructions} />
          <DeleteRecipeButton recipeId={typedRecipe.id} />
        </div>
      </div>

      <div className="space-y-4">
        <ShareLinkControls recipeId={typedRecipe.id} />
      </div>

      <RecipeForm mode="edit" recipe={typedRecipe} />
    </section>
  );
}
