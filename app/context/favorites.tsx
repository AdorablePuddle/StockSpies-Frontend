import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

const STORAGE_KEY = "stockspies:favorites";
const DEFAULT_FAVORITES = ["Strawberries", "Potatoes", "Bananas"];

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

type FavoritesContextValue = {
  favorites: string[];
  setFavorites: (next: string[]) => void;
  options: readonly string[];
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

function normalizeFavorites(next: string[]): string[] {
  return next
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
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
