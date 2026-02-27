import { env } from "@/lib/env";

const GEMINI_MODEL = "gemini-2.5-flash";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

function getApiKey() {
  if (!env.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return env.geminiApiKey;
}

async function callGemini(
  prompt: string,
  options?: {
    temperature?: number;
    responseMimeType?: "text/plain" | "application/json";
  }
) {
  const apiKey = getApiKey();
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: options?.temperature ?? 0.5,
          responseMimeType: options?.responseMimeType
        }
      })
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Gemini request failed: ${details}`);
  }

  const result = (await response.json()) as GeminiResponse;
  return result.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("\n").trim() ?? "";
}

export async function generateRecipeDraft(input: {
  recipeName: string;
  pantryIngredients: string[];
  cuisine?: string;
  maxPrepMinutes?: number;
  dietaryPreferences?: string[];
}) {
  const pantry = input.pantryIngredients.length > 0 ? input.pantryIngredients.join(", ") : "none provided";
  const prompt = `Create a practical home-cooking recipe based primarily on this recipe name: "${input.recipeName}".
Return strict JSON only.
Required keys: name, ingredients, instructions, cuisine, prep_time_minutes, difficulty, diet_tags, servings.
ingredients must be an array of objects with keys: name, quantity, unit, notes.
Each ingredient must include a non-empty quantity (string, e.g. "1", "1/2", "2").
If exact amount is unknown, use "1" as quantity.
The "name" should closely match the requested recipe name.
instructions must be detailed and useful for real cooking:
- 6 to 10 numbered steps.
- Include prep details, cooking temperatures/timing, and visual doneness cues.
- Include seasoning guidance and final finishing/plating note.
- Mention fallback tips if a step can fail (e.g., too dry, too watery).
Use clear, concise kitchen language.
Pantry: ${pantry}
Cuisine: ${input.cuisine ?? "any"}
Max prep time: ${input.maxPrepMinutes ?? 45}
Diet preferences: ${(input.dietaryPreferences ?? []).join(", ") || "none"}
difficulty must be easy, medium, or hard.
Return JSON only.`;
  return callGemini(prompt, {
    temperature: 0.4,
    responseMimeType: "application/json"
  });
}

export async function summarizeInstructions(instructions: string) {
  return callGemini(
    `Summarize these instructions into concise numbered cooking steps:\n\n${instructions}`
  );
}

export async function suggestSubstitutions(ingredients: string[]) {
  return callGemini(
    `Suggest smart substitutions for: ${ingredients.join(", ")}. Return as a concise bullet list with tradeoff notes.`
  );
}
