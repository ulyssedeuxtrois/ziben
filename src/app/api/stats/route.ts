import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [
    eventCount,
    organizerCount,
    pushCount,
    rsvpAgg,
    viewAgg,
    recentEvents,
  ] = await Promise.all([
    prisma.event.count({ where: { status: "APPROVED" } }),
    prisma.user.count({ where: { role: "ORGANIZER" } }),
    prisma.pushSubscription.count(),
    prisma.event.aggregate({
      where: { status: "APPROVED" },
      _sum: { rsvpCount: true },
    }),
    prisma.event.aggregate({
      where: { status: "APPROVED" },
      _sum: { viewCount: true },
    }),
    prisma.event.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        date: true,
        category: { select: { icon: true, name: true } },
      },
    }),
  ]);

  return NextResponse.json({
    eventCount,
    organizerCount,
    pushCount,
    rsvpTotal: rsvpAgg._sum.rsvpCount ?? 0,
    viewTotal: viewAgg._sum.viewCount ?? 0,
    recentEvents,
  });
}
