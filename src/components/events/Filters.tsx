"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const isFree = searchParams.get("free") === "true";
  const dateFrom = searchParams.get("from") || "";
  const dateTo = searchParams.get("to") || "";

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/?${params.toString()}`);
  }

  function clearAll() {
    router.push("/");
  }

  const hasFilters = isFree || dateFrom || dateTo;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
          hasFilters
            ? "bg-primary-600 text-white"
            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
        )}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtres
        {hasFilters && (
          <span className="bg-white text-primary-600 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            !
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 z-40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Filtres</h3>
            {hasFilters && (
              <button
                onClick={clearAll}
                className="text-xs text-primary-600 hover:underline"
              >
                Tout effacer
              </button>
            )}
          </div>

          {/* Prix */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Prix
            </label>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => updateFilter("free", isFree ? null : "true")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm transition-colors",
                  isFree
                    ? "bg-primary-100 text-primary-700 font-medium"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                Gratuit
              </button>
              <button
                onClick={() => updateFilter("free", null)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm transition-colors",
                  !isFree
                    ? "bg-primary-100 text-primary-700 font-medium"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                Tous les prix
              </button>
            </div>
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Date
            </label>
            <div className="mt-2 flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => updateFilter("from", e.target.value)}
                className="input text-sm"
                placeholder="Du"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => updateFilter("to", e.target.value)}
                className="input text-sm"
                placeholder="Au"
              />
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="w-full btn-primary text-sm"
          >
            Appliquer
          </button>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
