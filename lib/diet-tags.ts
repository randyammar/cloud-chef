import { dietTagOptions, type DietTag } from "@/lib/constants";

const dietTagLookup = new Map<string, DietTag>();

for (const option of dietTagOptions) {
  dietTagLookup.set(option, option);
  dietTagLookup.set(option.replace(/-/g, ""), option);
}

function normalizeDietTagKey(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export function normalizeDietTag(value?: string | null): DietTag | undefined {
  if (!value) return undefined;
  const normalized = normalizeDietTagKey(value);
  return dietTagLookup.get(normalized) ?? dietTagLookup.get(normalized.replace(/-/g, ""));
}

export function normalizeDietTags(values?: string[] | null): DietTag[] {
  if (!Array.isArray(values)) return [];

  const deduped = new Set<DietTag>();
  for (const value of values) {
    const tag = normalizeDietTag(value);
    if (tag) deduped.add(tag);
  }

  return Array.from(deduped);
}
