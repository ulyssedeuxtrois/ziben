#!/usr/bin/env node

/**
 * Prospection script — génère une liste de contacts bars/salles/assos à Nice
 * Usage: node scripts/prospect.mjs
 * Env: GOOGLE_PLACES_KEY (optionnel, sinon fallback OSM Overpass)
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const OUTPUT_PATH = join(PROJECT_ROOT, 'docs', 'prospects-nice.csv');

const GOOGLE_KEY = process.env.GOOGLE_PLACES_KEY || '';
const NICE_LAT = 43.7102;
const NICE_LNG = 7.2620;
const RADIUS = 5000;

// Rate limiter — 1 req/sec
let lastRequest = 0;
async function rateLimit() {
  const now = Date.now();
  const diff = now - lastRequest;
  if (diff < 1000) {
    await new Promise(r => setTimeout(r, 1000 - diff));
  }
  lastRequest = Date.now();
}

// HTTP fetch helper (no external deps)
function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'ZibenProspect/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); }
          catch { reject(new Error(`JSON parse error: ${data.slice(0, 200)}`)); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ===== OVERPASS (OSM) =====

const OSM_CATEGORIES = [
  { query: 'amenity=bar', type: 'bar' },
  { query: 'amenity=nightclub', type: 'bar' },
  { query: 'amenity=pub', type: 'bar' },
  { query: 'amenity=restaurant', type: 'restaurant' },
  { query: 'amenity=cafe', type: 'bar' },
  { query: 'amenity=theatre', type: 'salle' },
  { query: 'amenity=arts_centre', type: 'salle' },
  { query: 'amenity=community_centre', type: 'asso' },
  { query: 'amenity=social_centre', type: 'asso' },
  { query: 'leisure=dance', type: 'salle' },
  { query: 'amenity=music_venue', type: 'salle' },
  { query: 'club=yes', type: 'asso' },
];

// Nice bounding box
const BBOX = '43.65,7.18,43.76,7.35';

async function fetchOSM() {
  const venues = [];

  // Build a single Overpass query for all categories
  const parts = OSM_CATEGORIES.map(c => {
    const [k, v] = c.query.split('=');
    return `node["${k}"="${v}"](${BBOX});way["${k}"="${v}"](${BBOX});`;
  }).join('');

  const query = `[out:json][timeout:60];(${parts});out body center;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  console.log('Requête Overpass API (OSM)...');
  await rateLimit();

  let data;
  try {
    data = await fetch(url);
  } catch (err) {
    console.error(`Erreur Overpass: ${err.message}`);
    return venues;
  }

  if (!data.elements) {
    console.error('Pas d\'éléments retournés par Overpass');
    return venues;
  }

  console.log(`${data.elements.length} éléments bruts reçus d'OSM`);

  for (const el of data.elements) {
    const tags = el.tags || {};
    if (!tags.name) continue; // skip unnamed

    const lat = el.lat || el.center?.lat || null;
    const lng = el.lon || el.center?.lon || null;

    // Determine type
    let type = 'bar';
    const amenity = tags.amenity || '';
    const leisure = tags.leisure || '';
    const club = tags.club || '';

    if (['theatre', 'arts_centre', 'music_venue'].includes(amenity) || leisure === 'dance') {
      type = 'salle';
    } else if (['community_centre', 'social_centre'].includes(amenity) || club === 'yes') {
      type = 'asso';
    } else if (amenity === 'restaurant') {
      type = 'restaurant';
    }

    // Build address from OSM tags
    const addrParts = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:postcode'],
      tags['addr:city'] || 'Nice',
    ].filter(Boolean);

    venues.push({
      nom: tags.name.trim(),
      type,
      adresse: addrParts.join(' ') || '',
      telephone: tags.phone || tags['contact:phone'] || '',
      site_web: tags.website || tags['contact:website'] || tags.url || '',
      lat: lat ? String(lat) : '',
      lng: lng ? String(lng) : '',
      email_contact: '',
      statut: '',
      notes: 'OSM',
    });
  }

  return venues;
}

// ===== GOOGLE PLACES =====

const GOOGLE_TYPES = [
  { type: 'bar', label: 'bar' },
  { type: 'night_club', label: 'bar' },
  { type: 'restaurant', label: 'restaurant' },
  { type: 'movie_theater', label: 'salle' },
];

const GOOGLE_KEYWORDS = [
  { keyword: 'salle concert', label: 'salle' },
  { keyword: 'centre culturel', label: 'salle' },
  { keyword: 'association culturelle', label: 'asso' },
  { keyword: 'club associatif', label: 'asso' },
];

async function fetchGooglePlaces() {
  const venues = [];

  // Type-based searches
  for (const { type, label } of GOOGLE_TYPES) {
    await rateLimit();
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${NICE_LAT},${NICE_LNG}&radius=${RADIUS}&type=${type}&key=${GOOGLE_KEY}`;
    try {
      console.log(`Google Places: type=${type}...`);
      const data = await fetch(url);
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error(`Google API error (${type}): ${data.status} — ${data.error_message || ''}`);
        continue;
      }
      for (const place of (data.results || [])) {
        venues.push(googlePlaceToVenue(place, label));
      }
      // Handle pagination
      let nextToken = data.next_page_token;
      while (nextToken) {
        // Google requires a short delay before using next_page_token
        await new Promise(r => setTimeout(r, 2000));
        const pageUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${nextToken}&key=${GOOGLE_KEY}`;
        const pageData = await fetch(pageUrl);
        for (const place of (pageData.results || [])) {
          venues.push(googlePlaceToVenue(place, label));
        }
        nextToken = pageData.next_page_token;
      }
    } catch (err) {
      console.error(`Erreur Google (${type}): ${err.message}`);
    }
  }

  // Keyword-based searches
  for (const { keyword, label } of GOOGLE_KEYWORDS) {
    await rateLimit();
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${NICE_LAT},${NICE_LNG}&radius=${RADIUS}&keyword=${encodeURIComponent(keyword)}&key=${GOOGLE_KEY}`;
    try {
      console.log(`Google Places: keyword="${keyword}"...`);
      const data = await fetch(url);
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error(`Google API error (${keyword}): ${data.status} — ${data.error_message || ''}`);
        continue;
      }
      for (const place of (data.results || [])) {
        venues.push(googlePlaceToVenue(place, label));
      }
    } catch (err) {
      console.error(`Erreur Google (${keyword}): ${err.message}`);
    }
  }

  return venues;
}

function googlePlaceToVenue(place, type) {
  const loc = place.geometry?.location || {};
  return {
    nom: (place.name || '').trim(),
    type,
    adresse: place.vicinity || place.formatted_address || '',
    telephone: '',
    site_web: '',
    lat: loc.lat ? String(loc.lat) : '',
    lng: loc.lng ? String(loc.lng) : '',
    email_contact: '',
    statut: '',
    notes: 'Google',
  };
}

// ===== DEDUP =====

function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function similarity(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;

  // Simple Jaccard on trigrams
  const triA = new Set();
  const triB = new Set();
  for (let i = 0; i <= na.length - 3; i++) triA.add(na.slice(i, i + 3));
  for (let i = 0; i <= nb.length - 3; i++) triB.add(nb.slice(i, i + 3));
  if (triA.size === 0 || triB.size === 0) return 0;
  let inter = 0;
  for (const t of triA) if (triB.has(t)) inter++;
  return inter / (triA.size + triB.size - inter);
}

function deduplicate(venues) {
  const kept = [];
  for (const v of venues) {
    const isDup = kept.some(existing =>
      similarity(existing.nom, v.nom) > 0.7 &&
      (existing.type === v.type || !v.type)
    );
    if (!isDup) {
      kept.push(v);
    } else {
      // Merge: fill missing fields from duplicate
      const match = kept.find(existing => similarity(existing.nom, v.nom) > 0.7);
      if (match) {
        if (!match.telephone && v.telephone) match.telephone = v.telephone;
        if (!match.site_web && v.site_web) match.site_web = v.site_web;
        if (!match.adresse && v.adresse) match.adresse = v.adresse;
        if (match.notes !== v.notes) match.notes = `${match.notes}+${v.notes}`;
      }
    }
  }
  return kept;
}

// ===== CSV =====

function escapeCSV(val) {
  const str = String(val || '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(venues) {
  const header = 'nom,type,adresse,telephone,site_web,lat,lng,email_contact,statut,notes';
  const rows = venues.map(v =>
    [v.nom, v.type, v.adresse, v.telephone, v.site_web, v.lat, v.lng, v.email_contact, v.statut, v.notes]
      .map(escapeCSV)
      .join(',')
  );
  return [header, ...rows].join('\n');
}

// ===== MAIN =====

async function main() {
  console.log('=== Ziben Prospection — Nice ===\n');

  let venues = [];

  if (GOOGLE_KEY) {
    console.log('Clé Google Places détectée, utilisation de Google + OSM\n');
    const [google, osm] = await Promise.all([
      fetchGooglePlaces(),
      fetchOSM(),
    ]);
    venues = [...google, ...osm];
  } else {
    console.log('Pas de GOOGLE_PLACES_KEY, utilisation d\'OpenStreetMap (Overpass API)\n');
    venues = await fetchOSM();
  }

  if (venues.length === 0) {
    console.log('\nAucun résultat trouvé. Vérifie ta connexion ou réessaie plus tard.');
    process.exit(1);
  }

  // Sort by name before dedup for consistency
  venues.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));

  const before = venues.length;
  venues = deduplicate(venues);
  console.log(`\nDédoublonnage: ${before} → ${venues.length} lieux uniques`);

  // Summary
  const counts = {};
  for (const v of venues) {
    counts[v.type] = (counts[v.type] || 0) + 1;
  }
  console.log('\n--- Résumé ---');
  for (const [type, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count}`);
  }
  console.log(`  TOTAL: ${venues.length}`);

  // Write CSV
  const docsDir = join(PROJECT_ROOT, 'docs');
  if (!existsSync(docsDir)) mkdirSync(docsDir, { recursive: true });

  const csv = toCSV(venues);
  writeFileSync(OUTPUT_PATH, csv, 'utf-8');
  console.log(`\nCSV écrit: ${OUTPUT_PATH}`);
  console.log(`${venues.length} lignes (hors header)`);
}

main().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
