"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Calendar,
  Eye,
  Clock,
  Check,
  X,
  Trash2,
  BarChart3,
  Users,
  Bookmark,
  Trophy,
} from "lucide-react";
import { formatDate, formatTime, formatPrice } from "@/lib/utils";

interface OrgEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  price: number;
  isFree: boolean;
  status: string;
  createdAt: string;
  category: { name: string; icon: string };
  _count: { savedBy: number };
}

interface OrgStats {
  totalViews: number;
  totalRsvps: number;
  totalSaves: number;
  upcomingCount: number;
  pastCount: number;
  bestEvent: { id: string; title: string; views: number } | null;
  viewsPerEvent: { id: string; title: string; views: number }[];
}

export default function OrganizerDashboard() {
  const { user, isOrganizer, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isOrganizer) {
      router.push("/");
    }
  }, [authLoading, isOrganizer, router]);

  useEffect(() => {
    if (!user) return;
    fetchEvents();
    fetchStats();
  }, [user]);

  async function fetchEvents() {
    setLoading(true);
    const res = await fetch(`/api/organizer/events?userId=${user!.id}`);
    const data = await res.json();
    setEvents(data.events || []);
    setCounts(data.counts || { total: 0, pending: 0, approved: 0, rejected: 0 });
    setLoading(false);
  }

  async function fetchStats() {
    const res = await fetch(`/api/organizer/stats?userId=${user!.id}`);
    if (res.ok) {
      const data = await res.json();
      setStats(data);
    }
  }

  async function deleteEvent(eventId: string) {
    if (!confirm("Supprimer cet événement ?")) return;
    await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    fetchEvents();
    fetchStats();
  }

  if (authLoading || !isOrganizer) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Mes événements</h1>
          <p className="text-sm text-gray-500">Gère tes publications</p>
        </div>
        <Link href="/organizer" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Nouveau
        </Link>
      </div>

      {/* Status counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 text-center">
          <BarChart3 className="w-5 h-5 text-gray-400 mx-auto mb-1" />
          <div className="text-2xl font-bold">{counts.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="card p-4 text-center">
          <Clock className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-yellow-600">{counts.pending}</div>
          <div className="text-xs text-gray-500">En attente</div>
        </div>
        <div className="card p-4 text-center">
          <Check className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-green-600">{counts.approved}</div>
          <div className="text-xs text-gray-500">En ligne</div>
        </div>
        <div className="card p-4 text-center">
          <X className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-red-600">{counts.rejected}</div>
          <div className="text-xs text-gray-500">Rejetés</div>
        </div>
      </div>

      {/* Engagement stats */}
      {stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="card p-4 text-center">
              <Eye className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-blue-600">{stats.totalViews}</div>
              <div className="text-xs text-gray-500">Vues totales</div>
            </div>
            <div className="card p-4 text-center">
              <Users className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-purple-600">{stats.totalRsvps}</div>
              <div className="text-xs text-gray-500">RSVPs totaux</div>
            </div>
            <div className="card p-4 text-center">
              <Bookmark className="w-5 h-5 text-pink-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-pink-600">{stats.totalSaves}</div>
              <div className="text-xs text-gray-500">Favoris totaux</div>
            </div>
            <div className="card p-4 text-center">
              <Calendar className="w-5 h-5 text-teal-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-teal-600">{stats.upcomingCount}</div>
              <div className="text-xs text-gray-500">
                À venir · {stats.pastCount} passés
              </div>
            </div>
          </div>

          {/* Best performer */}
          {stats.bestEvent && stats.bestEvent.views > 0 && (
            <div className="card p-4 mb-6 flex items-center gap-3">
              <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-0.5">Meilleure performance</div>
                <Link
                  href={`/events/${stats.bestEvent.id}`}
                  className="font-semibold text-gray-900 hover:text-primary-600 truncate block"
                >
                  {stats.bestEvent.title}
                </Link>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-blue-600">{stats.bestEvent.views}</div>
                <div className="text-xs text-gray-500">vues</div>
              </div>
            </div>
          )}

          {/* Views bar chart */}
          {stats.viewsPerEvent.length > 0 && (
            <div className="card p-4 mb-8">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Vues par événement</h2>
              <ViewsBarChart events={stats.viewsPerEvent} />
            </div>
          )}
        </>
      )}

      {/* Events list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{event.category.icon}</span>
                    <Link
                      href={`/events/${event.id}`}
                      className="font-semibold text-gray-900 hover:text-primary-600 truncate"
                    >
                      {event.title}
                    </Link>
                    <StatusBadge status={event.status} />
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(event.date)} · {formatTime(event.date)} ·{" "}
                    {event.location} · {formatPrice(event.price, event.isFree)} ·{" "}
                    {event._count.savedBy} favoris
                  </div>
                </div>
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Aucun événement
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Publie ton premier événement !
          </p>
          <Link href="/organizer" className="btn-primary text-sm">
            Créer un événement
          </Link>
        </div>
      )}
    </div>
  );
}

function ViewsBarChart({ events }: { events: { id: string; title: string; views: number }[] }) {
  const maxViews = Math.max(...events.map((e) => e.views), 1);
  const barH = 120;
  const barW = 32;
  const gap = 12;
  const labelH = 48;
  const svgW = events.length * (barW + gap) - gap;
  const svgH = barH + labelH;

  return (
    <div className="overflow-x-auto">
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="min-w-full"
        style={{ minWidth: svgW }}
      >
        {events.map((e, i) => {
          const x = i * (barW + gap);
          const fillH = Math.max(4, Math.round((e.views / maxViews) * barH));
          const y = barH - fillH;
          return (
            <g key={e.id}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={fillH}
                rx={4}
                className="fill-blue-500 opacity-80"
              />
              {/* views label above bar */}
              {e.views > 0 && (
                <text
                  x={x + barW / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize={10}
                  className="fill-gray-500"
                >
                  {e.views}
                </text>
              )}
              {/* event title below */}
              <foreignObject x={x - 2} y={barH + 4} width={barW + 4} height={labelH - 4}>
                <div
                  style={{
                    fontSize: 9,
                    lineHeight: "1.2",
                    color: "#6b7280",
                    wordBreak: "break-word",
                    textAlign: "center",
                    overflow: "hidden",
                    maxHeight: labelH - 4,
                  }}
                >
                  {e.title}
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    PENDING: "En attente",
    APPROVED: "Publié",
    REJECTED: "Rejeté",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || ""}`}>
      {labels[status] || status}
    </span>
  );
}
