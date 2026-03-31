"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Flame, Sun, CalendarDays } from "lucide-react";
import { cn, getTonight, getThisWeekend, getThisWeek } from "@/lib/utils";

const PERIODS = [
  { id: "ce-soir", label: "Ce soir", icon: Flame, color: "from-orange-500 to-red-500" },
  { id: "ce-week-end", label: "Ce week-end", icon: Sun, color: "from-yellow-500 to-orange-500" },
  { id: "cette-semaine", label: "Cette semaine", icon: CalendarDays, color: "from-primary-500 to-primary-600" },
] as const;

export function TimeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activePeriod = searchParams.get("period") || "";

  function selectPeriod(periodId: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (periodId === activePeriod) {
      params.delete("period");
      params.delete("dateFrom");
      params.delete("dateTo");
    } else {
      params.set("period", periodId);
      let range: { from: string; to: string };
      if (periodId === "ce-soir") range = getTonight();
      else if (periodId === "ce-week-end") range = getThisWeekend();
      else range = getThisWeek();
      params.set("dateFrom", range.from);
      params.set("dateTo", range.to);
    }

    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {PERIODS.map((period) => {
        const Icon = period.icon;
        const isActive = activePeriod === period.id;
        return (
          <button
            key={period.id}
            onClick={() => selectPeriod(period.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer select-none whitespace-nowrap flex-shrink-0",
              isActive
                ? `bg-gradient-to-r ${period.color} text-white shadow-lg`
                : "chip-inactive"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{period.label}</span>
          </button>
        );
      })}
    </div>
  );
}
