/**
 * scraper.mjs — Ziben autonomous event scraper
 *
 * Sources :
 *   1. Eventbrite Nice  (JSON-LD dans les pages publiques)
 *   2. nice.fr/agenda   (JSON API publique de la ville)
 *   3. Meetup Nice      (API publique GraphQL)
 *
 * Usage :
 *   node scripts/scraper.mjs
 *   ZIBEN_IMPORT_SECRET=xxx ZIBEN_BASE_URL=https://ziben.onrender.com node scripts/scraper.mjs
 *
 * En GitHub Actions : les secrets sont injectés automatiquement.
 */

const BASE_URL = process.env.ZIBEN_BASE_URL || "https://ziben.onrender.com";
const SECRET   = process.env.ZIBEN_IMPORT_SECRET || "";
const DRY_RUN  = process.env.DRY_RUN === "1";

const NICE_LAT  = 43.7102;
const NICE_LNG  = 7.2620;
// ~30km radius around Nice: covers Antibes, Cannes, Menton, Monaco, Vence, Cagnes-sur-Mer
const NICE_BBOX = { minLat: 43.44, maxLat: 43.90, minLng: 6.90, maxLng: 7.60 };

// ─── Category mapping ──────────────────────────────────────────────────────
const CAT_MAP = {
  "music":          "cat1",
  "musique":        "cat1",
  "concert":        "cat1",
  "soiree":         "cat1",
  "soirée":         "cat1",
  "party":          "cat1",
  "arts":           "cat2",
  "spectacle":      "cat2",
  "theatre":        "cat2",
  "théâtre":        "cat2",
  "humour":         "cat2",
  "comedy":         "cat2",
  "danse":          "cat2",
  "culture":        "cat3",
  "exposition":     "cat3",
  "expo":           "cat3",
  "film":           "cat3",
  "cinema":         "cat3",
  "conference":     "cat4",
  "conférence":     "cat4",
  "formation":      "cat4",
  "atelier":        "cat4",
  "workshop":       "cat4",
  "networking":     "cat4",
  "marche":         "cat5",
  "marché":         "cat5",
  "brocante":       "cat5",
  "vide-grenier":   "cat5",
  "fete":           "cat5",
  "fête":           "cat5",
  "sport":          "cat6",
  "running":        "cat6",
  "yoga":           "cat6",
  "fitness":        "cat6",
  "randonnee":      "cat6",
  "randonnée":      "cat6",
  "food":           "cat7",
  "gastronomie":    "cat7",
  "degustation":    "cat7",
  "dégustation":    "cat7",
  "brunch":         "cat7",
  "enfant":         "cat8",
  "famille":        "cat8",
  "kids":           "cat8",
  "nature":         "cat9",
  "balade":         "cat9",
  "jeu":            "cat10",
  "jeux":           "cat10",
  "gaming":         "cat10",
  "geek":           "cat10",
};

function guessCategory(title = "", desc = "", tags = []) {
  const text = [title, desc, ...tags].join(" ").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [kw, cat] of Object.entries(CAT_MAP)) {
    if (text.includes(kw)) return cat;
  }
  return "cat5"; // fallback : Vie locale
}

function isInNice(lat, lng) {
  if (!lat || !lng) return true; // on laisse passer si pas de coords
  return lat >= NICE_BBOX.minLat && lat <= NICE_BBOX.maxLat
      && lng >= NICE_BBOX.minLng && lng <= NICE_BBOX.maxLng;
}

