export const RECIPE_STATUSES = ["favorite", "to_try", "made_before"] as const;
export const RECIPE_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type RecipeStatus = (typeof RECIPE_STATUSES)[number];
export type RecipeDifficulty = (typeof RECIPE_DIFFICULTIES)[number];

export interface IngredientItem {
  id: string;
  name: string;
  quantity?: string;
  unit?: string;
  notes?: string;
}

export interface RecipeRecord {
  id: string;
  owner_id: string;
  name: string;
  ingredients: IngredientItem[];
  instructions: string;
  cuisine: string | null;
  prep_time_minutes: number | null;
  difficulty: RecipeDifficulty | null;
  diet_tags: string[];
  status: RecipeStatus;
  servings: number | null;
  created_at: string;
  updated_at: string;
}

export interface RecipeShareRecord {
  id: string;
  recipe_id: string;
  token: string;
  access: "viewer";
  is_revoked: boolean;
  created_by: string;
  created_at: string;
}

export interface ProfileRecord {
  id: string;
  display_name: string | null;
  ai_opt_in: boolean;
  created_at: string;
}
