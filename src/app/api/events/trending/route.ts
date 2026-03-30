import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/events/trending — top 4 events by trending score, no auth required
export async function GET() {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);

    const events = await prisma.event.findMany({
      where: {
        status: "APPROVED",
        date: { gte: cutoff },
      },
      include: {
        category: true,
        _count: { select: { savedBy: true } },
      },
    });

    const scored = events
      .map((e) => ({
        ...e,
        score: e.viewCount * 1 + e.rsvpCount * 3 + e._count.savedBy * 2,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    return NextResponse.json(scored);
  } catch (error: any) {
    console.error("GET /api/events/trending error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
