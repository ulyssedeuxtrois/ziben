# Ziben — Contexte projet pour Claude

## C'est quoi Ziben
Plateforme d'événements locaux à Nice. Les habitants trouvent les bons plans, les organisateurs publient leurs events. MVP live sur Render.

**URL prod** : https://ziben.onrender.com
**Repo** : https://github.com/ulyssedeuxtrois/ziben
**Owner** : Ulysse Sigalat (ulyssedeuxtrois)

---

## Règles de debug build

**Quand le build Render est cassé, TOUJOURS dans cet ordre :**

1. Lire les build logs Render (`mcp__render__list_logs`, level: `error`) — c'est la source de vérité
2. Ne JAMAIS se fier à la mémoire ou à un diagnostic d'une session précédente
3. Ne JAMAIS retenter `next build` en local — OneDrive bloque le filesystem, c'est inutile
4. Après un fix, scanner TOUTES les routes API pour le même pattern (`grep` sur `src/app/api/`)
5. Valider directement sur Render, pas en local

**Pattern récurrent** : les modules qui initialisent des clients (Stripe, web-push, etc.) au niveau module avec `process.env.X!` crashent au build car les env vars n'existent pas pendant `next build`. Fix : initialiser dans le handler + guard sur les env vars + `export const dynamic = 'force-dynamic'`.

---

## Stack

| Couche | Techno |
|--------|--------|
| Framework | Next.js 14 App Router |
| Langage | TypeScript |
| Style | Tailwind CSS |
| ORM | Prisma |
| DB | PostgreSQL — Neon (serverless) |
| Auth | Custom (SHA-256 + sel, cookie session) |
| Paiement | Stripe Checkout |
| Push notifs | Web Push / VAPID |
| PWA | manifest.json + service worker |
| Deploy | Render.com (free tier — cold starts 30-60s) |
| CI/CD | GitHub Actions |
| Scraper | Node.js ESM (GitHub Actions cron toutes 6h) |

---

## Arborescence importante

```
src/
  app/
    page.tsx              ← Homepage (liste events + filtres)
    admin/
      page.tsx            ← Panel admin (approve/reject events)
      leads/page.tsx      ← Pipeline organisateurs / CRM léger
    events/[id]/page.tsx  ← Détail event + boost UI
    organizer/
      page.tsx            ← Dashboard organisateur
      dashboard/page.tsx  ← Stats (vues, RSVPs, events)
    submit/page.tsx       ← Formulaire public soumission
    map/page.tsx          ← Carte interactive (Leaflet)
    saved/page.tsx        ← Favoris utilisateur
    cgu/page.tsx          ← CGU
    privacy/page.tsx      ← Politique de confidentialité
    legal/page.tsx        ← Mentions légales
    api/
      events/route.ts     ← GET (liste) / POST (création)
      events/[id]/        ← GET detail / RSVP / view
      events/import/      ← POST import scraper (secret header)
      events/saved/       ← GET/POST favoris
      admin/events/       ← GET pending events (admin)
      admin/leads/        ← GET pipeline organisateurs
      stripe/checkout/    ← POST créer session Stripe
      stripe/webhook/     ← POST webhook Stripe (boostedUntil)
      push/subscribe/     ← POST abonnement push
      push/send/          ← POST envoi push (admin)
      auth/login/         ← POST connexion
      auth/register/      ← POST inscription
  lib/
    auth.tsx              ← Context React + useAuth hook
    prisma.ts             ← Client Prisma singleton
    notify.ts             ← Discord webhook (best-effort)
    types.ts              ← EventWithCategory, SearchFilters
    utils.ts              ← formatDate, formatTime, formatPrice, generateSessionId
  components/
    events/               ← EventCard, EventList, Filters, CategoryFilter
    map/EventMap.tsx      ← Leaflet (dynamic import)
    layout/Header Footer  ← Nav + liens légaux
    pwa/                  ← PWAInstallPrompt, BottomNav
    PushPrompt.tsx        ← Demande consentement push

prisma/schema.prisma      ← Modèles : User, Event, Category, Rsvp, SavedEvent, PushSubscription
scripts/
  scraper.mjs             ← Scraper Eventbrite + OpenAgenda + Meetup
  seed-real.mjs           ← 28 events réels/réalistes pour Nice
docs/
  email-templates.md      ← 5 templates email prospection
  ARCHITECTURE.md         ← Architecture technique détaillée
  SECURITY.md             ← Audit sécurité
  LEGAL.md                ← Cadre juridique
  COMPTA.md               ← Modèle financier
.github/workflows/
  scraper.yml             ← Cron toutes 6h (0h/6h/12h/18h UTC)
```

