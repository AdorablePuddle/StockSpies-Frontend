import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

const STORAGE_KEY = "stockspies:favorites";
const DEFAULT_FAVORITES = ["Strawberries", "Potatoes", "Bananas"];

export const MAX_FAVORITES = 3;

const PRODUCE_OPTIONS = [
  "Apples",
  "Bananas",
  "Red Potatoes",
  "Yellow Potatoes",
  "Red Onions",
  "Bagged Potatoes",
  "Purple Onions",
  "Russet Potatoes",
  "Onions",
  "Cucumbers",
  "Potatoes",
  "Packaged Mushrooms",
  "Eggplants",
  "Zucchinis",
  "Sweet Potatoes",
  "Tomatoes",
  "Garlic",
  "Strawberries",
] as const;

function canonicalize(label: string) {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

function singularizeWord(word: string) {
  if (word.length === 0) return word;
  if (word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.endsWith("oes")) return word.slice(0, -2);
  if (/(sses|zzes|ches|shes)$/i.test(word)) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function singularizePhrase(phrase: string) {
  const parts = phrase.trim().split(/\s+/);
  if (parts.length === 0) return phrase;
  const last = parts[parts.length - 1];
  parts[parts.length - 1] = singularizeWord(last);
  return parts.join(" ");
}

const OPTION_LOOKUP = PRODUCE_OPTIONS.reduce<Map<string, string>>((acc, option) => {
  const canonicalOption = canonicalize(option);
  acc.set(canonicalOption, option);
  acc.set(canonicalize(singularizePhrase(option)), option);
  return acc;
}, new Map());

export function resolveFavoriteOption(label: string): string | null {
  const canonicalKey = canonicalize(label);
  return OPTION_LOOKUP.get(canonicalKey) ?? null;
}

type FavoritesContextValue = {
  favorites: string[];
  setFavorites: (next: string[]) => void;
  options: readonly string[];
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

function normalizeFavorites(next: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const item of next) {
    const trimmed = item.trim();
    if (!trimmed) continue;

    const resolved = resolveFavoriteOption(trimmed);
    if (!resolved) {
      continue;
    }
    if (seen.has(resolved)) continue;

    seen.add(resolved);
    normalized.push(resolved);
    if (normalized.length >= MAX_FAVORITES) {
      break;
    }
  }

  return normalized;
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavoritesState] = useState<string[]>(DEFAULT_FAVORITES);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const normalized = normalizeFavorites(parsed.map(String));
          if (normalized.length) {
            setFavoritesState(normalized);
          }
        }
      }
    } catch {
      // ignore corrupt data
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const setFavorites = (next: string[]) => {
    setFavoritesState(normalizeFavorites(next));
  };

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      setFavorites,
      options: PRODUCE_OPTIONS,
    }),
    [favorites]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return ctx;
}
