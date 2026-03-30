"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  MapPin,
  Clock,
  Tag,
  Heart,
  Share2,
  ArrowLeft,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { formatDate, formatTime, formatPrice, generateSessionId } from "@/lib/utils";
import { EventMap } from "@/components/map/EventMap";
import { useAuth } from "@/lib/auth";
import type { EventWithCategory } from "@/lib/types";

interface SimilarEvent {
  id: string;
  title: string;
  date: string;
  imageUrl: string | null;
  category: { icon: string; name: string };
}

export default function EventPage() {
  const params = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventWithCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rsvped, setRsvped] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [similarEvents, setSimilarEvents] = useState<SimilarEvent[]>([]);

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setEvent(data);
          setRsvpCount(data.rsvpCount ?? 0);
          fetch(`/api/events/${params.id}/view`, { method: "POST" }).catch(() => {});
          // Fetch similar events by category
          if (data.categoryId) {
            fetch(`/api/events?category=${data.category?.slug}&limit=4`)
              .then((r) => r.json())
              .then((d) => {
                const others = (d.events || []).filter((e: SimilarEvent) => e.id !== data.id).slice(0, 3);
                setSimilarEvents(others);
              })
              .catch(() => {});
          }
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (!params.id) return;
    const sessionId = generateSessionId();
    fetch(`/api/events/${params.id}/rsvp?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.rsvped !== undefined) setRsvped(data.rsvped);
        if (data.rsvpCount !== undefined) setRsvpCount(data.rsvpCount);
      })
      .catch(() => {});
  }, [params.id]);

  useEffect(() => {
    if (!user || !event) return;
    fetch(`/api/events/saved?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        const isSaved = (data.events || []).some((e: { id: string }) => e.id === event.id);
        setSaved(isSaved);
      })
      .catch(() => {});
  }, [user, event]);

  useEffect(() => {
    if (event) {
      document.title = `${event.title} — Ziben`;
    }
  }, [event]);

  async function toggleRsvp() {
    const sessionId = generateSessionId();
    setRsvpLoading(true);
    try {
      const res = await fetch(`/api/events/${params.id}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.rsvped !== undefined) setRsvped(data.rsvped);
      if (data.rsvpCount !== undefined) setRsvpCount(data.rsvpCount);
    } catch {
      // ignore
    } finally {
      setRsvpLoading(false);
    }
  }

  async function toggleSave() {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    const res = await fetch("/api/events/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, eventId: event!.id }),
    });
    const data = await res.json();
    setSaved(data.saved);
  }

  async function share() {
    if (navigator.share) {
      await navigator.share({
        title: event!.title,
        text: `Découvre cet événement sur Ziben : ${event!.title}`,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6" />
        <div className="aspect-[16/9] bg-gray-200 rounded-2xl mb-6" />
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Événement non trouvé</h1>
        <p className="text-gray-500 mb-6">
          Cet événement n&apos;existe pas ou a été supprimé.
        </p>
        <Link href="/" className="btn-primary">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      <div className="relative aspect-[16/9] bg-gray-100 rounded-2xl overflow-hidden mb-6">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-primary-100 to-accent-100">
            {event.category.icon}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-sm font-medium px-3 py-1 rounded-full mb-3">
            {event.category.icon} {event.category.name}
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {event.title}
          </h1>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="w-5 h-5 text-primary-600" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Clock className="w-5 h-5 text-primary-600" />
              <span>
                {formatTime(event.date)}
                {event.endDate && ` — ${formatTime(event.endDate)}`}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="w-5 h-5 text-primary-600" />
              <span>
                {event.location} · {event.address}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Tag className="w-5 h-5 text-primary-600" />
              <span className="font-semibold">
                {formatPrice(event.price, event.isFree)}
              </span>
            </div>
          </div>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-lg font-semibold mb-2">À propos</h2>
            <p className="text-gray-600 whitespace-pre-line">
              {event.description}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Localisation</h2>
            <EventMap
              events={[event]}
              center={[event.lat, event.lng]}
              zoom={15}
              className="w-full h-[300px] rounded-2xl"
            />
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-24 space-y-4">

            <div className="card p-5">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatPrice(event.price, event.isFree)}
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {formatDate(event.date)} · {formatTime(event.date)}
              </p>

              <button
                onClick={toggleRsvp}
                disabled={rsvpLoading}
                className={`w-full flex items-center justify-center gap-1.5 text-sm py-2.5 rounded-xl font-medium transition-colors mb-3 ${
                  rsvped
                    ? "bg-primary-500 text-white"
                    : "btn-primary"
                }`}
              >
                <Users className="w-4 h-4" />
                {rsvpLoading ? "..." : rsvped ? `J'y vais ✓ (${rsvpCount})` : `J'y vais (${rsvpCount})`}
              </button>

              {event.capacity != null && (
                <div className="mt-3 mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{rsvpCount} participants</span>
                    <span>{event.capacity} places</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        rsvpCount >= event.capacity ? "bg-red-400" : "bg-primary-400"
                      }`}
                      style={{ width: `${Math.min(100, (rsvpCount / event.capacity) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={toggleSave}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-sm py-2.5 rounded-xl font-medium transition-colors ${
                    saved
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "btn-secondary"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${saved ? "fill-red-500" : ""}`}
                  />
                  {saved ? "Sauvegardé" : "Sauvegarder"}
                </button>
                <button
                  onClick={share}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-sm py-2.5 rounded-xl font-medium transition-colors ${copied ? "bg-accent-50 text-accent-600 border border-accent-200" : "btn-secondary"}`}
                >
                  <Share2 className="w-4 h-4" />
                  {copied ? "Lien copié !" : "Partager"}
                </button>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Organisateur
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <p className="font-medium text-gray-900">
                  {event.organizer?.name || event.submitterName || "Anonyme"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {similarEvents.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tu pourrais aussi aimer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {similarEvents.map((e) => (
              <Link
                key={e.id}
                href={`/events/${e.id}`}
                className="card overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[16/9] bg-gray-100 relative">
                  {e.imageUrl ? (
                    <img
                      src={e.imageUrl}
                      alt={e.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-primary-50 to-accent-50">
                      {e.category.icon}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{e.title}</p>
                  <p className="text-xs text-gray-500">{formatDate(e.date)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
