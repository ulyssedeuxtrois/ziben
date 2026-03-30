import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      select: { id: true, categoryId: true, city: true },
    });

    if (!event) {
      return NextResponse.json([], { status: 200 });
    }

    const now = new Date();

    // 1. Same category, excluding current event
    const sameCategory = await prisma.event.findMany({
      where: {
        id: { not: event.id },
        categoryId: event.categoryId,
        status: "APPROVED",
        date: { gte: now },
      },
      orderBy: { date: "asc" },
      take: 4,
      include: { category: true },
    });

    let results = sameCategory;

    // 2. Fill with same city if less than 4
    if (results.length < 4) {
      const existingIds = [event.id, ...results.map((e) => e.id)];
      const sameCity = await prisma.event.findMany({
        where: {
          id: { notIn: existingIds },
          city: event.city,
          status: "APPROVED",
          date: { gte: now },
        },
        orderBy: { date: "asc" },
        take: 4 - results.length,
        include: { category: true },
      });
      results = [...results, ...sameCity];
    }

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
