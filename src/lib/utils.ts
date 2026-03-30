import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatDateShort(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  }).toUpperCase();
}

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPrice(price: number, isFree: boolean): string {
  if (isFree) return "Gratuit";
  return `${price.toFixed(2)} €`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function getTonight(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function getThisWeekend(): { from: string; to: string } {
  const now = new Date();
  const day = now.getDay();
  const daysUntilFriday = day <= 5 ? 5 - day : 0;
  const friday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilFriday, 18, 0);
  const sunday = new Date(friday.getFullYear(), friday.getMonth(), friday.getDate() + (day === 0 ? 0 : 7 - friday.getDay()), 23, 59, 59);

  if (day === 6) {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(),
      to: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59).toISOString(),
    };
  }
  if (day === 0) {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(),
      to: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString(),
    };
  }

  return { from: friday.toISOString(), to: sunday.toISOString() };
}

export function getThisWeek(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = now.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59, 59);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function generateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("ziben_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("ziben_session_id", id);
  }
  return id;
}

export function formatCapacity(capacity: number | null, rsvpCount: number): string | null {
  if (!capacity) return null;
  const remaining = capacity - rsvpCount;
  if (remaining <= 0) return "Complet";
  if (remaining <= 5) return `${remaining} places restantes`;
  return `${remaining} places`;
}

export function formatCountdown(date: string | Date): string | null {
  const d = new Date(date);
  const now = new Date();

  // Not today? Return null
  if (
    d.getFullYear() !== now.getFullYear() ||
    d.getMonth() !== now.getMonth() ||
    d.getDate() !== now.getDate()
  ) return null;

  const diffMs = d.getTime() - now.getTime();

  // Already started
  if (diffMs < 0) return null;

  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 15) return "Maintenant !";
  if (diffMin < 60) return `Dans ${diffMin}min`;

  const diffH = Math.floor(diffMin / 60);
  return `Dans ${diffH}h`;
}

export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = (eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  if (diff === 0) return "Ce soir";
  if (diff === 1) return "Demain";
  if (diff > 1 && diff <= 6) return formatDate(date);
  return formatDate(date);
}
