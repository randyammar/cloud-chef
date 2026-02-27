import type { RecipeDifficulty, RecipeStatus } from "@/lib/types";
import { normalizeDietTag } from "@/lib/diet-tags";

export interface RecipeFilters {
  q?: string;
  ingredient?: string;
  cuisine?: string;
  maxPrep?: number;
  difficulty?: RecipeDifficulty;
  diet?: string;
  status?: RecipeStatus | string;
}

export function parseRecipeStatusInput(value?: string | null): RecipeStatus | undefined {
  if (!value) return undefined;
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");

  if (normalized === "favorite") return "favorite";
  if (normalized === "to_try" || normalized === "totry") return "to_try";
  if (normalized === "made_before" || normalized === "madebefore") return "made_before";
  return undefined;
}

export function normalizeRecipeFilters(filters: RecipeFilters): RecipeFilters {
  const normalized: RecipeFilters = {};

  if (filters.q?.trim()) normalized.q = filters.q.trim();
  if (filters.ingredient?.trim()) normalized.ingredient = filters.ingredient.trim();
  if (filters.cuisine?.trim()) normalized.cuisine = filters.cuisine.trim();
  if (typeof filters.maxPrep === "number" && Number.isFinite(filters.maxPrep)) {
    normalized.maxPrep = Math.max(0, Math.floor(filters.maxPrep));
  }
  if (filters.difficulty) normalized.difficulty = filters.difficulty;
  const normalizedDiet = normalizeDietTag(filters.diet);
  if (normalizedDiet) normalized.diet = normalizedDiet;
  const parsedStatus = parseRecipeStatusInput(filters.status);
  if (parsedStatus) normalized.status = parsedStatus;

  return normalized;
}
