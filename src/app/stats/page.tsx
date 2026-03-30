import Link from "next/link";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://ziben.onrender.com";

interface StatItem {
  label: string;
  value: number;
  icon: string;
}

interface RecentEvent {
  id: string;
  title: string;
  date: string;
  category: { icon: string; name: string };
}

interface StatsData {
  eventCount: number;
  organizerCount: number;
  pushCount: number;
  rsvpTotal: number;
  viewTotal: number;
  recentEvents: RecentEvent[];
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toString();
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export default async function StatsPage() {
  const res = await fetch(`${BASE_URL}/api/stats`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Statistiques indisponibles</h1>
        <p className="text-gray-500">Réessaie dans quelques instants.</p>
      </div>
    );
  }

  const data: StatsData = await res.json();

  const stats: StatItem[] = [
    { label: "Événements publiés", value: data.eventCount, icon: "🎉" },
    { label: "Organisateurs", value: data.organizerCount, icon: "🎤" },
    { label: "Participations", value: data.rsvpTotal, icon: "🙋" },
    { label: "Vues totales", value: data.viewTotal, icon: "👀" },
    { label: "Abonnés push", value: data.pushCount, icon: "🔔" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
        Ziben en chiffres
      </h1>
      <p className="text-gray-500 mb-10">
        L&apos;activité de la communauté en un coup d&apos;œil.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
        {stats.map((s) => (
          <div
            key={s.label}
            className="card p-5 text-center flex flex-col items-center gap-2"
          >
            <span className="text-3xl">{s.icon}</span>
            <span className="text-3xl sm:text-4xl font-extrabold text-primary-600">
              {formatNumber(s.value)}
            </span>
            <span className="text-sm text-gray-500 leading-tight">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {data.recentEvents.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Derniers événements ajoutés
          </h2>
          <div className="space-y-3">
            {data.recentEvents.map((e) => (
              <Link
                key={e.id}
                href={`/events/${e.id}`}
                className="card px-5 py-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <span className="text-2xl flex-shrink-0">
                  {e.category.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate">
                    {e.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {e.category.name} · {formatDateShort(e.date)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
