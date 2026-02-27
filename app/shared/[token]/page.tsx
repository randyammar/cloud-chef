import { redirect } from "next/navigation";
import { getRecipeByShareToken } from "@/lib/data/recipes";
import type { IngredientItem, RecipeRecord } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SharedRecipePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedRecipePage({ params }: SharedRecipePageProps) {
  const { token } = await params;
  const recipe = await getRecipeByShareToken(token);
  if (!recipe) redirect("/");
  const typedRecipe = recipe as RecipeRecord;

  return (
    <main className="container py-10">
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle className="text-3xl">{typedRecipe.name}</CardTitle>
          <div className="flex items-center">
            <StatusBadge status={typedRecipe.status} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {typedRecipe.cuisine ? <Badge variant="outline">{typedRecipe.cuisine}</Badge> : null}
            {typedRecipe.prep_time_minutes ? <Badge variant="outline">{typedRecipe.prep_time_minutes} min</Badge> : null}
            {typedRecipe.difficulty ? <Badge variant="outline">{typedRecipe.difficulty}</Badge> : null}
            {(typedRecipe.diet_tags ?? []).slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="mb-3 text-lg font-semibold">Ingredients</h2>
            <ul className="space-y-2">
              {typedRecipe.ingredients.map((ingredient: IngredientItem) => (
                <li key={ingredient.id ?? ingredient.name} className="rounded-md border p-3 text-sm">
                  {ingredient.name}
                  {(ingredient.quantity || ingredient.unit) ? (
                    <span className="ml-2 text-muted-foreground">
                      {ingredient.quantity} {ingredient.unit}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold">Instructions</h2>
            <article className="whitespace-pre-wrap rounded-md border p-4 text-sm leading-relaxed">
              {typedRecipe.instructions}
            </article>
          </section>
        </CardContent>
      </Card>
    </main>
  );
}
