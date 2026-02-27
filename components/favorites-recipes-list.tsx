"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { RecipeRecord } from "@/lib/types";
import { readQuickFavoriteIds } from "@/lib/quick-favorites";
import { RecipeCard } from "@/components/recipe-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FavoritesRecipesListProps {
  recipes: RecipeRecord[];
}

export function FavoritesRecipesList({ recipes }: FavoritesRecipesListProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    const syncFavorites = () => {
      setFavoriteIds(readQuickFavoriteIds());
    };

    syncFavorites();
    window.addEventListener("storage", syncFavorites);
    window.addEventListener("cloudchef:favorites-updated", syncFavorites);

    return () => {
      window.removeEventListener("storage", syncFavorites);
      window.removeEventListener("cloudchef:favorites-updated", syncFavorites);
    };
  }, []);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const favoriteRecipes = useMemo(
    () => recipes.filter((recipe) => favoriteSet.has(recipe.id)),
    [recipes, favoriteSet]
  );

  if (favoriteRecipes.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">
            No favorites yet. Tap the heart icon on any recipe to add it here.
          </p>
          <Button asChild className="mt-4">
            <Link href="/app/recipes">Browse recipes</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {favoriteRecipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
