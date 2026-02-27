"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { readQuickFavoriteMap, writeQuickFavoriteMap } from "@/lib/quick-favorites";
import { Button } from "@/components/ui/button";

interface FavoriteRecipeButtonProps {
  recipeId: string;
  initialFavorite: boolean;
}

export function FavoriteRecipeButton({ recipeId, initialFavorite }: FavoriteRecipeButtonProps) {
  const [favorite, setFavorite] = useState(initialFavorite);

  useEffect(() => {
    const map = readQuickFavoriteMap();
    if (typeof map[recipeId] === "boolean") {
      setFavorite(map[recipeId]);
    } else {
      setFavorite(initialFavorite);
    }
  }, [recipeId, initialFavorite]);

  function toggleFavorite() {
    const next = !favorite;
    setFavorite(next);
    const map = readQuickFavoriteMap();
    map[recipeId] = next;
    writeQuickFavoriteMap(map);
    window.dispatchEvent(new Event("cloudchef:favorites-updated"));
    toast.success(next ? "Added to quick favorites." : "Removed from quick favorites.");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleFavorite}
      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      className="h-8 w-8"
    >
      <Heart
        className={`h-4 w-4 ${favorite ? "fill-primary text-primary" : "text-muted-foreground"}`}
      />
    </Button>
  );
}
