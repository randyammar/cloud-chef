import Link from "next/link";
import { Clock3, Utensils } from "lucide-react";
import type { RecipeRecord } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FavoriteRecipeButton } from "@/components/favorite-recipe-button";
import { StatusBadge } from "@/components/status-badge";

interface RecipeCardProps {
  recipe: RecipeRecord;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const tags = [
    ...(recipe.cuisine ? [{ key: "cuisine", label: recipe.cuisine, variant: "outline" as const }] : []),
    ...(recipe.difficulty ? [{ key: "difficulty", label: recipe.difficulty, variant: "outline" as const }] : []),
    ...(recipe.diet_tags ?? []).slice(0, 3).map((tag) => ({ key: `diet-${tag}`, label: tag, variant: "secondary" as const }))
  ];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="line-clamp-2 min-h-10 text-xl leading-tight">{recipe.name}</CardTitle>
          <FavoriteRecipeButton recipeId={recipe.id} initialFavorite={recipe.status === "favorite"} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 text-sm text-muted-foreground">
        <p className="line-clamp-3 min-h-[3.75rem]">{recipe.instructions}</p>
      </CardContent>
      <CardFooter className="mt-auto flex-col items-stretch gap-3">
        {tags.length > 0 ? (
          <div className="flex min-h-7 flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag.key} variant={tag.variant}>
                {tag.label}
              </Badge>
            ))}
          </div>
        ) : null}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <p className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1">
            <Clock3 className="h-4 w-4" />
            {recipe.prep_time_minutes ? `${recipe.prep_time_minutes} min` : "N/A"}
          </p>
          <p className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1">
            <Utensils className="h-4 w-4" />
            {recipe.ingredients.length} ingredients
          </p>
          <StatusBadge status={recipe.status} className="ml-auto" />
        </div>
        <Button asChild className="w-full">
          <Link href={`/app/recipes/${recipe.id}`}>Open Recipe</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
