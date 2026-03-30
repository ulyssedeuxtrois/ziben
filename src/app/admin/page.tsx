"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Check,
  X,
  Clock,
  Users,
  Calendar,
  Eye,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

interface AdminEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  status: string;
  createdAt: string;
  category: { name: string; icon: string };
  organizer: { name: string | null; email: string } | null;
  submitterName: string | null;
  submitterEmail: string | null;
  _count: { savedBy: number };
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  _count: { events: number; savedEvents: number };
}

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"events" | "users">("events");
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/login");
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;
    if (tab === "events") fetchEvents();
    if (tab === "users") fetchUsers();
  }, [tab, statusFilter, isAdmin]);

  const adminHeaders: Record<string, string> = user ? { "x-user-id": user.id } : {};

  async function fetchEvents() {
    setLoading(true);
    const params = statusFilter ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/admin/events${params}`, { headers: adminHeaders });
    const data = await res.json();
    setEvents(data.events || []);
    setCounts(data.counts || { total: 0, pending: 0, approved: 0, rejected: 0 });
    setLoading(false);
  }

  async function fetchUsers() {
    setLoading(true);
    const res = await fetch("/api/admin/users", { headers: adminHeaders });
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  async function updateEventStatus(eventId: string, status: string) {
    const event = events.find((e) => e.id === eventId);
    await fetch("/api/admin/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...adminHeaders },
      body: JSON.stringify({ eventId, status }),
    });
    if (status === "APPROVED" && event) {
      fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Nouvel event à Nice ! 🎉",
          body: event.title,
          url: `/events/${event.id}`,
        }),
      }).catch(() => {});
    }
    fetchEvents();
  }

  async function deleteEvent(eventId: string) {
    if (!window.confirm("Supprimer cet événement ?")) return;
    const res = await fetch("/api/admin/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...adminHeaders },
      body: JSON.stringify({ eventId }),
    });
    if (res.ok) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    }
  }

  async function updateUserRole(userId: string, role: string) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...adminHeaders },
      body: JSON.stringify({ userId, role }),
    });
    fetchUsers();
  }

  if (authLoading || !isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Administration</h1>
            <p className="text-sm text-gray-500">Modération et gestion</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/analytics" className="btn-secondary text-sm flex items-center gap-1.5">
            <Eye className="w-4 h-4" /> Analytics
          </Link>
          <Link href="/admin/leads" className="btn-secondary text-sm flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Leads
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{counts.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{counts.pending}</div>
          <div className="text-xs text-gray-500">En attente</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{counts.approved}</div>
          <div className="text-xs text-gray-500">Approuvés</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{counts.rejected}</div>
          <div className="text-xs text-gray-500">Rejetés</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setTab("events")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "events"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-1.5" />
          Événements
        </button>
        <button
          onClick={() => setTab("users")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "users"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users className="w-4 h-4 inline mr-1.5" />
          Utilisateurs
        </button>
      </div>

      {/* Events tab */}
      {tab === "events" && (
        <div>
          {/* Status filter */}
          <div className="flex gap-2 mb-4">
            {[
              { label: "Tous", value: "" },
              { label: "En attente", value: "PENDING" },
              { label: "Approuvés", value: "APPROVED" },
              { label: "Rejetés", value: "REJECTED" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-primary-100 text-primary-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Events list */}
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{event.category.icon}</span>
                      <h3 className="font-semibold text-gray-900 truncate">
                        {event.title}
                      </h3>
                      <StatusBadge status={event.status} />
                    </div>
                    <div className="text-sm text-gray-500 space-y-0.5">
                      <p>{formatDate(event.date)} · {formatTime(event.date)} · {event.location}</p>
                      <p>
                        Par : {event.organizer ? (event.organizer.name || event.organizer.email) : (event.submitterName || event.submitterEmail || "Anonyme")} ·{" "}
                        {event._count.savedBy} favoris
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {event.status !== "APPROVED" && (
                      <button
                        onClick={() => updateEventStatus(event.id, "APPROVED")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approuver
                      </button>
                    )}
                    {event.status !== "REJECTED" && (
                      <button
                        onClick={() => updateEventStatus(event.id, "REJECTED")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Rejeter
                      </button>
                    )}
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="flex items-center gap-1 px-2 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                Aucun événement trouvé
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users tab */}
      {tab === "users" && (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="card p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {u.name || "Sans nom"}
                    </h3>
                    <RoleBadge role={u.role} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {u.email} · {u._count.events} événements · {u._count.savedEvents} favoris
                  </p>
                </div>
                <select
                  value={u.role}
                  onChange={(e) => updateUserRole(u.id, e.target.value)}
                  className="input w-auto text-sm"
                >
                  <option value="USER">Utilisateur</option>
                  <option value="ORGANIZER">Organisateur</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
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
    APPROVED: "Approuvé",
    REJECTED: "Rejeté",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || ""}`}>
      {labels[status] || status}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    USER: "bg-gray-100 text-gray-600",
    ORGANIZER: "bg-blue-100 text-blue-700",
    ADMIN: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[role] || ""}`}>
      {role}
    </span>
  );
}
