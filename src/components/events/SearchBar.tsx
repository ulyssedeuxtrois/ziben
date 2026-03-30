"use client";

import { Search } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Suggestion {
  id: string;
  title: string;
  location: string;
  categoryIcon: string;
  date: string;
}

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await fetch(`/api/events/suggest?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const data = await res.json();
      setSuggestions(data);
      setShowDropdown(data.length > 0);
    } catch {
      // silently fail
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowDropdown(false);
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    router.push(`/?${params.toString()}`);
  }

  function handleSuggestionClick(id: string) {
    setShowDropdown(false);
    router.push(`/events/${id}`);
  }

  function handleBlur() {
    blurTimeoutRef.current = setTimeout(() => setShowDropdown(false), 150);
  }

  function handleFocus() {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    if (suggestions.length > 0) setShowDropdown(true);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setShowDropdown(false);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-xl shadow-black/10 focus-within:shadow-2xl focus-within:shadow-black/15 transition-shadow">
        <Search className="w-5 h-5 text-gray-400 ml-5" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Concert, karaoké, marché, atelier..."
          className="flex-1 px-4 py-4 bg-transparent outline-none text-sm placeholder:text-gray-400 dark:text-white"
        />
        <button
          type="submit"
          className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full mr-1.5 transition-colors"
        >
          Rechercher
        </button>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg shadow-black/15 z-50 overflow-hidden border border-gray-100 dark:border-gray-700">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={() => handleSuggestionClick(s.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <span className="text-lg shrink-0">{s.categoryIcon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {s.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {s.location}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
