"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

const SORT_OPTIONS = [
  { id: "date", label: "Date" },
  { id: "popularity", label: "Popularité" },
];

export function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const isFree = searchParams.get("free") === "true";
  const isPaid = searchParams.get("paid") === "true";
  const sortBy = searchParams.get("sortBy") || "date";
  const dateFrom = searchParams.get("from") || "";
  const dateTo = searchParams.get("to") || "";
  const today = new Date().toISOString().split("T")[0];
  const isToday = dateFrom === today && dateTo === today;

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/?${params.toString()}`);
  }

  function setPrix(mode: "free" | "paid" | "all") {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("free");
    params.delete("paid");
    if (mode === "free") params.set("free", "true");
    if (mode === "paid") params.set("paid", "true");
    router.push(`/?${params.toString()}`);
  }

  function setToday() {
    const params = new URLSearchParams(searchParams.toString());
    if (isToday) {
      params.delete("from");
      params.delete("to");
    } else {
      params.set("from", today);
      params.set("to", today);
    }
    router.push(`/?${params.toString()}`);
  }

  function setSort(sort: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === "date") {
      params.delete("sortBy");
    } else {
      params.set("sortBy", sort);
    }
    router.push(`/?${params.toString()}`);
  }

  function clearAll() {
    router.push("/");
    setOpen(false);
  }

  const activeCount = [
    isFree || isPaid,
    dateFrom || dateTo,
    sortBy && sortBy !== "date",
  ].filter(Boolean).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
          activeCount > 0
            ? "bg-primary-500 text-white border-transparent"
            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        )}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Filtres
        {activeCount > 0 && (
          <span className="bg-white text-primary-600 text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />

          <div className="absolute top-full right-0 mt-2 w-72 bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-700/60 p-4 z-40">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Filtres</h3>
              {activeCount > 0 && (
                <button onClick={clearAll} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                  Tout effacer
                </button>
              )}
            </div>

            {/* Prix */}
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Prix</label>
              <div className="mt-2 flex gap-2">
                {([
                  { id: "all", label: "Tous" },
                  { id: "free", label: "Gratuit" },
                  { id: "paid", label: "Payant" },
                ] as const).map((opt) => {
                  const isActive =
                    opt.id === "free" ? isFree :
                    opt.id === "paid" ? isPaid :
                    !isFree && !isPaid;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setPrix(opt.id)}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-sm transition-colors font-medium",
                        isActive
                          ? "bg-primary-500 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date */}
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date</label>
              <div className="mt-2 space-y-2">
                <button
                  onClick={setToday}
                  className={cn(
                    "w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors font-medium",
                    isToday
                      ? "bg-primary-500 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  Aujourd'hui
                </button>
                <div className="flex flex-col gap-1.5">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => updateFilter("from", e.target.value)}
                    className="w-full bg-gray-800 text-white text-sm px-2 py-1.5 rounded-lg border border-gray-700 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="Du"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => updateFilter("to", e.target.value)}
                    className="w-full bg-gray-800 text-white text-sm px-2 py-1.5 rounded-lg border border-gray-700 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="Au"
                  />
                </div>
              </div>
            </div>

            {/* Trier par */}
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Trier par</label>
              <div className="mt-2 flex gap-2">
                {SORT_OPTIONS.map((opt) => {
                  const isActive = sortBy === opt.id || (opt.id === "date" && sortBy === "date");
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSort(opt.id)}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-sm transition-colors font-medium",
                        isActive
                          ? "bg-primary-500 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
            >
              Appliquer
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
