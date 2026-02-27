import { requireUser } from "@/lib/auth";
import { listRecipes } from "@/lib/data/recipes";
import { isDbNotReadyError } from "@/lib/errors";
import type { RecipeRecord } from "@/lib/types";
import { DatabaseSetupAlert } from "@/components/database-setup-alert";
import { FavoritesRecipesList } from "@/components/favorites-recipes-list";
import { Card, CardContent } from "@/components/ui/card";

export default async function FavoritesPage() {
  const user = await requireUser();
  let recipes: RecipeRecord[] = [];
  let setupError: string | null = null;

  try {
    recipes = (await listRecipes(user.id, {})) as RecipeRecord[];
  } catch (error) {
    if (isDbNotReadyError(error)) {
      setupError = error instanceof Error ? error.message : String(error);
    } else {
      throw error;
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Favorites</h1>
        <p className="text-sm text-muted-foreground">Your hearted recipes, all in one place.</p>
      </div>

      {setupError ? <DatabaseSetupAlert message={setupError} /> : null}

      {setupError ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Once the migration is applied, reload this page to view favorites.
          </CardContent>
        </Card>
      ) : (
        <FavoritesRecipesList recipes={recipes} />
      )}
    </section>
  );
}