function cleanText(s = "") {
  return s.replace(/\s+/g, " ").replace(/'/g, "'").trim().slice(0, 500);
}

function slugId(source, id) {
  return `scraped-${source}-${String(id).replace(/[^a-z0-9]/gi, "-").slice(0, 40)}`;
}

// ─── Source 1 : Eventbrite ─────────────────────────────────────────────────

async function scrapeEventbrite() {
  console.log("  📡 Eventbrite...");
  const results = [];

  // Eventbrite exposes a public destination API used by their own frontend
  // place_id = Google Places ID for Nice, France
  const url = "https://www.eventbrite.fr/api/v3/destination/events/"
    + "?place_id=ChIJq-J5RlPjzRIR0tUJFAp5kOo"
    + "&include_adult=1&is_online=0&page_size=50&expand=venue,category";

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ZibenBot/1.0)",
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      console.log(`    ⚠️  Eventbrite HTTP ${res.status}`);
      return results;
    }

    const data = await res.json();
    const events = data.events?.results || [];

    for (const ev of events) {
      try {
        const startDate = new Date(ev.start?.utc || ev.start?.local);
        if (isNaN(startDate)) continue;
        if (startDate < new Date()) continue; // passé

        const lat  = parseFloat(ev.venue?.latitude)  || NICE_LAT;
        const lng  = parseFloat(ev.venue?.longitude) || NICE_LNG;
        if (!isInNice(lat, lng)) continue;

        const price  = parseFloat(ev.ticket_availability?.minimum_ticket_price?.major_value) || 0;
        const isFree = price === 0 || !!ev.is_free;

        results.push({
          id:       slugId("eb", ev.id),
          title:    cleanText(ev.name?.text || ev.name),
          desc:     cleanText(ev.summary || ev.description?.text || ""),
          date:     startDate.toISOString(),
          end:      ev.end?.utc ? new Date(ev.end.utc).toISOString() : null,
          location: cleanText(ev.venue?.name || "Nice"),
          address:  cleanText(ev.venue?.address?.localized_address_display || "Nice, France"),
          lat, lng,
          price,
          isFree,
          cat:      guessCategory(ev.name?.text, ev.summary, [ev.category?.name]),
          source:   "eventbrite",
          sourceUrl: ev.url,
        });
      } catch {}
    }

    console.log(`    ✓ ${results.length} events Eventbrite`);
  } catch (err) {
    console.log(`    ✗ Eventbrite: ${err.message}`);
  }

  return results;
}

// ─── Source 2 : nice.fr/agenda (API officielle ville de Nice) ──────────────

async function scrapeNiceFr() {
  console.log("  📡 nice.fr/agenda...");
  const results = [];

  try {
    // La ville de Nice expose ses events via OpenAgenda
    // https://openagenda.com/agendas/92168406/events.json
    const today = new Date().toISOString().split("T")[0];
    const future = new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split("T")[0];

    const url = `https://openagenda.com/agendas/92168406/events.json`
      + `?lang=fr&size=50&offset=0`
      + `&timings[gte]=${today}&timings[lte]=${future}`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ZibenBot/1.0)" },
    });

    if (!res.ok) {
      console.log(`    ⚠️  nice.fr HTTP ${res.status}`);
      return results;
    }

    const data = await res.json();
    const events = data.events || [];

    for (const ev of events) {
      try {
        const timing = ev.timings?.[0];
        if (!timing) continue;
        const startDate = new Date(timing.begin);
        if (isNaN(startDate) || startDate < new Date()) continue;

        const lat = ev.location?.latitude  || NICE_LAT;
        const lng = ev.location?.longitude || NICE_LNG;

        results.push({
          id:       slugId("nice", ev.uid),
          title:    cleanText(ev.title?.fr || ev.title?.en || "Événement Nice"),
          desc:     cleanText(ev.description?.fr || ev.longDescription?.fr || ""),
          date:     startDate.toISOString(),
          end:      timing.end ? new Date(timing.end).toISOString() : null,
          location: cleanText(ev.location?.name || "Nice"),
          address:  cleanText(ev.location?.address || "Nice, France"),
          lat, lng,
          price:    0,
          isFree:   true,
          cat:      guessCategory(ev.title?.fr, ev.description?.fr, ev.keywords?.fr || []),
          source:   "nice.fr",
          sourceUrl: ev.canonicalUrl || `https://openagenda.com/agendas/92168406/events/${ev.slug}`,
        });
      } catch {}
    }

    console.log(`    ✓ ${results.length} events nice.fr`);
  } catch (err) {
    console.log(`    ✗ nice.fr: ${err.message}`);
  }

  return results;
}

// ─── Source 3 : Meetup Nice ───────────────────────────────────────────────

