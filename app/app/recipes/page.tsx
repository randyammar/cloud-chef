import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listRecipes } from "@/lib/data/recipes";
import { isDbNotReadyError } from "@/lib/errors";
import type { RecipeRecord } from "@/lib/types";
import { recipeFilterSchema } from "@/lib/validators";
import { DatabaseSetupAlert } from "@/components/database-setup-alert";
import { RecipeCard } from "@/components/recipe-card";
import { RecipeSearchFilters } from "@/components/recipe-search-filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecipesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const user = await requireUser();
  const params = await searchParams;

  const parsed = recipeFilterSchema.safeParse({
    q: typeof params.q === "string" ? params.q : undefined,
    ingredient: typeof params.ingredient === "string" ? params.ingredient : undefined,
    cuisine: typeof params.cuisine === "string" ? params.cuisine : undefined,
    maxPrep: typeof params.maxPrep === "string" ? params.maxPrep : undefined,
    difficulty: typeof params.difficulty === "string" ? params.difficulty : undefined,
    diet: typeof params.diet === "string" ? params.diet : undefined
  });

  let recipes: RecipeRecord[] = [];
  let setupError: string | null = null;
  try {
    recipes = (await listRecipes(user.id, parsed.success ? parsed.data : {})) as RecipeRecord[];
  } catch (error) {
    if (isDbNotReadyError(error)) {
      setupError = error instanceof Error ? error.message : String(error);
    } else {
      throw error;
    }
  }
  const favoriteCount = recipes.filter((recipe: RecipeRecord) => recipe.status === "favorite").length;
  const madeCount = recipes.filter((recipe: RecipeRecord) => recipe.status === "made_before").length;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Recipes</h1>
          <p className="text-sm text-muted-foreground">Search, tag, and share your recipes.</p>
        </div>
        {!setupError ? (
          <Button asChild>
            <Link href="/app/recipes/new">
              <Plus className="mr-2 h-4 w-4" />
              New recipe
            </Link>
          </Button>
        ) : null}
      </div>

      {setupError ? <DatabaseSetupAlert message={setupError} /> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total recipes</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{recipes.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Favorites</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{favoriteCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Made before</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{madeCount}</CardContent>
        </Card>
      </div>

      {!setupError ? <RecipeSearchFilters /> : null}

      {setupError ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Once the migration is applied, reload this page to start managing recipes.
          </CardContent>
        </Card>
      ) : recipes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No recipes yet. Start by adding your first one.</p>
            <Button asChild className="mt-4">
              <Link href="/app/recipes/new">Create recipe</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {recipes.map((recipe: RecipeRecord) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </section>
  );
}
