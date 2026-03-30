import Link from "next/link";
import {
  MapPin,
  Bell,
  BarChart3,
  UserPlus,
  FileText,
  CheckCircle,
  Rocket,
  ArrowRight,
  Zap,
  Star,
  TrendingUp,
} from "lucide-react";

export const metadata = {
  title: "Pour les pros — Ziben",
  description:
    "Publie tes événements sur Ziben et touche les Niçois. Gratuit, simple, efficace.",
};

const BENEFITS = [
  {
    icon: MapPin,
    title: "Visible sur la carte",
    description:
      "Ton event apparaît sur la carte interactive de Nice. Les gens autour de toi le voient en temps réel.",
  },
  {
    icon: Bell,
    title: "Notifications push",
    description:
      "Chaque publication déclenche une notification à tous nos abonnés. Pas d'algorithme, pas de filtre.",
  },
  {
    icon: BarChart3,
    title: "Stats & RSVP",
    description:
      "Tu sais combien de gens voient ton event, combien y vont, et combien l'ont sauvegardé.",
  },
];

const STEPS = [
  {
    icon: UserPlus,
    text: "Crée ton compte organisateur (30 secondes)",
  },
  {
    icon: FileText,
    text: "Publie ton event (titre, date, lieu, c'est tout)",
  },
  {
    icon: CheckCircle,
    text: "L'équipe Ziben valide en quelques heures",
  },
  {
    icon: Rocket,
    text: "Ton event est live, les notifications partent",
  },
];

export default function PourLesProPage() {
  return (
    <div>
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-400 to-accent-400 pt-20 pb-20 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-accent-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white/90 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <MapPin className="w-3.5 h-3.5" />
            Nice &amp; alentours
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.08] mb-5 tracking-tight">
            Fais découvrir tes events
            <br />
            <span className="relative inline-block">
              à tout Nice
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

          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-xl mx-auto leading-relaxed">
            Ziben pousse tes événements directement aux Niçois.
            <br className="hidden sm:block" />
            Gratuit, simple, efficace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/submit"
              className="btn-primary flex items-center gap-2 text-base px-8 py-3"
            >
              Publier un event
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="btn-secondary flex items-center gap-2 text-base px-8 py-3"
            >
              Créer un compte organisateur
            </Link>
          </div>
        </div>
      </section>

      {/* ─── BENEFITS ─────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12 tracking-tight">
          Pourquoi publier sur{" "}
          <span className="gradient-text">Ziben</span> ?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {BENEFITS.map((b) => (
            <div key={b.title} className="card p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-50 flex items-center justify-center">
                <b.icon className="w-7 h-7 text-primary-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">{b.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="bg-warm-100 py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12 tracking-tight">
            Comment ça marche ?
          </h2>

          <div className="space-y-6">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-lg">
                  {i + 1}
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  <s.icon className="w-5 h-5 text-accent-500 flex-shrink-0" />
                  <p className="font-medium text-gray-800">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12 tracking-tight">
          Tarifs <span className="gradient-text">transparents</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free tier */}
          <div className="card p-6 border-2 border-primary-200">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-primary-500" />
              <span className="font-bold text-primary-500 text-sm uppercase tracking-wider">
                Gratuit
              </span>
            </div>
            <p className="text-3xl font-extrabold mb-1">0 &euro;</p>
            <p className="text-gray-400 text-sm mb-5">pour toujours</p>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                Publication illimitée
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                Statistiques complètes
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                RSVP et sauvegardes
              </li>
            </ul>
          </div>

          {/* Boost */}
          <div className="card p-6 border-2 border-accent-200">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-accent-500" />
              <span className="font-bold text-accent-500 text-sm uppercase tracking-wider">
                Boost
              </span>
            </div>
            <p className="text-3xl font-extrabold mb-1">
              5 &euro;<span className="text-base font-medium text-gray-400">+</span>
            </p>
            <p className="text-gray-400 text-sm mb-5">par event boosté</p>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                En tête de liste
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                Badge &laquo;&nbsp;En vedette&nbsp;&raquo;
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                Visibilité maximale
              </li>
            </ul>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8 max-w-md mx-auto">
          Pas d&apos;abonnement caché. Pas de commission. Tu paies uniquement si
          tu veux booster.
        </p>
      </section>

      {/* ─── SOCIAL PROOF ─────────────────────────────────────────────────── */}
      <section className="bg-warm-100 py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-5xl sm:text-6xl font-extrabold gradient-text mb-4">
            50+
          </p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
            événements déjà publiés à Nice
          </p>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
            Bars, salles de concert, associations, artistes, commerçants
            &mdash;&nbsp;ils utilisent déjà Ziben.
          </p>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-warm-900 via-gray-900 to-gray-800 py-20 px-4">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 leading-tight">
            Prêt à toucher les Niçois ?
          </h2>

          <Link
            href="/submit"
            className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3"
          >
            Publier mon premier event
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-gray-400 text-sm mt-5">
            Gratuit, sans engagement, 2 minutes chrono
          </p>
        </div>
      </section>
    </div>
  );
}
