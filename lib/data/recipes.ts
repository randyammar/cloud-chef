import { randomBytes } from "node:crypto";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { RecipeFilters } from "@/lib/search";
import { normalizeRecipeFilters, parseRecipeStatusInput } from "@/lib/search";
import { wrapDataError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { normalizeDietTags } from "@/lib/diet-tags";
import type { IngredientItem, RecipeRecord, RecipeStatus } from "@/lib/types";
import type { z } from "zod";
import { recipeSchema } from "@/lib/validators";

type RecipeInsert = Database["public"]["Tables"]["recipes"]["Insert"];
type RecipeUpdate = Database["public"]["Tables"]["recipes"]["Update"];
type RecipeShareRow = Database["public"]["Tables"]["recipe_shares"]["Row"];

function toIngredientItem(item: unknown): IngredientItem | null {
  if (typeof item !== "object" || item === null) return null;
  const row = item as Record<string, unknown>;
  return {
    id: typeof row.id === "string" && row.id.length > 0 ? row.id : randomBytes(8).toString("hex"),
    name: typeof row.name === "string" ? row.name : "Ingredient",
    quantity: typeof row.quantity === "string" ? row.quantity : "",
    unit: typeof row.unit === "string" ? row.unit : "",
    notes: typeof row.notes === "string" ? row.notes : ""
  };
}

function normalizeOptional(value?: string | null) {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeRecipePayload(
  ownerId: string,
  payload: z.infer<typeof recipeSchema>
): RecipeInsert {
  return {
    owner_id: ownerId,
    name: payload.name.trim(),
    ingredients: payload.ingredients,
    instructions: payload.instructions.trim(),
    cuisine: normalizeOptional(payload.cuisine),
    prep_time_minutes: payload.prep_time_minutes ?? null,
    difficulty: payload.difficulty ?? null,
    diet_tags: normalizeDietTags(payload.diet_tags),
    status: payload.status,
    servings: payload.servings ?? null
  };
}

function toRecipeRecord(row: Database["public"]["Tables"]["recipes"]["Row"]): RecipeRecord {
  const ingredients = Array.isArray(row.ingredients)
    ? row.ingredients
        .map(toIngredientItem)
        .filter((item: IngredientItem | null): item is IngredientItem => item !== null)
    : [];

  return {
    id: row.id,
    owner_id: row.owner_id,
    name: row.name,
    ingredients,
    instructions: row.instructions,
    cuisine: row.cuisine,
    prep_time_minutes: row.prep_time_minutes,
    difficulty: row.difficulty,
    diet_tags: normalizeDietTags(row.diet_tags),
    status: row.status,
    servings: row.servings,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export async function listRecipes(
  ownerId: string,
  filters: RecipeFilters = {}
): Promise<RecipeRecord[]> {
  const supabase = await createClient();
  const normalized = normalizeRecipeFilters(filters);
  const ingredientSearch = normalized.ingredient?.toLowerCase() ?? "";
  const dietFilter = normalized.diet ?? "";
  let query = supabase
    .from("recipes")
    .select("*")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });

  if (normalized.q) {
    const qAsStatus = parseRecipeStatusInput(normalized.q);
    if (qAsStatus && !normalized.status) {
      query = query.eq("status", qAsStatus);
    } else {
      query = query.or(`name.ilike.%${normalized.q}%,instructions.ilike.%${normalized.q}%`);
    }
  }
  if (normalized.cuisine) {
    query = query.ilike("cuisine", `%${normalized.cuisine}%`);
  }
  if (typeof normalized.maxPrep === "number") {
    query = query.lte("prep_time_minutes", normalized.maxPrep);
  }
  if (normalized.difficulty) {
    query = query.eq("difficulty", normalized.difficulty);
  }
  if (normalized.status) {
    query = query.eq("status", normalized.status);
  }

  const { data, error } = await query;
  if (error) throw wrapDataError(error);

  let recipes = (data ?? []).map(toRecipeRecord);

  if (dietFilter) {
    recipes = recipes.filter((recipe) => recipe.diet_tags.includes(dietFilter));
  }

  if (!ingredientSearch) return recipes;

  return recipes.filter((recipe) =>
    recipe.ingredients.some((ingredient) =>
      ingredient.name.toLowerCase().includes(ingredientSearch)
    )
  );
}

export async function getRecipe(ownerId: string, recipeId: string): Promise<RecipeRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("id", recipeId)
    .single();

  if (error && error.code !== "PGRST116") throw wrapDataError(error);
  return data ? toRecipeRecord(data) : null;
}

export async function createRecipe(
  ownerId: string,
  payload: z.infer<typeof recipeSchema>
): Promise<RecipeRecord> {
  const supabase = await createClient();
  const dataToInsert = normalizeRecipePayload(ownerId, payload);

  const { data, error } = await supabase
    .from("recipes")
    .insert(dataToInsert)
    .select("*")
    .single();
  if (error) throw wrapDataError(error);
  return toRecipeRecord(data);
}

export async function updateRecipe(
  ownerId: string,
  recipeId: string,
  payload: z.infer<typeof recipeSchema>
): Promise<RecipeRecord> {
  const supabase = await createClient();
  const updatePayload: RecipeUpdate = {
    ...normalizeRecipePayload(ownerId, payload),
    updated_at: new Date().toISOString()
  };
  delete (updatePayload as Partial<RecipeInsert>).owner_id;

  const { data, error } = await supabase
    .from("recipes")
    .update(updatePayload)
    .eq("owner_id", ownerId)
    .eq("id", recipeId)
    .select("*")
    .single();

  if (error) throw wrapDataError(error);
  return toRecipeRecord(data);
}

export async function setRecipeStatus(
  ownerId: string,
  recipeId: string,
  status: RecipeStatus
): Promise<RecipeRecord> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq("owner_id", ownerId)
    .eq("id", recipeId)
    .select("*")
    .single();

  if (error) throw wrapDataError(error);
  return toRecipeRecord(data);
}

