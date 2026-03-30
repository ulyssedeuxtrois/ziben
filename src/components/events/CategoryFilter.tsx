"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

// Couleur d'accent par catégorie quand inactive
const CAT_INACTIVE_STYLE: Record<string, string> = {
  "musique-soirees":        "bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200",
  "arts-spectacles":        "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200",
  "culture-expositions":    "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  "conferences-savoirs":    "bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200",
  "vie-locale":             "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200",
  "sport-bien-etre":        "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
  "food-degustations":      "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
  "famille-enfants":        "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200",
  "nature-decouvertes":     "bg-lime-100 text-lime-800 border-lime-200 hover:bg-lime-200",
  "jeux-geek":              "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200",
  "business-networking":    "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200",
  "evenements-saisonniers": "bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200",
};

// Couleur d'accent par catégorie quand active
const CAT_ACTIVE_STYLE: Record<string, string> = {
  "musique-soirees":        "bg-violet-600 text-white shadow-lg shadow-violet-500/30 border-transparent",
  "arts-spectacles":        "bg-rose-600 text-white shadow-lg shadow-rose-500/30 border-transparent",
  "culture-expositions":    "bg-blue-600 text-white shadow-lg shadow-blue-500/30 border-transparent",
  "conferences-savoirs":    "bg-teal-600 text-white shadow-lg shadow-teal-500/30 border-transparent",
  "vie-locale":             "bg-amber-500 text-white shadow-lg shadow-amber-500/30 border-transparent",
  "sport-bien-etre":        "bg-green-600 text-white shadow-lg shadow-green-500/30 border-transparent",
  "food-degustations":      "bg-orange-500 text-white shadow-lg shadow-orange-500/30 border-transparent",
  "famille-enfants":        "bg-pink-500 text-white shadow-lg shadow-pink-500/30 border-transparent",
  "nature-decouvertes":     "bg-lime-600 text-white shadow-lg shadow-lime-500/30 border-transparent",
  "jeux-geek":              "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border-transparent",
  "business-networking":    "bg-slate-700 text-white shadow-lg shadow-slate-500/30 border-transparent",
  "evenements-saisonniers": "bg-sky-600 text-white shadow-lg shadow-sky-500/30 border-transparent",
};

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "";

  function selectCategory(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === activeCategory) {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => selectCategory("")}
        className={cn(
          "chip flex-shrink-0",
          !activeCategory ? "chip-active" : "chip-inactive"
        )}
      >
        Tout
      </button>
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.slug;
        return (
          <button
            key={cat.slug}
            onClick={() => selectCategory(cat.slug)}
            className={cn(
              "chip flex-shrink-0 whitespace-nowrap border",
              isActive
                ? (CAT_ACTIVE_STYLE[cat.slug] || "chip-active")
                : (CAT_INACTIVE_STYLE[cat.slug] || "chip-inactive")
            )}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
