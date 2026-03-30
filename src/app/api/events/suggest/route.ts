import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const now = new Date();

  const [byTitle, byLocation] = await Promise.all([
    prisma.event.findMany({
      where: {
        status: "APPROVED",
        date: { gte: now },
        title: { contains: q, mode: "insensitive" },
      },
      select: {
        id: true,
        title: true,
        location: true,
        date: true,
        category: { select: { icon: true } },
      },
      orderBy: { date: "asc" },
      take: 5,
    }),
    prisma.event.findMany({
      where: {
        status: "APPROVED",
        date: { gte: now },
        location: { contains: q, mode: "insensitive" },
      },
      select: {
        id: true,
        title: true,
        location: true,
        date: true,
        category: { select: { icon: true } },
      },
      orderBy: { date: "asc" },
      take: 3,
    }),
  ]);

  const seen = new Set<string>();
  const results: { id: string; title: string; location: string; categoryIcon: string; date: Date }[] = [];

  for (const event of [...byTitle, ...byLocation]) {
    if (seen.has(event.id)) continue;
    seen.add(event.id);
    results.push({
      id: event.id,
      title: event.title,
      location: event.location,
      categoryIcon: event.category.icon,
      date: event.date,
    });
  }

  return NextResponse.json(results);
}
