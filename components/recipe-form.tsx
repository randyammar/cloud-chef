"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import type { IngredientItem, RecipeRecord } from "@/lib/types";
import { dietTagOptions, recipeDifficultyOptions, recipeStatusOptions } from "@/lib/constants";
import { normalizeDietTags } from "@/lib/diet-tags";
import { recipeSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const defaultIngredient = (): IngredientItem => ({
  id: crypto.randomUUID(),
  name: "",
  quantity: "",
  unit: "",
  notes: ""
});

const defaultForm = {
  name: "",
  ingredients: [defaultIngredient()],
  instructions: "",
  cuisine: "",
  prep_time_minutes: "",
  difficulty: "",
  diet_tags: [] as string[],
  status: "to_try",
  servings: ""
};

interface RecipeFormProps {
  mode: "create" | "edit";
  recipe?: RecipeRecord;
}

export function RecipeForm({ mode, recipe }: RecipeFormProps) {
  const router = useRouter();
  const [isAiPending, startAiTransition] = useTransition();
  const [isSubmitPending, startSubmitTransition] = useTransition();
  const [form, setForm] = useState(() => {
    if (!recipe) return defaultForm;
    return {
      name: recipe.name,
      ingredients:
        recipe.ingredients.length > 0
          ? recipe.ingredients
          : [defaultIngredient()],
      instructions: recipe.instructions,
      cuisine: recipe.cuisine ?? "",
      prep_time_minutes: recipe.prep_time_minutes?.toString() ?? "",
      difficulty: recipe.difficulty ?? "",
      diet_tags: normalizeDietTags(recipe.diet_tags),
      status: recipe.status,
      servings: recipe.servings?.toString() ?? ""
    };
  });

  const headline = useMemo(
    () => (mode === "create" ? "Create a new recipe" : "Edit recipe"),
    [mode]
  );

  function updateIngredient(id: string, field: keyof IngredientItem, value: string) {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient) =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient
      )
    }));
  }

  function addIngredient() {
    setForm((prev) => ({ ...prev, ingredients: [...prev.ingredients, defaultIngredient()] }));
  }

  function removeIngredient(id: string) {
    setForm((prev) => ({
      ...prev,
      ingredients:
        prev.ingredients.length <= 1
          ? prev.ingredients
          : prev.ingredients.filter((ingredient) => ingredient.id !== id)
    }));
  }

  function toggleDietTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      diet_tags: prev.diet_tags.includes(tag)
        ? prev.diet_tags.filter((item) => item !== tag)
        : [...prev.diet_tags, tag]
    }));
  }

  function applyAiDraft() {
    startAiTransition(async () => {
      if (!form.name.trim()) {
        toast.error("Enter a recipe name first.");
        return;
      }

      const promptIngredients = form.ingredients.map((ingredient) => ingredient.name.trim()).filter(Boolean);

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeName: form.name.trim(),
          pantryIngredients: promptIngredients,
          cuisine: form.cuisine || undefined,
          maxPrepMinutes: form.prep_time_minutes ? Number(form.prep_time_minutes) : undefined,
          dietaryPreferences: form.diet_tags
        })
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error ?? "Unable to generate recipe draft.");
        return;
      }

      const draft = result.data;

      setForm((prev) => {
        const hasExistingIngredients = prev.ingredients.some((item) => item.name.trim().length > 0);

        return {
          ...prev,
          name: prev.name.trim() ? prev.name : draft.name ?? prev.name,
          instructions: prev.instructions.trim() ? prev.instructions : draft.instructions ?? prev.instructions,
          ingredients:
            !hasExistingIngredients && Array.isArray(draft.ingredients) && draft.ingredients.length > 0
              ? draft.ingredients.map((item: IngredientItem) => ({
                  id: item.id ?? crypto.randomUUID(),
                  name: item.name ?? "",
                  quantity: item.quantity ?? "",
                  unit: item.unit ?? "",
                  notes: item.notes ?? ""
                }))
              : prev.ingredients,
          cuisine: prev.cuisine.trim() ? prev.cuisine : draft.cuisine ?? prev.cuisine,
          prep_time_minutes:
            prev.prep_time_minutes.trim()
              ? prev.prep_time_minutes
              : draft.prep_time_minutes?.toString() ?? prev.prep_time_minutes,
          difficulty: prev.difficulty ? prev.difficulty : draft.difficulty ?? prev.difficulty,
          diet_tags:
            prev.diet_tags.length > 0
              ? prev.diet_tags
              : Array.isArray(draft.diet_tags)
                ? normalizeDietTags(draft.diet_tags)
                : prev.diet_tags,
          status: prev.status,
          servings:
            prev.servings.trim() ? prev.servings : draft.servings?.toString() ?? prev.servings
        };
      });
      toast.success("AI recipe applied.");
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startSubmitTransition(async () => {
      const parsed = recipeSchema.safeParse({
        ...form,
        prep_time_minutes: form.prep_time_minutes ? Number(form.prep_time_minutes) : null,
        servings: form.servings ? Number(form.servings) : null,
        difficulty: form.difficulty || null
      });

      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Invalid recipe data.");
        return;
      }

      const endpoint = mode === "create" ? "/api/recipes" : `/api/recipes/${recipe?.id}`;
      const response = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data)
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Could not save recipe.");
        return;
      }

      toast.success(mode === "create" ? "Recipe created." : "Recipe updated.");
      router.push(`/app/recipes/${data.recipe.id}`);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>{headline}</CardTitle>
        <Button
          onClick={applyAiDraft}
          type="button"
          variant="secondary"
          disabled={isAiPending || isSubmitPending}
        >
          {isAiPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              AI Recipe
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Recipe name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuisine">Cuisine</Label>
              <Input
                id="cuisine"
                value={form.cuisine}
                onChange={(event) => setForm((prev) => ({ ...prev, cuisine: event.target.value }))}
                placeholder="e.g. Mediterranean"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    status: value as (typeof recipeStatusOptions)[number]["value"]
                  }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {recipeStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prep">Prep minutes</Label>
              <Input
                id="prep"
                type="number"
                min={0}
                value={form.prep_time_minutes}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, prep_time_minutes: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                min={1}
                value={form.servings}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, servings: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={form.difficulty || "none"}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, difficulty: value === "none" ? "" : value }))
                }
              >
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not set</SelectItem>
                  {recipeDifficultyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Diet tags</Label>
            <div className="flex flex-wrap gap-2">
              {dietTagOptions.map((tag) => {
                const active = form.diet_tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleDietTag(tag)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      active ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Ingredients</Label>
              <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                <Plus className="mr-2 h-4 w-4" />
                Add ingredient
              </Button>
            </div>
            <div className="space-y-3">
              {form.ingredients.map((ingredient) => (
                <div key={ingredient.id} className="rounded-lg border p-3">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <Input
                      placeholder="Ingredient"
                      value={ingredient.name}
                      onChange={(event) =>
                        updateIngredient(ingredient.id, "name", event.target.value)
                      }
                      required
                    />
                    <Input
                      placeholder="Quantity"
                      value={ingredient.quantity}
                      onChange={(event) =>
                        updateIngredient(ingredient.id, "quantity", event.target.value)
                      }
                    />
                    <Input
                      placeholder="Unit"
                      value={ingredient.unit}
                      onChange={(event) =>
                        updateIngredient(ingredient.id, "unit", event.target.value)
                      }
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Notes"
                        value={ingredient.notes}
                        onChange={(event) =>
                          updateIngredient(ingredient.id, "notes", event.target.value)
                        }
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(ingredient.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="instructions">Instructions</Label>
              <Badge variant="outline">{form.instructions.length} chars</Badge>
            </div>
            <Textarea
              id="instructions"
              value={form.instructions}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, instructions: event.target.value }))
              }
              placeholder="Write each step clearly. You can use bullet points."
              className="min-h-40"
              required
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isSubmitPending || isAiPending}>
              {isSubmitPending ? "Saving..." : mode === "create" ? "Create recipe" : "Save changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitPending}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
