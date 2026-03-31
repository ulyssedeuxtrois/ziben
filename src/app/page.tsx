import { Suspense } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/events/SearchBar";
import { CategoryFilter } from "@/components/events/CategoryFilter";
import { EventList } from "@/components/events/EventList";
import { TimeFilter } from "@/components/events/TimeFilter";
import { MapPin, ArrowRight, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";

const CAT_GRADIENTS: Record<string, string> = {
  "musique-soirees":        "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a855f7 100%)",
  "arts-spectacles":        "linear-gradient(135deg, #881337 0%, #e11d48 50%, #fb7185 100%)",
  "culture-expositions":    "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #60a5fa 100%)",
  "conferences-savoirs":    "linear-gradient(135deg, #134e4a 0%, #0d9488 50%, #2dd4bf 100%)",
  "vie-locale":             "linear-gradient(135deg, #92400e 0%, #d97706 50%, #fbbf24 100%)",
  "sport-bien-etre":        "linear-gradient(135deg, #14532d 0%, #16a34a 50%, #4ade80 100%)",
  "food-degustations":      "linear-gradient(135deg, #78350f 0%, #ea580c 50%, #fb923c 100%)",
  "famille-enfants":        "linear-gradient(135deg, #831843 0%, #ec4899 50%, #f9a8d4 100%)",
  "nature-decouvertes":     "linear-gradient(135deg, #1a2e05 0%, #4d7c0f 50%, #84cc16 100%)",
  "jeux-geek":              "linear-gradient(135deg, #312e81 0%, #4338ca 50%, #818cf8 100%)",
  "business-networking":    "linear-gradient(135deg, #1e293b 0%, #334155 50%, #64748b 100%)",
  "evenements-saisonniers": "linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #38bdf8 100%)",
};
const DEFAULT_GRADIENT = "linear-gradient(135deg, #374151 0%, #6b7280 50%, #9ca3af 100%)";

const CAT_PHOTOS: Record<string, string> = {
  "musique-soirees":        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop",
  "arts-spectacles":        "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&h=400&fit=crop",
  "culture-expositions":    "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=600&h=400&fit=crop",
  "conferences-savoirs":    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
  "vie-locale":             "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop",
  "sport-bien-etre":        "https://images.unsplash.com/photo-1461896836934-bd45ba10a444?w=600&h=400&fit=crop",
  "food-degustations":      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
  "famille-enfants":        "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600&h=400&fit=crop",
  "nature-decouvertes":     "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop",
  "jeux-geek":              "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop",
  "business-networking":    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop",
  "evenements-saisonniers": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop",
};

// Petites pills déco dans le hero — vibes locales
const HERO_PILLS = [
  { icon: "🎵", label: "Concert", top: "12%", left: "4%",  rotate: "-6deg",  delay: "0s" },
  { icon: "🍷", label: "Dégustation", top: "20%", right: "5%", rotate: "5deg", delay: "0.4s" },
  { icon: "⚽", label: "Sport", bottom: "28%", left: "2%", rotate: "-3deg", delay: "0.8s" },
  { icon: "🎭", label: "Spectacle", bottom: "20%", right: "3%", rotate: "7deg", delay: "0.2s" },
  { icon: "🌿", label: "Balade", top: "55%", left: "6%", rotate: "4deg", delay: "1s" },
  { icon: "🎮", label: "Jeux", top: "42%", right: "4%", rotate: "-5deg", delay: "0.6s" },
];

async function getTrendingEvents() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);

  const events = await prisma.event.findMany({
    where: {
      status: "APPROVED",
      date: { gte: cutoff },
    },
    include: {
      category: true,
      _count: { select: { savedBy: true } },
    },
  });

  return events
    .map((e) => ({
      ...e,
      score: e.viewCount * 1 + e.rsvpCount * 3 + e._count.savedBy * 2,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

export default async function HomePage() {
  const trendingEvents = await getTrendingEvents();

  return (
    <div>
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-400 to-accent-400 pt-14 pb-16 px-4 min-h-[480px] flex items-center">
        {/* Orbes de fond */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-accent-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary-300/15 rounded-full blur-2xl" />
        </div>

        {/* Pills décoratives — cachées sur petits écrans */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          {HERO_PILLS.map((p) => (
            <div
              key={p.label}
              className="absolute inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-3.5 py-1.5 rounded-full border border-white/20 animate-float"
              style={{
                top: p.top,
                left: (p as any).left,
                right: (p as any).right,
                bottom: (p as any).bottom,
                transform: `rotate(${p.rotate})`,
                animationDelay: p.delay,
              }}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </div>
          ))}
        </div>

        {/* Contenu central */}
        <div className="relative w-full max-w-2xl mx-auto text-center">
          {/* Badge ville */}
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white/90 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <MapPin className="w-3.5 h-3.5" />
            Côte d'Azur
          </div>

          {/* Titre principal — oversized, bold */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-[1.05] mb-4 tracking-tight">
            Ce soir,<br />
            <span className="relative inline-block">
              tu fais quoi&nbsp;?
              {/* Soulignage déco */}
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 10"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M4 7 C75 2, 225 2, 296 7"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-md mx-auto leading-relaxed">
            Concerts, marchés, apéros, ateliers, expos...
            <br className="hidden sm:block" />
            Tous les bons plans de la Côte d'Azur, au même endroit.
          </p>

          {/* SearchBar */}
          <Suspense>
            <SearchBar />
          </Suspense>

          {/* Time filters */}
          <div className="mt-5 overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex justify-center min-w-max mx-auto pr-4">
              <Suspense>
                <TimeFilter />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Wave separator */}
      <div className="relative -mt-8 z-10 pointer-events-none">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 0C360 60 1080 60 1440 0V60H0V0Z" fill="#FFF5F0" className="dark:fill-gray-950" />
        </svg>
      </div>

      {/* Stats strip — compact sur mobile */}
      <div className="bg-[#FFF5F0] dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-4 sm:pt-4 sm:pb-8">
        <div className="flex items-center justify-center gap-4 sm:gap-12">
          <div className="text-center">
            <div className="text-base sm:text-2xl font-extrabold text-gray-900 dark:text-white">Côte d'Azur</div>
            <div className="text-[10px] sm:text-xs text-gray-500 font-medium">Zone couverte</div>
          </div>
          <div className="h-6 sm:h-8 w-px bg-gray-200 dark:bg-gray-700" />
          <div className="text-center">
            <div className="text-base sm:text-2xl font-extrabold text-primary-500">Gratuit</div>
            <div className="text-[10px] sm:text-xs text-gray-500 font-medium">Pour tout le monde</div>
          </div>
          <div className="h-6 sm:h-8 w-px bg-gray-200 dark:bg-gray-700" />
          <div className="text-center">
            <div className="text-base sm:text-2xl font-extrabold text-gray-900 dark:text-white">24/7</div>
            <div className="text-[10px] sm:text-xs text-gray-500 font-medium">Mis à jour</div>
          </div>
        </div>
      </div>
      </div>

      {/* ─── TENDANCES ────────────────────────────────────────────────────── */}
      {trendingEvents.length > 0 && (
        <div className="section-coral py-10">
          <section className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-5">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                🔥 En ce moment
              </h2>
            </div>

            {/* Scroll horizontal sur mobile, grille 4 colonnes sur desktop */}
            <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible scrollbar-hide">
              {trendingEvents.map((event) => {
                const gradient = CAT_GRADIENTS[event.category.slug] ?? DEFAULT_GRADIENT;
                const photo = CAT_PHOTOS[event.category.slug];
                const dateObj = new Date(event.date);
                const dayLabel = dateObj.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });

                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="group relative flex-shrink-0 w-64 sm:w-auto rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    style={{ background: gradient }}
                  >
                    {/* Photo de fond */}
                    {photo && (
                      <img
                        src={photo}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
                        loading="lazy"
                      />
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    <div className="relative p-4 flex flex-col gap-3 h-full min-h-[140px]">
                      {/* Badge catégorie */}
                      <span className="inline-flex items-center gap-1 self-start bg-black/30 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/10">
                        <span>{event.category.icon}</span>
                        <span>{event.category.name}</span>
                      </span>

                      {/* Titre */}
                      <p className="text-white font-bold text-base leading-tight line-clamp-2 flex-1 group-hover:underline underline-offset-2 drop-shadow-md">
                        {event.title}
                      </p>

                      {/* Date + lieu */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-white/90 text-xs drop-shadow-sm">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span className="capitalize">{dayLabel}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/90 text-xs drop-shadow-sm">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* ─── EVENTS ───────────────────────────────────────────────────────── */}
      <div className="section-warm py-10">
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">À venir sur la Côte d'Azur</h2>
          <p className="text-sm text-gray-500 mt-0.5">Tous les events, filtrés et à jour</p>
        </div>

        {/* Filtre catégories */}
        <Suspense>
          <CategoryFilter />
        </Suspense>

        <div className="mt-8">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <EventList />
          </Suspense>
        </div>
      </section>
      </div>

      {/* ─── CTA ORGANISATEURS ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-12 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-warm-900 via-gray-900 to-gray-800 p-6 sm:p-12">
          {/* Déco */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📣</span>
                <span className="text-primary-400 font-bold text-sm uppercase tracking-widest">
                  Organisateurs & commerçants
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
                Tu organises un événement ?
              </h2>
              <p className="text-gray-400 max-w-md text-base">
                Karaoké, vide-grenier, concert, atelier...
                Publie ton event <strong className="text-white">gratuitement</strong> et touche les gens autour de toi.
              </p>
            </div>
            <Link
              href="/submit"
              className="btn-primary flex items-center gap-2 whitespace-nowrap text-base shrink-0"
            >
              Publier un event
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
