import { describe, expect, it } from "vitest";
import { recipeSchema } from "@/lib/validators";

describe("recipeSchema", () => {
  it("accepts a valid recipe payload", () => {
    const parsed = recipeSchema.safeParse({
      name: "Simple Tomato Pasta",
      ingredients: [{ id: "1", name: "Tomato", quantity: "2", unit: "pcs" }],
      instructions: "Boil pasta. Cook tomatoes. Combine and serve.",
      cuisine: "Italian",
      prep_time_minutes: 25,
      difficulty: "easy",
      diet_tags: ["vegetarian"],
      status: "to_try",
      servings: 2
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects a recipe without ingredients", () => {
    const parsed = recipeSchema.safeParse({
      name: "No Ingredient Recipe",
      ingredients: [],
      instructions: "Just cook it somehow.",
      status: "to_try"
    });
    expect(parsed.success).toBe(false);
  });

  it("normalizes and filters unsupported diet tags", () => {
    const parsed = recipeSchema.safeParse({
      name: "Protein Bowl",
      ingredients: [{ id: "1", name: "Chicken" }],
      instructions: "Cook chicken and serve with vegetables.",
      diet_tags: ["High Protein", "unknown-tag", "VEGAN"],
      status: "to_try"
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.diet_tags).toEqual(["high-protein", "vegan"]);
  });
});
