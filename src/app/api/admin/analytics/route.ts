import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin-auth";

// GET /api/admin/analytics — dashboard data
export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth.error) return auth.error;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Events par jour (30 derniers jours)
  const recentEvents = await prisma.event.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true, status: true },
    orderBy: { createdAt: "asc" },
  });

  // Agrégation par jour
  const eventsByDay: Record<string, { total: number; approved: number; pending: number }> = {};
  for (let d = 0; d < 30; d++) {
    const date = new Date(now.getTime() - (29 - d) * 24 * 60 * 60 * 1000);
    const key = date.toISOString().split("T")[0];
    eventsByDay[key] = { total: 0, approved: 0, pending: 0 };
  }
  for (const ev of recentEvents) {
    const key = new Date(ev.createdAt).toISOString().split("T")[0];
    if (eventsByDay[key]) {
      eventsByDay[key].total++;
      if (ev.status === "APPROVED") eventsByDay[key].approved++;
      if (ev.status === "PENDING") eventsByDay[key].pending++;
    }
  }

  // Top events par vues
  const topViewed = await prisma.event.findMany({
    where: { status: "APPROVED" },
    select: { id: true, title: true, viewCount: true, rsvpCount: true, clickCount: true },
    orderBy: { viewCount: "desc" },
    take: 10,
  });

  // Top events par RSVP
  const topRsvp = await prisma.event.findMany({
    where: { status: "APPROVED" },
    select: { id: true, title: true, rsvpCount: true, viewCount: true },
    orderBy: { rsvpCount: "desc" },
    take: 10,
  });

  // Users récents
  const recentUsers = await prisma.user.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true, role: true },
  });

  const usersByDay: Record<string, number> = {};
  for (let d = 0; d < 30; d++) {
    const date = new Date(now.getTime() - (29 - d) * 24 * 60 * 60 * 1000);
    usersByDay[date.toISOString().split("T")[0]] = 0;
  }
  for (const u of recentUsers) {
    const key = new Date(u.createdAt).toISOString().split("T")[0];
    if (usersByDay[key] !== undefined) usersByDay[key]++;
  }

  // Totaux
  const [totalEvents, totalUsers, totalOrganizers, totalPush] = await Promise.all([
    prisma.event.count({ where: { status: "APPROVED" } }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "ORGANIZER" } }),
    prisma.pushSubscription.count(),
  ]);

  const agg = await prisma.event.aggregate({
    where: { status: "APPROVED" },
    _sum: { viewCount: true, rsvpCount: true, clickCount: true },
  });

  return NextResponse.json({
    totals: {
      events: totalEvents,
      users: totalUsers,
      organizers: totalOrganizers,
      push: totalPush,
      views: agg._sum.viewCount || 0,
      rsvps: agg._sum.rsvpCount || 0,
      clicks: agg._sum.clickCount || 0,
    },
    eventsByDay: Object.entries(eventsByDay).map(([date, v]) => ({ date, ...v })),
    usersByDay: Object.entries(usersByDay).map(([date, count]) => ({ date, count })),
    topViewed,
    topRsvp,
  });
}
