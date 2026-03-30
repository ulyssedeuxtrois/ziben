import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ScrapedEvent {
  id: string;
  title: string;
  desc: string;
  date: string;
  end: string | null;
  location: string;
  address: string;
  lat: number;
  lng: number;
  price: number;
  isFree: boolean;
  cat: string;
  source: string;
  sourceUrl?: string;
}

export async function POST(req: NextRequest) {
  // Auth via secret header
  const secret = req.headers.get("x-import-secret");
  if (!secret || secret !== process.env.SCRAPER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { events }: { events: ScrapedEvent[] } = await req.json();
  if (!Array.isArray(events) || events.length === 0) {
    return NextResponse.json({ error: "No events" }, { status: 400 });
  }

  let inserted = 0, skipped = 0, errors = 0;

  for (const e of events) {
    try {
      // Skip if already exists (scraped id is deterministic)
      const exists = await prisma.event.findUnique({ where: { id: e.id }, select: { id: true } });
      if (exists) { skipped++; continue; }

      // Validate category exists
      const cat = await prisma.category.findUnique({ where: { id: e.cat }, select: { id: true } });
      const catId = cat ? e.cat : "cat5";

      await prisma.event.create({
        data: {
          id:          e.id,
          title:       e.title.slice(0, 200),
          description: e.desc || `Événement à Nice. Source : ${e.source}.`,
          date:        new Date(e.date),
          endDate:     e.end ? new Date(e.end) : null,
          location:    e.location.slice(0, 200),
          address:     e.address.slice(0, 300),
          lat:         e.lat,
          lng:         e.lng,
          price:       e.price,
          isFree:      e.isFree,
          status:      "APPROVED",
          city:        "nice",
          categoryId:  catId,
          organizerId: null,
          sourceUrl:   e.sourceUrl || null,
          rsvpCount:   0,
          viewCount:   0,
          clickCount:  0,
        },
      });

      inserted++;
    } catch {
      errors++;
    }
  }

  return NextResponse.json({ inserted, skipped, errors, total: events.length });
}
