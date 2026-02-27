import { z } from "zod";
import { RECIPE_DIFFICULTIES, RECIPE_STATUSES } from "@/lib/types";
import { parseRecipeStatusInput } from "@/lib/search";
import { normalizeDietTag, normalizeDietTags } from "@/lib/diet-tags";

export const ingredientSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Ingredient name is required"),
  quantity: z.string().trim().optional().or(z.literal("")),
  unit: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal(""))
});

export const recipeSchema = z.object({
  name: z.string().trim().min(2, "Recipe name is too short").max(120),
  ingredients: z.array(ingredientSchema).min(1, "Add at least one ingredient"),
  instructions: z.string().trim().min(10, "Add preparation instructions"),
  cuisine: z.string().trim().max(60).optional().or(z.literal("")),
  prep_time_minutes: z
    .number({ coerce: true })
    .int()
    .min(0, "Prep time must be 0 or more")
    .max(1_440, "Prep time is too high")
    .nullable()
    .optional(),
  difficulty: z.enum(RECIPE_DIFFICULTIES).nullable().optional(),
  diet_tags: z.array(z.string().trim().min(1)).default([]).transform((value) => normalizeDietTags(value)),
  status: z.enum(RECIPE_STATUSES),
  servings: z
    .number({ coerce: true })
    .int()
    .min(1, "Servings must be at least 1")
    .max(100)
    .nullable()
    .optional()
});

export const recipeFilterSchema = z.object({
  q: z.string().trim().optional(),
  ingredient: z.string().trim().optional(),
  cuisine: z.string().trim().optional(),
  maxPrep: z.number({ coerce: true }).int().min(0).max(1_440).optional(),
  difficulty: z.enum(RECIPE_DIFFICULTIES).optional(),
  diet: z.string().trim().optional().transform((value) => normalizeDietTag(value)),
  status: z.preprocess(
    (value) =>
      typeof value === "string" ? parseRecipeStatusInput(value) : value,
    z.enum(RECIPE_STATUSES).optional()
  )
});

export const aiGenerateSchema = z.object({
  recipeName: z.string().trim().min(2, "Recipe name is required for AI Recipe"),
  pantryIngredients: z.array(z.string().trim().min(1)).default([]),
  cuisine: z.string().trim().max(50).optional(),
  maxPrepMinutes: z.number().int().min(5).max(240).optional(),
  dietaryPreferences: z.array(z.string().trim().min(1)).default([])
});

export const aiSummarizeSchema = z.object({
  instructions: z.string().trim().min(20)
});

export const aiSubstitutionSchema = z.object({
  ingredients: z.array(z.string().trim().min(1)).min(1)
});
