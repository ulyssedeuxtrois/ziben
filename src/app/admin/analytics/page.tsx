"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import {
  BarChart3,
  Eye,
  Users,
  Calendar,
  TrendingUp,
  Bell,
  MousePointer,
} from "lucide-react";

interface Analytics {
  totals: {
    events: number;
    users: number;
    organizers: number;
    push: number;
    views: number;
    rsvps: number;
    clicks: number;
  };
  eventsByDay: { date: string; total: number; approved: number }[];
  usersByDay: { date: string; count: number }[];
  topViewed: { id: string; title: string; viewCount: number; rsvpCount: number }[];
  topRsvp: { id: string; title: string; rsvpCount: number; viewCount: number }[];
}

function MiniBar({ value, max, color = "bg-primary-400" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div className="w-full h-6 bg-gray-100 rounded-md overflow-hidden">
      <div className={`h-full ${color} rounded-md transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function MiniChart({ data, color = "#ff5a36" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const h = 80;
  const w = data.length;
  const points = data.map((v, i) => `${(i / (w - 1)) * 100},${h - (v / max) * (h - 10)}`).join(" ");
  const fill = data.map((v, i) => `${(i / (w - 1)) * 100},${h - (v / max) * (h - 10)}`);
  fill.push(`100,${h}`);
  fill.unshift(`0,${h}`);

  return (
    <svg viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" className="w-full h-20">
      <polygon points={fill.join(" ")} fill={color} opacity="0.15" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AnalyticsPage() {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetch("/api/admin/analytics", { headers: { "x-user-id": user.id } })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, isAdmin]);

  if (!isAdmin) return null;
  if (loading) return <div className="p-8 text-gray-400">Chargement des analytics...</div>;
  if (!data) return <div className="p-8 text-red-500">Erreur de chargement</div>;

  const t = data.totals;
  const maxViews = Math.max(...data.topViewed.map((e) => e.viewCount), 1);
  const maxRsvp = Math.max(...data.topRsvp.map((e) => e.rsvpCount), 1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600">← Admin</Link>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {[
          { label: "Events", value: t.events, icon: Calendar, color: "text-primary-600" },
          { label: "Vues", value: t.views, icon: Eye, color: "text-blue-600" },
          { label: "RSVP", value: t.rsvps, icon: Users, color: "text-green-600" },
          { label: "Clics", value: t.clicks, icon: MousePointer, color: "text-purple-600" },
          { label: "Users", value: t.users, icon: Users, color: "text-gray-600" },
          { label: "Organisateurs", value: t.organizers, icon: TrendingUp, color: "text-amber-600" },
          { label: "Push subs", value: t.push, icon: Bell, color: "text-teal-600" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="card p-4 hover:shadow-none">
              <Icon className={`w-4 h-4 ${kpi.color} mb-1`} />
              <div className="text-2xl font-bold text-gray-900">{kpi.value.toLocaleString("fr-FR")}</div>
              <div className="text-xs text-gray-500">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* Graphes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Events créés (30 jours)</h3>
          <MiniChart data={data.eventsByDay.map((d) => d.total)} color="#ff5a36" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{data.eventsByDay[0]?.date.slice(5)}</span>
            <span>{data.eventsByDay[data.eventsByDay.length - 1]?.date.slice(5)}</span>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Inscriptions (30 jours)</h3>
          <MiniChart data={data.usersByDay.map((d) => d.count)} color="#10b981" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{data.usersByDay[0]?.date.slice(5)}</span>
            <span>{data.usersByDay[data.usersByDay.length - 1]?.date.slice(5)}</span>
          </div>
        </div>
      </div>

      {/* Top events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-blue-500" /> Top vues
          </h3>
          <div className="space-y-3">
            {data.topViewed.slice(0, 7).map((ev, i) => (
              <div key={ev.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <Link href={`/events/${ev.id}`} className="text-gray-700 hover:text-primary-600 truncate max-w-[200px] font-medium">
                    {i + 1}. {ev.title}
                  </Link>
                  <span className="text-gray-500 font-mono text-xs">{ev.viewCount} vues</span>
                </div>
                <MiniBar value={ev.viewCount} max={maxViews} color="bg-blue-400" />
              </div>
            ))}
            {data.topViewed.length === 0 && <p className="text-sm text-gray-400">Aucune donnée</p>}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-green-500" /> Top RSVP
          </h3>
          <div className="space-y-3">
            {data.topRsvp.slice(0, 7).map((ev, i) => (
              <div key={ev.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <Link href={`/events/${ev.id}`} className="text-gray-700 hover:text-primary-600 truncate max-w-[200px] font-medium">
                    {i + 1}. {ev.title}
                  </Link>
                  <span className="text-gray-500 font-mono text-xs">{ev.rsvpCount} RSVP</span>
                </div>
                <MiniBar value={ev.rsvpCount} max={maxRsvp} color="bg-green-400" />
              </div>
            ))}
            {data.topRsvp.length === 0 && <p className="text-sm text-gray-400">Aucune donnée</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
