"use client";

import Link from "next/link";
import { MapPin, Heart, Users, Zap } from "lucide-react";
import { formatTime, formatPrice, formatRelativeDate, formatCapacity, formatCountdown } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import type { EventWithCategory } from "@/lib/types";

interface EventCardProps {
  event: EventWithCategory;
}

// Gradient + déco par catégorie — chaque event a une identité visuelle
const CAT_STYLES: Record<string, { gradient: string; dot: string }> = {
  "musique-soirees":       { gradient: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a855f7 100%)", dot: "#c4b5fd" },
  "arts-spectacles":       { gradient: "linear-gradient(135deg, #881337 0%, #e11d48 50%, #fb7185 100%)", dot: "#fda4af" },
  "culture-expositions":   { gradient: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #60a5fa 100%)", dot: "#93c5fd" },
  "conferences-savoirs":   { gradient: "linear-gradient(135deg, #134e4a 0%, #0d9488 50%, #2dd4bf 100%)", dot: "#99f6e4" },
  "vie-locale":            { gradient: "linear-gradient(135deg, #92400e 0%, #d97706 50%, #fbbf24 100%)", dot: "#fde68a" },
  "sport-bien-etre":       { gradient: "linear-gradient(135deg, #14532d 0%, #16a34a 50%, #4ade80 100%)", dot: "#bbf7d0" },
  "food-degustations":     { gradient: "linear-gradient(135deg, #78350f 0%, #ea580c 50%, #fb923c 100%)", dot: "#fed7aa" },
  "famille-enfants":       { gradient: "linear-gradient(135deg, #831843 0%, #ec4899 50%, #f9a8d4 100%)", dot: "#fbcfe8" },
  "nature-decouvertes":    { gradient: "linear-gradient(135deg, #1a2e05 0%, #4d7c0f 50%, #84cc16 100%)", dot: "#d9f99d" },
  "jeux-geek":             { gradient: "linear-gradient(135deg, #312e81 0%, #4338ca 50%, #818cf8 100%)", dot: "#c7d2fe" },
  "business-networking":   { gradient: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #64748b 100%)", dot: "#cbd5e1" },
  "evenements-saisonniers":{ gradient: "linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #38bdf8 100%)", dot: "#bae6fd" },
};

const DEFAULT_STYLE = { gradient: "linear-gradient(135deg, #374151 0%, #6b7280 50%, #9ca3af 100%)", dot: "#d1d5db" };

function CategoryPlaceholder({ slug, icon }: { slug: string; icon: string }) {
  const style = CAT_STYLES[slug] || DEFAULT_STYLE;
  return (
    <div
      className="w-full h-full flex items-center justify-center relative overflow-hidden"
      style={{ background: style.gradient }}
    >
      {/* Déco cercles en arrière-plan */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20" style={{ background: style.dot }} />
      <div className="absolute -bottom-12 -left-6 w-40 h-40 rounded-full opacity-15" style={{ background: style.dot }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-10" style={{ background: style.dot }} />
      {/* Icone principale */}
      <span className="relative text-5xl drop-shadow-lg" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}>
        {icon}
      </span>
    </div>
  );
}

export function EventCard({ event }: EventCardProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const relativeDate = formatRelativeDate(event.date);
  const countdown = formatCountdown(event.date);
  const capacityText = formatCapacity(event.capacity, event.rsvpCount);
  const isTonight = relativeDate === "Ce soir";
  const isBoosted = event.boosted && event.boostedUntil && new Date(event.boostedUntil) > new Date();

  async function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { window.location.href = "/login"; return; }
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/events/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, eventId: event.id }),
      });
      const data = await res.json();
      setSaved(data.saved);
    } catch {}
    setSaving(false);
  }

  return (
    <Link href={`/events/${event.id}`} className="card group block">
      <div className="relative aspect-[4/3] overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full group-hover:scale-105 transition-transform duration-500">
            <CategoryPlaceholder slug={event.category.slug} icon={event.category.icon} />
          </div>
        )}

        {/* Gradient overlay en bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Badge catégorie — haut gauche */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/10">
          {event.category.icon} {event.category.name}
        </span>

        {/* Bouton save — haut droite */}
        <button
          onClick={toggleSave}
          className="absolute top-3 right-3 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/50 hover:scale-110 transition-all border border-white/10"
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${saved ? "fill-red-400 text-red-400" : "text-white"}`} />
        </button>

        {/* Badge boost — si en vedette */}
        {isBoosted && (
          <span className="absolute top-3 right-12 inline-flex items-center gap-0.5 bg-yellow-400/90 backdrop-blur-sm text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
            <Zap className="w-3 h-3 fill-yellow-900" />
            Top
          </span>
        )}

        {/* Date — bas gauche */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          {countdown ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/40 animate-pulse">
              🔴 {countdown}
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
              isTonight
                ? "bg-primary-500 text-white shadow-lg shadow-primary-500/40"
                : "bg-white/90 backdrop-blur-sm text-gray-800"
            }`}>
              {relativeDate} · {formatTime(event.date)}
            </span>
          )}
        </div>

        {/* Prix — bas droite */}
        <span className={`absolute bottom-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${
          event.isFree
            ? "bg-accent-500 text-white shadow-lg shadow-accent-500/40"
            : "bg-white/90 backdrop-blur-sm text-gray-800"
        }`}>
          {formatPrice(event.price, event.isFree)}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-500 transition-colors line-clamp-1 text-[15px]">
          {event.title}
        </h3>

        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
          <span className="line-clamp-1">{event.location}</span>
        </div>

        {(event.rsvpCount > 0 || capacityText) && (
          <div className="mt-2 flex items-center gap-3">
            {event.rsvpCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-primary-600 font-medium">
                <Users className="w-3 h-3" />
                {event.rsvpCount} y {event.rsvpCount > 1 ? "vont" : "va"}
              </span>
            )}
            {capacityText && (
              <span className={`text-xs font-medium ${
                capacityText === "Complet" ? "text-red-500" : "text-orange-500"
              }`}>
                {capacityText}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
