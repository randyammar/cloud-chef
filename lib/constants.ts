import type { RecipeDifficulty, RecipeStatus } from "@/lib/types";

export const recipeStatusOptions: Array<{ value: RecipeStatus; label: string }> = [
  { value: "favorite", label: "Favorite" },
  { value: "to_try", label: "To Try" },
  { value: "made_before", label: "Made Before" }
];

export const recipeDifficultyOptions: Array<{ value: RecipeDifficulty; label: string }> = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" }
];

export const dietTagOptions = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "keto",
  "high-protein",
  "low-carb"
] as const;

export type DietTag = (typeof dietTagOptions)[number];

export const QUICK_FAVORITES_STORAGE_KEY = "cloudchef_recipe_favorites";