async function scrapeMeetup() {
  console.log("  📡 Meetup...");
  const results = [];

  try {
    // Meetup GraphQL endpoint (public, no auth for basic search)
    const query = `{
      rankedEvents(filter: {
        query: "nice france",
        lat: ${NICE_LAT},
        lon: ${NICE_LNG},
        radius: 30,
        startDateRange: "${new Date().toISOString()}",
        numberOfEventsRequested: 30
      }) {
        edges {
          node {
            id title dateTime endTime
            venue { name address lat lng city }
            group { name }
            eventUrl isFeatured
            feeSettings { amount }
          }
        }
      }
    }`;

    const res = await fetch("https://api.meetup.com/gql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; ZibenBot/1.0)",
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      console.log(`    ⚠️  Meetup HTTP ${res.status}`);
      return results;
    }

    const data = await res.json();
    const edges = data.data?.rankedEvents?.edges || [];

    for (const { node: ev } of edges) {
      try {
        const startDate = new Date(ev.dateTime);
        if (isNaN(startDate) || startDate < new Date()) continue;

        const lat = parseFloat(ev.venue?.lat) || NICE_LAT;
        const lng = parseFloat(ev.venue?.lon || ev.venue?.lng) || NICE_LNG;
        if (!isInNice(lat, lng)) continue;

        const price  = parseFloat(ev.feeSettings?.amount) || 0;

        results.push({
          id:       slugId("mu", ev.id),
          title:    cleanText(ev.title),
          desc:     cleanText(`Organisé par ${ev.group?.name || "la communauté"}. Voir les détails sur Meetup.`),
          date:     startDate.toISOString(),
          end:      ev.endTime ? new Date(ev.endTime).toISOString() : null,
          location: cleanText(ev.venue?.name || ev.venue?.city || "Nice"),
          address:  cleanText(ev.venue?.address ? `${ev.venue.address}, Nice` : "Nice, France"),
          lat, lng,
          price,
          isFree:   price === 0,
          cat:      guessCategory(ev.title, "", []),
          source:   "meetup",
          sourceUrl: ev.eventUrl,
        });
      } catch {}
    }

    console.log(`    ✓ ${results.length} events Meetup`);
  } catch (err) {
    console.log(`    ✗ Meetup: ${err.message}`);
  }

  return results;
}

// ─── Déduplication ────────────────────────────────────────────────────────

function dedupe(events) {
  const seen = new Set();
  return events.filter((e) => {
    // Déduplication par titre normalisé + date jour
    const key = e.title.toLowerCase().slice(0, 30) + e.date.slice(0, 10);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Import vers Ziben ────────────────────────────────────────────────────

async function importEvents(events) {
  if (DRY_RUN) {
    console.log(`\n🔍 DRY RUN — ${events.length} events prêts à importer :`);
    events.forEach((e) => console.log(`   · [${e.source}] ${e.date.slice(0, 10)} — ${e.title}`));
    return;
  }

  if (!SECRET) {
    console.log("⚠️  ZIBEN_IMPORT_SECRET manquant — import annulé");
    return;
  }

  console.log(`\n📤 Import de ${events.length} events vers ${BASE_URL}...`);

  const res = await fetch(`${BASE_URL}/api/events/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-import-secret": SECRET,
    },
    body: JSON.stringify({ events }),
  });

  const result = await res.json();
  if (!res.ok) {
    console.log(`  ✗ Import failed: ${JSON.stringify(result)}`);
  } else {
    console.log(`  ✅ ${result.inserted} insérés · ${result.skipped} déjà présents · ${result.errors} erreurs`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🕷️  Ziben Scraper — ${new Date().toLocaleString("fr-FR")}`);
  console.log(`   Target: ${BASE_URL}\n`);

  const raw = await Promise.all([
    scrapeEventbrite(),
    scrapeNiceFr(),
    scrapeMeetup(),
  ]);

  const all    = raw.flat();
  const unique = dedupe(all);

  console.log(`\n📊 Total : ${all.length} events scrapés → ${unique.length} après dédup`);

  await importEvents(unique);

  console.log("\n✅ Scraper terminé.");
}

main().catch((err) => {
  console.error("💥 Erreur fatale:", err);
  process.exit(1);
});
