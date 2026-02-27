import { QUICK_FAVORITES_STORAGE_KEY } from "@/lib/constants";

export type QuickFavoriteMap = Record<string, boolean>;

export function readQuickFavoriteMap(): QuickFavoriteMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(QUICK_FAVORITES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as QuickFavoriteMap;
  } catch {
    return {};
  }
}

export function writeQuickFavoriteMap(map: QuickFavoriteMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(QUICK_FAVORITES_STORAGE_KEY, JSON.stringify(map));
}

export function readQuickFavoriteIds(): string[] {
  const map = readQuickFavoriteMap();
  return Object.entries(map)
    .filter(([, enabled]) => enabled)
    .map(([id]) => id);
}
