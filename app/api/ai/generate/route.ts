import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { generateRecipeDraft } from "@/lib/ai";
import { requireAiEnabled } from "@/lib/ai-guard";
import { logAiUsage } from "@/lib/data/recipes";
import { RECIPE_DIFFICULTIES } from "@/lib/types";
import { aiGenerateSchema } from "@/lib/validators";

function safeJsonParse(raw: string) {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function extractJsonCandidate(raw: string) {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    return fenceMatch[1].trim();
  }

  const objectStart = raw.indexOf("{");
  const objectEnd = raw.lastIndexOf("}");
  if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
    return raw.slice(objectStart, objectEnd + 1);
  }

  return raw;
}

function toStringValue(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function toNumberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function firstNonEmpty(...values: unknown[]) {
  for (const value of values) {
    const text = toStringValue(value);
    if (text) return text;
  }
  return "";
}

function toInstructionText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          const row = item as Record<string, unknown>;
          return firstNonEmpty(row.step, row.instruction, row.description, row.text);
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

function parseIngredientLine(line: string) {
  const cleaned = line.trim().replace(/^[-*]\s*/, "");
  if (!cleaned) {
    return { name: "", quantity: "", unit: "" };
  }

  const match = cleaned.match(
    /^(\d+(?:\.\d+)?(?:\/\d+)?(?:\s+\d+\/\d+)?)\s*([a-zA-Z]+)?\s+(.+)$/
  );

  if (!match) {
    return { name: cleaned, quantity: "", unit: "" };
  }

  return {
    quantity: (match[1] ?? "").trim(),
    unit: (match[2] ?? "").trim(),
    name: (match[3] ?? "").trim()
  };
}

function isBasicInstructionSet(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const numbered = lines.filter((line) => /^\d+[\.\)]/.test(line)).length;
  return text.length < 320 || lines.length < 5 || numbered < 4;
}

function buildDetailedInstructions(options: {
  recipeName: string;
  prepMinutes: number | null;
  ingredients: Array<{ name: string }>;
}) {
  const topIngredients = options.ingredients
    .map((item) => item.name)
    .filter(Boolean)
    .slice(0, 4);
  const ingredientText =
    topIngredients.length > 0 ? topIngredients.join(", ") : "your prepared ingredients";
  const prep = options.prepMinutes ?? 30;

  return [
    `1. Mise en place: gather ${ingredientText}, wash and prep all produce, and measure seasonings before heat starts. Keep separate bowls for quick additions.`,
    `2. Heat management: preheat a pan over medium heat for 2-3 minutes (or oven to 400F/205C if roasting). Add oil only when the pan is warm but not smoking.`,
    `3. Build base flavor: cook aromatics first for 60-90 seconds until fragrant, then add the main ingredients in batches to avoid overcrowding and steaming.`,
    `4. Main cook: cook for ${Math.max(6, Math.floor(prep * 0.45))}-${Math.max(10, Math.floor(prep * 0.65))} minutes, stirring periodically. Look for even browning, softened texture, and a light gloss in the sauce.`,
    "5. Adjust and finish: season with salt/pepper in small increments, add a splash of water or stock if dry, or simmer 1-2 extra minutes if too watery.",
    `6. Final touch: rest for 2 minutes, taste once more, then plate ${options.recipeName} with fresh herbs or citrus for brightness before serving.`
  ].join("\n");
}

function ensureDetailedInstructions(
  instructions: string,
  context: {
    recipeName: string;
    prepMinutes: number | null;
    ingredients: Array<{ name: string }>;
  }
) {
  const trimmed = instructions.trim();
  if (!trimmed || isBasicInstructionSet(trimmed)) {
    return buildDetailedInstructions(context);
  }
  return trimmed;
}

