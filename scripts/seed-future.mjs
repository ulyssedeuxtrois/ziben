// Seed future events for Nice via Neon HTTP SQL API
const NEON_URL = "https://ep-divine-violet-agjael6h-pooler.c-2.eu-central-1.aws.neon.tech/sql";
const CONN_STRING = "postgresql://neondb_owner:npg_TLVHWEwn1N0K@ep-divine-violet-agjael6h-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require";

async function runSQL(query) {
  const res = await fetch(NEON_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Neon-Connection-String": CONN_STRING,
    },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  if (data.message) throw new Error(data.message);
  return data;
}

// Generate dates relative to today
function futureDate(daysFromNow, hour, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

async function main() {
  console.log("Deleting old events...");
  await runSQL(`DELETE FROM "SavedEvent"`);
  await runSQL(`DELETE FROM "Rsvp"`);
  await runSQL(`DELETE FROM "Event"`);
  console.log("  ✓ Old events deleted");

  console.log("\nSeeding future events for Nice...");

  const events = [
    // CE SOIR
    {
      id: "evt-tonight-1",
      title: "Karaoké Night au Shapko",
      desc: "Soirée karaoké ouverte à tous ! Ambiance garantie, micro ouvert dès 21h. Boissons et tapas sur place.",
      date: futureDate(0, 21, 0),
      endDate: futureDate(0, 23, 59),
      location: "Le Shapko",
      address: "5 Rue de la Barillerie, 06300 Nice",
      lat: 43.6975, lng: 7.2783,
      price: 0, isFree: true,
      catId: "cat1", // Musique & soirées
      city: "nice",
    },
    {
      id: "evt-tonight-2",
      title: "Open Mic Stand-Up",
      desc: "Scène ouverte humour. 5 minutes par personne, inscriptions sur place. Viens tester tes vannes ou juste rigoler.",
      date: futureDate(0, 20, 30),
      endDate: futureDate(0, 23, 0),
      location: "Le Comedia",
      address: "2 Rue Smolett, 06300 Nice",
      lat: 43.6961, lng: 7.2693,
      price: 5, isFree: false,
      catId: "cat2", // Arts & spectacles
      city: "nice",
    },
    // DEMAIN
    {
      id: "evt-tomorrow-1",
      title: "Marché aux fleurs du Cours Saleya",
      desc: "Le mythique marché aux fleurs de Nice. Fleurs fraîches, producteurs locaux, artisanat. Tous les matins sauf lundi.",
      date: futureDate(1, 6, 0),
      endDate: futureDate(1, 13, 30),
      location: "Cours Saleya",
      address: "Cours Saleya, 06300 Nice",
      lat: 43.6953, lng: 7.2753,
      price: 0, isFree: true,
      catId: "cat5", // Vie locale
      city: "nice",
    },
    {
      id: "evt-tomorrow-2",
      title: "Yoga Sunset sur la Promenade",
      desc: "Session yoga face à la mer au coucher du soleil. Apportez votre tapis. Tous niveaux bienvenus.",
      date: futureDate(1, 18, 30),
      endDate: futureDate(1, 19, 30),
      location: "Promenade des Anglais",
      address: "Promenade des Anglais, 06000 Nice",
      lat: 43.6942, lng: 7.2566,
      price: 8, isFree: false,
      catId: "cat6", // Sport & bien-être
      city: "nice",
      capacity: 25,
    },
    {
      id: "evt-tomorrow-3",
      title: "Afterwork Rooftop DJ Set",
      desc: "DJ set house/disco sur le rooftop du Hyatt. Vue panoramique, cocktails, dress code smart casual.",
      date: futureDate(1, 19, 0),
      endDate: futureDate(1, 23, 0),
      location: "Hyatt Regency Nice",
      address: "13 Promenade des Anglais, 06000 Nice",
      lat: 43.6946, lng: 7.2604,
      price: 15, isFree: false,
      catId: "cat1", // Musique & soirées
      city: "nice",
      capacity: 120,
    },
    // CE WEEK-END
    {
      id: "evt-weekend-1",
      title: "Vide-grenier du Port",
      desc: "Grand vide-grenier au Port de Nice. Plus de 100 exposants. Vêtements, vinyles, déco, jouets, bijoux.",
      date: futureDate(getNextSaturday(), 8, 0),
      endDate: futureDate(getNextSaturday(), 17, 0),
      location: "Port de Nice",
      address: "Quai Lunel, 06300 Nice",
      lat: 43.6945, lng: 7.2840,
      price: 0, isFree: true,
      catId: "cat5", // Vie locale
      city: "nice",
    },
    {
      id: "evt-weekend-2",
      title: "Atelier Poterie pour débutants",
      desc: "Initiation au tournage. Repartez avec votre création ! Matériel fourni, tablier prêté.",
      date: futureDate(getNextSaturday(), 14, 0),
      endDate: futureDate(getNextSaturday(), 16, 30),
      location: "L'Atelier Terre",
      address: "15 Rue Gioffredo, 06000 Nice",
      lat: 43.6990, lng: 7.2700,
      price: 35, isFree: false,
      catId: "cat3", // Culture & expositions
      city: "nice",
      capacity: 8,
    },
    {
      id: "evt-weekend-3",
      title: "Concert Jazz Manouche",
      desc: "Trio jazz manouche en live. Ambiance Django Reinhardt, bougies et bon vin. Réservation conseillée.",
      date: futureDate(getNextSaturday(), 20, 30),
      endDate: futureDate(getNextSaturday(), 23, 0),
      location: "Le Jam",
      address: "18 Rue de la Buffa, 06000 Nice",
      lat: 43.6936, lng: 7.2540,
      price: 12, isFree: false,
      catId: "cat1", // Musique & soirées
      city: "nice",
      capacity: 60,
    },
    {
      id: "evt-weekend-4",
      title: "Brunch Marché de la Libération",
      desc: "Dégustation de produits locaux : socca, pissaladière, farcis niçois, fromages, huile d'olive. Visite guidée du marché incluse.",
      date: futureDate(getNextSunday(), 10, 0),
      endDate: futureDate(getNextSunday(), 12, 30),
      location: "Marché de la Libération",
      address: "Place du Général de Gaulle, 06300 Nice",
      lat: 43.7065, lng: 7.2680,
      price: 22, isFree: false,
      catId: "cat7", // Food & dégustations
      city: "nice",
      capacity: 15,
    },
    // CETTE SEMAINE
    {
      id: "evt-week-1",
      title: "Expo Photo : Nice la Nuit",
      desc: "Exposition photos de Nice by night. 30 photographes locaux, entrée libre. Vernissage le premier soir.",
      date: futureDate(2, 10, 0),
      endDate: futureDate(8, 19, 0),
      location: "Galerie de la Marine",
      address: "59 Quai des États-Unis, 06300 Nice",
      lat: 43.6950, lng: 7.2775,
      price: 0, isFree: true,
      catId: "cat3", // Culture & expositions
      city: "nice",
    },
    {
      id: "evt-week-2",
      title: "Tournoi de Pétanque",
      desc: "Tournoi doublette ouvert à tous. Inscriptions sur place dès 13h30. Lots à gagner. Buvette et grillades.",
      date: futureDate(3, 14, 0),
      endDate: futureDate(3, 19, 0),
      location: "Place Arson",
      address: "Place Arson, 06300 Nice",
      lat: 43.7020, lng: 7.2725,
      price: 3, isFree: false,
      catId: "cat6", // Sport & bien-être
      city: "nice",
      capacity: 32,
    },
    {
      id: "evt-week-3",
      title: "Soirée Jeux de Société",
      desc: "Soirée jeux de société : Catan, Dixit, Azul, 7 Wonders... Débutants bienvenus, on explique les règles. Boissons offertes.",
      date: futureDate(3, 19, 0),
      endDate: futureDate(3, 23, 0),
      location: "Le Spot",
      address: "7 Rue Bonaparte, 06300 Nice",
      lat: 43.6985, lng: 7.2710,
      price: 0, isFree: true,
      catId: "cat10", // Jeux & geek
      city: "nice",
    },
    {
      id: "evt-week-4",
      title: "Conférence : L'IA au quotidien",
      desc: "Comment l'IA change notre vie de tous les jours. Intervenants tech locaux, démos live, questions-réponses.",
      date: futureDate(4, 18, 30),
      endDate: futureDate(4, 20, 30),
      location: "Bibliothèque Louis Nucéra",
      address: "2 Place Yves Klein, 06000 Nice",
      lat: 43.7010, lng: 7.2624,
      price: 0, isFree: true,
      catId: "cat4", // Conférences & savoirs
      city: "nice",
      capacity: 80,
    },
    {
      id: "evt-week-5",
      title: "Atelier Cuisine Niçoise",
      desc: "Apprends à faire la vraie socca, la ratatouille et la salade niçoise avec un chef local. Dégustation à la fin !",
      date: futureDate(5, 10, 0),
      endDate: futureDate(5, 13, 0),
      location: "Les Distilleries Idéales",
      address: "24 Place du Palais de Justice, 06300 Nice",
      lat: 43.6958, lng: 7.2768,
      price: 45, isFree: false,
      catId: "cat7", // Food & dégustations
      city: "nice",
      capacity: 10,
    },
    {
      id: "evt-week-6",
      title: "Ciné Plein Air : Le Grand Bleu",
      desc: "Projection en plein air du Grand Bleu sur la Coulée Verte. Apportez plaids et coussins. Pop-corn offert.",
      date: futureDate(5, 21, 0),
      endDate: futureDate(5, 23, 30),
      location: "Coulée Verte",
      address: "Coulée Verte, 06000 Nice",
      lat: 43.7000, lng: 7.2630,
      price: 0, isFree: true,
      catId: "cat2", // Arts & spectacles
      city: "nice",
      capacity: 200,
    },
    {
      id: "evt-week-7",
      title: "Randonnée Colline du Château",
      desc: "Rando guidée avec histoire de Nice, points de vue incroyables. RDV devant la Tour Bellanda. Prévoir eau et baskets.",
      date: futureDate(getNextSunday(), 9, 0),
      endDate: futureDate(getNextSunday(), 11, 30),
      location: "Colline du Château",
      address: "Montée du Château, 06300 Nice",
      lat: 43.6960, lng: 7.2820,
      price: 0, isFree: true,
      catId: "cat9", // Nature & découvertes
      city: "nice",
    },
    {
      id: "evt-week-8",
      title: "Friperie Éphémère",
      desc: "Pop-up friperie : pièces vintage triées, streetwear, y2k, workwear. Cash et CB acceptés.",
      date: futureDate(getNextSaturday(), 10, 0),
      endDate: futureDate(getNextSaturday(), 18, 0),
      location: "Espace Magnan",
      address: "31 Rue Louis de Coppet, 06200 Nice",
      lat: 43.6925, lng: 7.2440,
      price: 0, isFree: true,
      catId: "cat5", // Vie locale
      city: "nice",
    },
    {
      id: "evt-week-9",
      title: "Battle de Freestyle Rap",
      desc: "Battle MC en 1v1. Inscriptions à 19h, début des battles à 20h. Jury de 3 personnes. Cash prize pour le gagnant.",
      date: futureDate(getNextSaturday(), 20, 0),
      endDate: futureDate(getNextSaturday(), 23, 30),
      location: "La Trésorerie",
      address: "1 Rue de la Trésorerie, 06300 Nice",
      lat: 43.6970, lng: 7.2735,
      price: 5, isFree: false,
      catId: "cat1", // Musique & soirées
      city: "nice",
      capacity: 100,
    },
    {
      id: "evt-week-10",
      title: "Chasse au Trésor en Famille",
      desc: "Parcours d'énigmes dans le Vieux Nice. Adapté dès 6 ans. Équipes de 2 à 5 personnes. Lots pour tous les participants.",
      date: futureDate(getNextSunday(), 14, 0),
      endDate: futureDate(getNextSunday(), 16, 30),
      location: "Vieux Nice",
      address: "Place Rossetti, 06300 Nice",
      lat: 43.6965, lng: 7.2755,
      price: 10, isFree: false,
      catId: "cat8", // Famille & enfants
      city: "nice",
      capacity: 50,
    },
  ];

  const orgId = "user1"; // organizer account from seed

  for (const evt of events) {
    const q = `INSERT INTO "Event" ("id", "title", "description", "date", "endDate", "location", "address", "lat", "lng", "price", "isFree", "imageUrl", "status", "city", "categoryId", "organizerId", "capacity", "rsvpCount", "viewCount", "clickCount", "createdAt", "updatedAt")
    VALUES (
      '${evt.id}',
      '${esc(evt.title)}',
      '${esc(evt.desc)}',
      '${evt.date}',
      ${evt.endDate ? `'${evt.endDate}'` : 'NULL'},
      '${esc(evt.location)}',
      '${esc(evt.address)}',
      ${evt.lat},
      ${evt.lng},
      ${evt.price},
      ${evt.isFree},
      NULL,
      'APPROVED',
      '${evt.city}',
      '${evt.catId}',
      '${orgId}',
      ${evt.capacity || 'NULL'},
      ${Math.floor(Math.random() * 15)},
      ${Math.floor(Math.random() * 50) + 5},
      ${Math.floor(Math.random() * 20)},
      NOW(),
      NOW()
    ) ON CONFLICT ("id") DO UPDATE SET
      "title" = EXCLUDED."title",
      "date" = EXCLUDED."date",
      "endDate" = EXCLUDED."endDate",
      "status" = 'APPROVED',
      "updatedAt" = NOW()`;

    try {
      await runSQL(q);
      console.log(`  ✓ ${evt.title}`);
    } catch (e) {
      console.log(`  ✗ ${evt.title}: ${e.message}`);
    }
  }

  console.log(`\n✓ ${events.length} events seeded!`);
}

function esc(str) {
  return str.replace(/'/g, "''");
}

function getNextSaturday() {
  const d = new Date();
  const day = d.getDay();
  return day === 6 ? 0 : (6 - day);
}

function getNextSunday() {
  const d = new Date();
  const day = d.getDay();
  return day === 0 ? 0 : (7 - day);
}

main().catch(console.error);
