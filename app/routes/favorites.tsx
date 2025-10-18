import type { Route } from "./+types/favorites";
import { useEffect, useState } from "react";
import { DashboardLayout } from "../components/layouts/DashboardLayout";
import { requireAuth } from "../utils/auth.server";
import { useFavorites } from "../context/favorites";
import { useNavigate } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request);
  return null;
}

const MAX_FAVORITES = 3;

export default function FavoritesRoute() {
  const navigate = useNavigate();
  const { favorites, setFavorites, options } = useFavorites();
  const [selected, setSelected] = useState<string[]>(favorites);
  const remainingSlots = MAX_FAVORITES - selected.length;

  useEffect(() => {
    setSelected(favorites);
  }, [favorites]);

  const toggleSelection = (item: string) => {
    setSelected((prev) => {
      if (prev.includes(item)) {
        return prev.filter((label) => label !== item);
      }
      if (prev.length >= MAX_FAVORITES) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const handleSave = () => {
    setFavorites(selected);
    navigate("/home");
  };

  return (
    <DashboardLayout title="Favorites" activeNav="dashboard">
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Select favorites</h1>
          <p className="text-sm text-slate-500">
            Choose up to three produce items to highlight on your dashboard. These will appear at
            the top of the home page for quick reference.
          </p>
        </header>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <p className="text-sm text-slate-500">
              {remainingSlots > 0
                ? `${remainingSlots} slot${remainingSlots === 1 ? "" : "s"} remaining`
                : "Favorite list is full"}
            </p>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
              <button
                type="button"
                className="font-semibold text-red-500 transition hover:text-red-600"
                onClick={() => setSelected([])}
              >
                Clear
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                className="font-semibold text-red-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleSave}
                disabled={selected.length === 0}
              >
                Save &amp; return
              </button>
            </div>
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {options.map((item) => {
              const isSelected = selected.includes(item);
              const disabled = !isSelected && selected.length >= MAX_FAVORITES;
              return (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => toggleSelection(item)}
                    disabled={disabled}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      isSelected
                        ? "border-red-400 bg-red-50 text-red-600 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-500"
                    } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <span>{item}</span>
                    <span
                      aria-hidden="true"
                      className={`text-xs font-semibold uppercase tracking-[0.3em] ${
                        isSelected ? "text-red-500" : "text-slate-300"
                      }`}
                    >
                      {isSelected ? "Selected" : "Tap"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