function normalizeDraftPayload(
  raw: unknown,
  input: {
    recipeName: string;
    cuisine?: string;
    maxPrepMinutes?: number;
    dietaryPreferences?: string[];
  }
) {
  const root =
    raw && typeof raw === "object" && "recipe" in (raw as Record<string, unknown>)
      ? (raw as { recipe?: unknown }).recipe
      : raw;

  if (!root || typeof root !== "object") return null;
  const draft = root as Record<string, unknown>;

  const name = toStringValue(draft.name);
  const instructionsFromText = toInstructionText(draft.instructions);
  const steps = toInstructionText(draft.steps);
  const directions = toInstructionText(draft.directions);
  const method = toInstructionText(draft.method);
  const instructions = instructionsFromText || steps;

  const rawIngredients = Array.isArray(draft.ingredients) ? draft.ingredients : [];
  type DraftIngredient = {
    id: string;
    name: string;
    quantity: string;
    unit: string;
    notes: string;
  };
  const ingredients = rawIngredients
    .map<DraftIngredient | null>((ingredient) => {
      if (typeof ingredient === "string") {
        const parsed = parseIngredientLine(ingredient);
        if (!parsed.name) return null;
        return {
          id: randomUUID(),
          name: parsed.name,
          quantity: parsed.quantity,
          unit: parsed.unit,
          notes: ""
        };
      }
      if (!ingredient || typeof ingredient !== "object") return null;
      const row = ingredient as Record<string, unknown>;
      const ingredientName = firstNonEmpty(
        row.name,
        row.ingredient,
        row.item,
        row.title,
        row.label
      );
      if (!ingredientName) return null;
      const rawQuantity = firstNonEmpty(
        row.quantity,
        row.amount,
        row.qty,
        row.measurement,
        row.measure
      );
      const rawUnit = firstNonEmpty(row.unit, row.units, row.uom);
      const parsedFromName = !rawQuantity && !rawUnit ? parseIngredientLine(ingredientName) : null;

      return {
        id: randomUUID(),
        name: parsedFromName?.name || ingredientName,
        quantity: parsedFromName?.quantity || rawQuantity,
        unit: parsedFromName?.unit || rawUnit,
        notes: toStringValue(row.notes)
      };
    })
    .filter((ingredient): ingredient is DraftIngredient => ingredient !== null);

  if (ingredients.length === 0) return null;

  const prep = toNumberValue(draft.prep_time_minutes);
  const servings = toNumberValue(draft.servings);
  const difficultyCandidate = toStringValue(draft.difficulty).toLowerCase();
  const difficulty = RECIPE_DIFFICULTIES.includes(
    difficultyCandidate as (typeof RECIPE_DIFFICULTIES)[number]
  )
    ? (difficultyCandidate as (typeof RECIPE_DIFFICULTIES)[number])
    : null;
  const dietTags = Array.isArray(draft.diet_tags)
    ? draft.diet_tags.map(toStringValue).filter(Boolean)
    : input.dietaryPreferences ?? [];
  const prepMinutes =
    prep !== null
      ? Math.max(0, Math.min(1_440, Math.floor(prep)))
      : input.maxPrepMinutes ?? 30;
  const resolvedName = name || input.recipeName;
  const resolvedInstructions = ensureDetailedInstructions(
    firstNonEmpty(instructions, directions, method),
    {
      recipeName: resolvedName,
      prepMinutes,
      ingredients
    }
  );

  return {
    name: resolvedName,
    ingredients,
    instructions: resolvedInstructions,
    cuisine: firstNonEmpty(draft.cuisine, draft.cuisine_type, input.cuisine, "Global"),
    prep_time_minutes: prepMinutes,
    difficulty,
    diet_tags: dietTags,
    status: "to_try" as const,
    servings:
      servings !== null ? Math.max(1, Math.min(100, Math.floor(servings))) : 2
  };
}

function textFromUnknown(raw: unknown) {
  if (typeof raw === "string") return raw.trim();
  if (raw && typeof raw === "object") {
    try {
      return JSON.stringify(raw);
    } catch {
      return "";
    }
  }
  return "";
}

function buildFallbackDraft(input: {
  recipeName: string;
  pantryIngredients: string[];
  cuisine?: string;
  maxPrepMinutes?: number;
  dietaryPreferences?: string[];
}, rawOutput: unknown) {
  const source = textFromUnknown(rawOutput);
  const looksJsonLike =
    source.trim().startsWith("{") ||
    source.trim().startsWith("[") ||
    source.includes('"name"') ||
    source.includes('{"');
  const firstLine = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0 && !line.startsWith("```"));

  const cleanedFirstLine =
    firstLine && firstLine.length <= 80
      ? firstLine.replace(/^#+\s*/, "").replace(/^name:\s*/i, "")
      : "";
  const draftName =
    cleanedFirstLine &&
    !cleanedFirstLine.startsWith("{") &&
    !cleanedFirstLine.startsWith("[")
      ? cleanedFirstLine
      : input.recipeName;

  const fallbackIngredients = input.pantryIngredients.length > 0
    ? input.pantryIngredients
    : ["Olive oil", "Garlic", "Salt", "Black pepper"];
  const fallbackIngredientRows = fallbackIngredients.map((ingredient) => ({
    id: randomUUID(),
    name: ingredient,
    quantity: "1",
    unit: "",
    notes: ""
  }));
  const prepMinutes = input.maxPrepMinutes ?? 30;
  const baseInstructions =
    !looksJsonLike && source.length >= 10 ? source : "";
  const instructions = ensureDetailedInstructions(baseInstructions, {
    recipeName: draftName,
    prepMinutes,
    ingredients: fallbackIngredientRows
  });

  return {
    name: draftName,
    ingredients: fallbackIngredientRows,
    instructions,
    cuisine: input.cuisine ?? "Global",
    prep_time_minutes: prepMinutes,
    difficulty: null,
    diet_tags: input.dietaryPreferences ?? [],
    status: "to_try" as const,
    servings: 2
  };
}

export async function POST(request: Request) {
  const { user, response } = await requireAiEnabled();
  if (!user) return response;

  const body = await request.json();
  const parsed = aiGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  try {
    const raw = await generateRecipeDraft(parsed.data);
    const direct = safeJsonParse(raw);
    const candidate = direct ? direct : safeJsonParse(extractJsonCandidate(raw));
    const normalized = candidate ? normalizeDraftPayload(candidate, parsed.data) : null;
    const draft = normalized ?? buildFallbackDraft(parsed.data, candidate ?? raw);

    await logAiUsage(user.id, "generate", true);
    return NextResponse.json({ data: draft });
  } catch (error) {
    await logAiUsage(user.id, "generate", false);
    return NextResponse.json({ error: "Failed to generate recipe draft.", details: String(error) }, { status: 500 });
  }
}
