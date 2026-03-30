import { Suspense } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/events/SearchBar";
import { CategoryFilter } from "@/components/events/CategoryFilter";
import { EventList } from "@/components/events/EventList";
import { TimeFilter } from "@/components/events/TimeFilter";
import { MapPin, ArrowRight } from "lucide-react";

// Petites pills déco dans le hero — vibes locales
const HERO_PILLS = [
  { icon: "🎵", label: "Concert", top: "12%", left: "4%",  rotate: "-6deg",  delay: "0s" },
  { icon: "🍷", label: "Dégustation", top: "20%", right: "5%", rotate: "5deg", delay: "0.4s" },
  { icon: "⚽", label: "Sport", bottom: "28%", left: "2%", rotate: "-3deg", delay: "0.8s" },
  { icon: "🎭", label: "Spectacle", bottom: "20%", right: "3%", rotate: "7deg", delay: "0.2s" },
  { icon: "🌿", label: "Balade", top: "55%", left: "6%", rotate: "4deg", delay: "1s" },
  { icon: "🎮", label: "Jeux", top: "42%", right: "4%", rotate: "-5deg", delay: "0.6s" },
];

export default function HomePage() {
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
            Nice
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
            Tous les bons plans de Nice, au même endroit.
          </p>

          {/* SearchBar */}
          <Suspense>
            <SearchBar />
          </Suspense>

          {/* Time filters */}
          <div className="mt-5 flex justify-center">
            <Suspense>
              <TimeFilter />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ─── EVENTS ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
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

      {/* ─── CTA ORGANISATEURS ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-warm-900 via-gray-900 to-gray-800 p-8 sm:p-12">
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
                Publie ton event <strong className="text-white">gratuitement</strong> et touche les Niçois autour de toi.
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