---

## Modèle de données

```prisma
User      { id, email, name, password(hashed), role(USER|ORGANIZER), createdAt }
Event     { id, title, description, date, endDate, location, address, lat, lng,
            price, isFree, imageUrl, status(PENDING|APPROVED|REJECTED), city,
            capacity, rsvpCount, viewCount, clickCount,
            submitterName, submitterEmail,   ← soumissions publiques sans compte
            boosted, boostedUntil,           ← boost Stripe
            categoryId, organizerId }
Category  { id, name, slug, icon }
Rsvp      { eventId, sessionId }             ← session-based, pas de compte requis
SavedEvent{ userId, eventId }
PushSubscription { endpoint, p256dh, auth, userId? }
```

---

## Env vars requises (Render)

| Var | Usage |
|-----|-------|
| `DATABASE_URL` | Neon connection pooler URL |
| `DIRECT_URL` | Neon direct URL (migrations Prisma) |
| `NEXTAUTH_SECRET` | Sel pour hachage mots de passe |
| `SCRAPER_SECRET` | Auth header `/api/events/import` + `/api/admin/leads` |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_BASE_URL` | https://ziben.onrender.com (pour Stripe redirect) |
| `VAPID_PUBLIC_KEY` | Web Push clé publique |
| `VAPID_PRIVATE_KEY` | Web Push clé privée |
| `DISCORD_WEBHOOK_URL` | (optionnel) Alertes Discord sur inscriptions/events |

## GitHub Secrets requis (pour le scraper)

| Secret | Usage |
|--------|-------|
| `ZIBEN_BASE_URL` | URL de l'app (ex: https://ziben.onrender.com) |
| `ZIBEN_IMPORT_SECRET` | = `SCRAPER_SECRET` côté Render |

---

## Fonctionnalités en place

- [x] Homepage events avec filtres (catégorie, date, gratuit/payant, recherche)
- [x] Détail event (carte Leaflet, RSVP sans compte, save, share)
- [x] Carte interactive avec markers par catégorie
- [x] Soumission publique d'events (sans compte)
- [x] Espace organisateur (dashboard, créer/voir ses events)
- [x] Panel admin (approve/reject, stats, gestion users)
- [x] Push notifications Web (opt-in, envoi admin)
- [x] PWA installable (manifest + service worker)
- [x] Scraper autonome GitHub Actions (Eventbrite + OpenAgenda + Meetup)
- [x] Import sécurisé via API (`/api/events/import`)
- [x] Boost payant via Stripe Checkout (5€/9€/15€)
- [x] Badge "En vedette" + tri boostés en premier
- [x] Pages légales (CGU, Privacy, Mentions légales)
- [x] Notifications Discord sur inscriptions/events/boosts
- [x] Pipeline leads organisateurs (`/admin/leads`)

## Prochaines étapes possibles

- [ ] Ajouter `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` sur Render
- [ ] Ajouter GitHub secrets pour le scraper
- [ ] Acheter `ziben.fr` et connecter à Render
- [ ] Campagne email prospection organisateurs (templates dans docs/)
- [ ] Soumettre sitemap à Google Search Console
- [ ] Expiration automatique des boosts (cron qui set `boosted: false` si `boostedUntil < now`)
- [ ] Page `/events/[id]` — afficher sourceUrl pour les events scrapés
- [ ] App mobile TWA (dossier `projets/apps/ziben-twa/`)

---

## Notes importantes

- **Render free tier** : cold starts de 30-60s après inactivité. Les deploys prennent 5-15 min.
- **Prisma migrations** : utiliser Neon HTTP API pour les migrations (pas `prisma migrate dev` en prod)
  ```js
  // Pattern migration sans CLI :
  const sql = `ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS ...`;
  // Via @neondatabase/serverless ou node --input-type=module inline
  ```
- **Admin access** : `/admin` — pas de garde de route côté serveur (sécurité par obscurité + SCRAPER_SECRET pour l'API)
- **Sessions** : token stocké dans localStorage via useAuth context, pas de cookie httpOnly
- **Catégories** : cat1-cat10, seeded dans la DB. `guessCategory()` dans scraper.mjs fait le mapping par mots-clés.
