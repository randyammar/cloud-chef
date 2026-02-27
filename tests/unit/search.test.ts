import { describe, expect, it } from "vitest";
import { normalizeRecipeFilters } from "@/lib/search";

describe("normalizeRecipeFilters", () => {
  it("trims text fields and removes empty values", () => {
    const result = normalizeRecipeFilters({
      q: "  pasta  ",
      ingredient: " ",
      cuisine: " italian ",
      maxPrep: 30.9
    });

    expect(result).toEqual({
      q: "pasta",
      cuisine: "italian",
      maxPrep: 30
    });
  });

  it("normalizes negative prep time to zero", () => {
    const result = normalizeRecipeFilters({ maxPrep: -10 });
    expect(result.maxPrep).toBe(0);
  });

  it("normalizes diet tag filter values", () => {
    const result = normalizeRecipeFilters({ diet: "High Protein" });
    expect(result.diet).toBe("high-protein");
  });
});
