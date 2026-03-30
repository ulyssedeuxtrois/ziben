import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/organizer/stats?userId=xxx
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId requis" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ORGANIZER") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const events = await prisma.event.findMany({
    where: { organizerId: userId },
    select: {
      id: true,
      title: true,
      date: true,
      viewCount: true,
      rsvpCount: true,
      status: true,
      _count: { select: { savedBy: true } },
    },
    orderBy: { viewCount: "desc" },
  });

  const now = new Date();
  const totalViews = events.reduce((sum, e) => sum + e.viewCount, 0);
  const totalRsvps = events.reduce((sum, e) => sum + e.rsvpCount, 0);
  const totalSaves = events.reduce((sum, e) => sum + e._count.savedBy, 0);
  const upcomingCount = events.filter((e) => new Date(e.date) > now).length;
  const pastCount = events.filter((e) => new Date(e.date) <= now).length;
  const bestEvent = events[0] ?? null;

  const viewsPerEvent = events
    .filter((e) => e.status === "APPROVED")
    .slice(0, 8)
    .map((e) => ({
      id: e.id,
      title: e.title.length > 24 ? e.title.slice(0, 22) + "…" : e.title,
      views: e.viewCount,
    }));

  return NextResponse.json({
    totalViews,
    totalRsvps,
    totalSaves,
    upcomingCount,
    pastCount,
    bestEvent: bestEvent
      ? { id: bestEvent.id, title: bestEvent.title, views: bestEvent.viewCount }
      : null,
    viewsPerEvent,
  });
}