export async function deleteRecipe(ownerId: string, recipeId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("owner_id", ownerId)
    .eq("id", recipeId);
  if (error) throw wrapDataError(error);
}

export async function createShareLink(ownerId: string, recipeId: string): Promise<RecipeShareRow> {
  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("recipe_shares")
    .select("*")
    .eq("recipe_id", recipeId)
    .eq("created_by", ownerId)
    .eq("is_revoked", false)
    .maybeSingle();
  if (existingError) throw wrapDataError(existingError);
  if (existing) return existing as RecipeShareRow;

  const token = randomBytes(24).toString("base64url");
  const { data, error } = await supabase
    .from("recipe_shares")
    .insert({
      recipe_id: recipeId,
      token,
      created_by: ownerId,
      access: "viewer"
    })
    .select("*")
    .single();
  if (error) throw wrapDataError(error);
  return data as RecipeShareRow;
}

export async function getActiveShareLink(
  ownerId: string,
  recipeId: string
): Promise<RecipeShareRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipe_shares")
    .select("*")
    .eq("recipe_id", recipeId)
    .eq("created_by", ownerId)
    .eq("is_revoked", false)
    .maybeSingle();
  if (error) throw wrapDataError(error);
  return data as RecipeShareRow | null;
}

export async function revokeShareLink(ownerId: string, recipeId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("recipe_shares")
    .update({ is_revoked: true })
    .eq("created_by", ownerId)
    .eq("recipe_id", recipeId);
  if (error) throw wrapDataError(error);
}

export async function getRecipeByShareToken(token: string): Promise<RecipeRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_shared_recipe", { share_token: token });

  if (error) throw wrapDataError(error);
  if (!data || data.length === 0) return null;
  const row = data[0];
  return {
    id: row.id,
    owner_id: "",
    name: row.name,
    ingredients: Array.isArray(row.ingredients)
      ? row.ingredients
          .map(toIngredientItem)
          .filter((item: IngredientItem | null): item is IngredientItem => item !== null)
      : [],
    instructions: row.instructions,
    cuisine: row.cuisine,
    prep_time_minutes: row.prep_time_minutes,
    difficulty: row.difficulty,
    diet_tags: normalizeDietTags(row.diet_tags),
    status: row.status,
    servings: row.servings,
    created_at: row.updated_at,
    updated_at: row.updated_at
  };
}

export async function setAiOptIn(userId: string, enabled: boolean): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        ai_opt_in: enabled
      },
      { onConflict: "id" }
    )
    .select("ai_opt_in")
    .single();
  if (error) throw wrapDataError(error);
  return data.ai_opt_in;
}

export async function getProfileAiOptIn(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("ai_opt_in")
    .eq("id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw wrapDataError(error);
  return data?.ai_opt_in ?? false;
}

export async function logAiUsage(userId: string, feature: string, success: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("ai_usage_logs").insert({
    user_id: userId,
    feature,
    success
  });
  if (error) throw wrapDataError(error);
}

export function isMissingRow(error: PostgrestError | null) {
  return error?.code === "PGRST116";
}
